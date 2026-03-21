import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../lib/error-handler.js'
import { AuditLogger } from '../lib/audit-log.js'
import { requireStaff, requireFacilityAdmin } from '../middleware/auth.js'

// Validation schemas
const phaseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  duration: z.number().int().min(1),
  durationUnit: z.enum(['DAYS', 'WEEKS', 'MONTHS']),
  goals: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([])
})

const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  duration: z.number().int().min(1),
  durationUnit: z.enum(['DAYS', 'WEEKS', 'MONTHS']),
  phases: z.array(phaseSchema).min(1),
  facilityId: z.string()
})

const updatePlanSchema = createPlanSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional()
})

const assignPlanSchema = z.object({
  patientId: z.string(),
  treatmentPlanId: z.string(),
  startDate: z.string().datetime()
})

export async function treatmentPlanRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireStaff)

  /**
   * GET /treatment-plans
   * List treatment plans for facility
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.staffUser!
    const query = z.object({
      facilityId: z.string().optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional()
    }).parse(request.query)

    // Build where clause
    const where: any = {}

    if (user.role !== 'SUPER_ADMIN') {
      where.facilityId = user.facilityId
    } else if (query.facilityId) {
      where.facilityId = query.facilityId
    }

    if (query.status) {
      where.status = query.status
    }

    const plans = await prisma.treatmentPlan.findMany({
      where,
      include: {
        phases: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { assignments: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      treatmentPlans: plans.map(p => ({
        ...p,
        assignedCount: p._count.assignments
      }))
    }
  })

  /**
   * GET /treatment-plans/:id
   * Get single treatment plan with phases
   */
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    const plan = await prisma.treatmentPlan.findUnique({
      where: { id },
      include: {
        phases: { orderBy: { orderIndex: 'asc' } },
        facility: { select: { id: true, name: true } },
        assignments: {
          include: {
            patient: {
              select: { id: true, firstName: true, lastName: true, status: true }
            }
          }
        }
      }
    })

    if (!plan) {
      throw ApiError.notFound('Treatment plan not found')
    }

    // Check facility access
    if (user.role !== 'SUPER_ADMIN' && user.facilityId !== plan.facilityId) {
      throw ApiError.forbidden('Access denied to this treatment plan')
    }

    await audit.treatmentView(id)

    return {
      success: true,
      treatmentPlan: plan
    }
  })

  /**
   * POST /treatment-plans
   * Create new treatment plan
   */
  fastify.post('/', { preHandler: [requireFacilityAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createPlanSchema.parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Check facility access
    if (user.role !== 'SUPER_ADMIN' && user.facilityId !== body.facilityId) {
      throw ApiError.forbidden('Cannot create plans for other facilities')
    }

    const plan = await prisma.treatmentPlan.create({
      data: {
        name: body.name,
        description: body.description,
        duration: body.duration,
        durationUnit: body.durationUnit,
        facilityId: body.facilityId,
        createdById: user.id,
        status: 'DRAFT',
        phases: {
          create: body.phases.map((phase, index) => ({
            ...phase,
            orderIndex: index
          }))
        }
      },
      include: {
        phases: { orderBy: { orderIndex: 'asc' } }
      }
    })

    await audit.log({
      action: 'TREATMENT_CREATE',
      resourceType: 'treatment_plan',
      resourceId: plan.id,
      description: `Created treatment plan: ${plan.name}`
    })

    return {
      success: true,
      treatmentPlan: plan
    }
  })

  /**
   * PUT /treatment-plans/:id
   * Update treatment plan
   */
  fastify.put('/:id', { preHandler: [requireFacilityAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const body = updatePlanSchema.parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    const existing = await prisma.treatmentPlan.findUnique({
      where: { id },
      select: { facilityId: true }
    })

    if (!existing) {
      throw ApiError.notFound('Treatment plan not found')
    }

    if (user.role !== 'SUPER_ADMIN' && user.facilityId !== existing.facilityId) {
      throw ApiError.forbidden('Access denied to this treatment plan')
    }

    // If phases are provided, replace all phases
    const plan = await prisma.$transaction(async (tx) => {
      // Delete existing phases if new ones provided
      if (body.phases) {
        await tx.treatmentPhase.deleteMany({ where: { treatmentPlanId: id } })
      }

      return tx.treatmentPlan.update({
        where: { id },
        data: {
          name: body.name,
          description: body.description,
          duration: body.duration,
          durationUnit: body.durationUnit,
          status: body.status,
          ...(body.phases && {
            phases: {
              create: body.phases.map((phase, index) => ({
                ...phase,
                orderIndex: index
              }))
            }
          })
        },
        include: {
          phases: { orderBy: { orderIndex: 'asc' } }
        }
      })
    })

    await audit.log({
      action: 'TREATMENT_UPDATE',
      resourceType: 'treatment_plan',
      resourceId: id,
      description: `Updated treatment plan: ${plan.name}`
    })

    return {
      success: true,
      treatmentPlan: plan
    }
  })

  /**
   * POST /treatment-plans/assign
   * Assign treatment plan to patient
   */
  fastify.post('/assign', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = assignPlanSchema.parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Verify patient and plan exist and are accessible
    const [patient, plan] = await Promise.all([
      prisma.patient.findUnique({
        where: { id: body.patientId },
        select: { facilityId: true }
      }),
      prisma.treatmentPlan.findUnique({
        where: { id: body.treatmentPlanId },
        select: { facilityId: true, status: true }
      })
    ])

    if (!patient) throw ApiError.notFound('Patient not found')
    if (!plan) throw ApiError.notFound('Treatment plan not found')

    if (plan.status !== 'ACTIVE') {
      throw ApiError.badRequest('Can only assign active treatment plans')
    }

    if (user.role !== 'SUPER_ADMIN') {
      if (user.facilityId !== patient.facilityId || user.facilityId !== plan.facilityId) {
        throw ApiError.forbidden('Access denied')
      }
    }

    // Create or update assignment
    const assignment = await prisma.treatmentAssignment.upsert({
      where: { patientId: body.patientId },
      create: {
        patientId: body.patientId,
        treatmentPlanId: body.treatmentPlanId,
        startDate: new Date(body.startDate),
        currentPhaseIndex: 0,
        status: 'ACTIVE'
      },
      update: {
        treatmentPlanId: body.treatmentPlanId,
        startDate: new Date(body.startDate),
        currentPhaseIndex: 0,
        status: 'ACTIVE',
        completedAt: null
      }
    })

    await audit.treatmentAssign(body.patientId, body.treatmentPlanId)

    return {
      success: true,
      assignment
    }
  })

  /**
   * DELETE /treatment-plans/:id
   * Archive treatment plan
   */
  fastify.delete('/:id', { preHandler: [requireFacilityAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const user = request.staffUser!

    const plan = await prisma.treatmentPlan.findUnique({
      where: { id },
      select: { facilityId: true }
    })

    if (!plan) throw ApiError.notFound('Treatment plan not found')

    if (user.role !== 'SUPER_ADMIN' && user.facilityId !== plan.facilityId) {
      throw ApiError.forbidden('Access denied')
    }

    await prisma.treatmentPlan.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    })

    return { success: true, message: 'Treatment plan archived' }
  })
}
