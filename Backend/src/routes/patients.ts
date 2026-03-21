import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../lib/error-handler.js'
import { AuditLogger } from '../lib/audit-log.js'
import { requireStaff, canAccessPatient } from '../middleware/auth.js'
import { config } from '../config/env.js'

// Validation schemas
const createPatientSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().datetime(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  admissionDate: z.string().datetime(),
  sobrietyDate: z.string().datetime(),
  substancesOfChoice: z.array(z.string()).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  assignedCounselorId: z.string().optional(),
  facilityId: z.string()
})

const updatePatientSchema = createPatientSchema.partial().extend({
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'DISCHARGED']).optional(),
  dischargeDate: z.string().datetime().optional(),
  dischargeReason: z.string().optional()
})

const listPatientsSchema = z.object({
  facilityId: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'DISCHARGED']).optional(),
  counselorId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

// PHI fields for audit logging
const PHI_FIELDS = ['firstName', 'lastName', 'dateOfBirth', 'phone', 'email', 'substancesOfChoice']

export async function patientRoutes(fastify: FastifyInstance) {
  // All routes require staff authentication
  fastify.addHook('preHandler', requireStaff)

  /**
   * GET /patients
   * List patients with filtering and pagination
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listPatientsSchema.parse(request.query)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Build where clause
    const where: any = {}

    // Facility filter (required for non-super-admins)
    if (user.role !== 'SUPER_ADMIN') {
      where.facilityId = user.facilityId
    } else if (query.facilityId) {
      where.facilityId = query.facilityId
    }

    // Status filter
    if (query.status) {
      where.status = query.status
    }

    // Counselor filter
    if (query.counselorId) {
      where.assignedCounselorId = query.counselorId
    }

    // Search filter
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    // Get total count and patients
    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        include: {
          assignedCounselor: {
            select: { id: true, firstName: true, lastName: true }
          },
          facility: {
            select: { id: true, name: true }
          },
          checkIns: {
            orderBy: { date: 'desc' },
            take: 1,
            select: { mood: true, date: true }
          }
        },
        orderBy: { lastName: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      })
    ])

    // Audit log
    await audit.patientSearch(query.search ?? '', patients.length)

    // Calculate derived fields
    const patientsWithStats = patients.map(p => {
      const today = new Date()
      const sobrietyDate = new Date(p.sobrietyDate)
      const daysSober = Math.floor((today.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        phone: p.phone,
        email: p.email,
        status: p.status,
        admissionDate: p.admissionDate,
        sobrietyDate: p.sobrietyDate,
        daysSober: Math.max(0, daysSober),
        substancesOfChoice: p.substancesOfChoice,
        assignedCounselor: p.assignedCounselor,
        facility: p.facility,
        lastCheckIn: p.checkIns[0] ?? null
      }
    })

    return {
      success: true,
      patients: patientsWithStats,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit)
    }
  })

  /**
   * GET /patients/:id
   * Get single patient with full details
   */
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        assignedCounselor: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        facility: {
          select: { id: true, name: true, phone: true }
        },
        registrationKey: {
          select: { key: true, expiresAt: true, usedAt: true }
        },
        treatmentAssignment: {
          include: {
            treatmentPlan: {
              include: {
                phases: { orderBy: { orderIndex: 'asc' } }
              }
            }
          }
        }
      }
    })

    if (!patient) {
      throw ApiError.notFound('Patient not found')
    }

    // Check access
    const hasAccess = await canAccessPatient(user, patient.facilityId, patient.assignedCounselorId)
    if (!hasAccess) {
      throw ApiError.forbidden('Access denied to this patient')
    }

    // Audit log
    await audit.patientView(id, PHI_FIELDS)

    // Calculate stats
    const today = new Date()
    const sobrietyDate = new Date(patient.sobrietyDate)
    const daysSober = Math.max(0, Math.floor((today.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24)))

    // Get check-in stats
    const checkInStats = await prisma.checkIn.aggregate({
      where: { patientId: id },
      _count: true,
      _avg: { mood: true }
    })

    return {
      success: true,
      patient: {
        ...patient,
        daysSober,
        totalCheckIns: checkInStats._count,
        averageMood: checkInStats._avg.mood
      }
    }
  })

  /**
   * GET /patients/:id/dashboard
   * Get patient dashboard data (timeline, recent check-ins, etc.)
   */
  fastify.get('/:id/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { facilityId: true, assignedCounselorId: true, sobrietyDate: true }
    })

    if (!patient) {
      throw ApiError.notFound('Patient not found')
    }

    const hasAccess = await canAccessPatient(user, patient.facilityId, patient.assignedCounselorId)
    if (!hasAccess) {
      throw ApiError.forbidden('Access denied to this patient')
    }

    // Fetch dashboard data in parallel
    const [recentCheckIns, recentCravings, treatmentAssignment, goals] = await Promise.all([
      prisma.checkIn.findMany({
        where: { patientId: id },
        orderBy: { date: 'desc' },
        take: 14 // Last 2 weeks
      }),
      prisma.craving.findMany({
        where: { patientId: id },
        orderBy: { date: 'desc' },
        take: 10
      }),
      prisma.treatmentAssignment.findUnique({
        where: { patientId: id },
        include: {
          treatmentPlan: {
            include: { phases: { orderBy: { orderIndex: 'asc' } } }
          }
        }
      }),
      prisma.patientGoal.findMany({
        where: { patientId: id, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    // Build timeline events
    const timeline = buildTimeline(patient.sobrietyDate, recentCheckIns, recentCravings, treatmentAssignment)

    // Audit log
    await audit.patientView(id, ['checkIns', 'cravings', 'treatment', 'goals'])

    return {
      success: true,
      dashboard: {
        recentCheckIns,
        recentCravings,
        treatmentAssignment,
        goals,
        timeline
      }
    }
  })

  /**
   * POST /patients
   * Create new patient
   */
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createPatientSchema.parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Check facility access
    if (user.role !== 'SUPER_ADMIN' && user.facilityId !== body.facilityId) {
      throw ApiError.forbidden('Cannot create patients in other facilities')
    }

    // Create patient with registration key
    const registrationKey = generateRegistrationKey()
    const keyExpiresAt = new Date(Date.now() + config.REGISTRATION_KEY_EXPIRES_HOURS * 60 * 60 * 1000)

    const patient = await prisma.patient.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        phone: body.phone,
        email: body.email,
        admissionDate: new Date(body.admissionDate),
        sobrietyDate: new Date(body.sobrietyDate),
        substancesOfChoice: body.substancesOfChoice ?? [],
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelationship: body.emergencyContactRelationship,
        facilityId: body.facilityId,
        assignedCounselorId: body.assignedCounselorId,
        status: 'PENDING',
        registrationKey: {
          create: {
            key: registrationKey,
            expiresAt: keyExpiresAt,
            createdById: user.id
          }
        }
      },
      include: {
        registrationKey: true,
        assignedCounselor: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    // Audit log
    await audit.patientCreate(patient.id)

    return {
      success: true,
      patient,
      message: 'Patient created successfully'
    }
  })

  /**
   * PUT /patients/:id
   * Update patient
   */
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const body = updatePatientSchema.parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Check patient exists and access
    const existing = await prisma.patient.findUnique({
      where: { id },
      select: { facilityId: true, assignedCounselorId: true }
    })

    if (!existing) {
      throw ApiError.notFound('Patient not found')
    }

    const hasAccess = await canAccessPatient(user, existing.facilityId, existing.assignedCounselorId)
    if (!hasAccess) {
      throw ApiError.forbidden('Access denied to this patient')
    }

    // Build update data
    const updateData: any = { ...body }
    if (body.dateOfBirth) updateData.dateOfBirth = new Date(body.dateOfBirth)
    if (body.admissionDate) updateData.admissionDate = new Date(body.admissionDate)
    if (body.sobrietyDate) updateData.sobrietyDate = new Date(body.sobrietyDate)
    if (body.dischargeDate) updateData.dischargeDate = new Date(body.dischargeDate)

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
      include: {
        assignedCounselor: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    // Audit log
    const updatedFields = Object.keys(body).filter(k => body[k as keyof typeof body] !== undefined)
    await audit.patientUpdate(id, updatedFields)

    return {
      success: true,
      patient,
      message: 'Patient updated successfully'
    }
  })

  /**
   * POST /patients/:id/regenerate-key
   * Generate new registration key for patient
   */
  fastify.post('/:id/regenerate-key', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const user = request.staffUser!

    // Check patient exists and access
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { facilityId: true, assignedCounselorId: true }
    })

    if (!patient) {
      throw ApiError.notFound('Patient not found')
    }

    const hasAccess = await canAccessPatient(user, patient.facilityId, patient.assignedCounselorId)
    if (!hasAccess) {
      throw ApiError.forbidden('Access denied to this patient')
    }

    // Generate new key
    const registrationKey = generateRegistrationKey()
    const keyExpiresAt = new Date(Date.now() + config.REGISTRATION_KEY_EXPIRES_HOURS * 60 * 60 * 1000)

    // Upsert registration key
    const key = await prisma.registrationKey.upsert({
      where: { patientId: id },
      create: {
        key: registrationKey,
        patientId: id,
        expiresAt: keyExpiresAt,
        createdById: user.id
      },
      update: {
        key: registrationKey,
        expiresAt: keyExpiresAt,
        usedAt: null
      }
    })

    return {
      success: true,
      registrationKey: key.key,
      expiresAt: key.expiresAt,
      message: 'New registration key generated'
    }
  })

  /**
   * DELETE /patients/:id
   * Archive patient (soft delete)
   */
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Only facility admins and super admins can delete
    if (user.role === 'COUNSELOR') {
      throw ApiError.forbidden('Insufficient permissions to delete patients')
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { facilityId: true }
    })

    if (!patient) {
      throw ApiError.notFound('Patient not found')
    }

    if (user.role !== 'SUPER_ADMIN' && user.facilityId !== patient.facilityId) {
      throw ApiError.forbidden('Access denied to this patient')
    }

    // Soft delete - mark as inactive
    await prisma.patient.update({
      where: { id },
      data: { status: 'INACTIVE' }
    })

    // Audit log
    await audit.log({
      action: 'PATIENT_DELETE',
      resourceType: 'patient',
      resourceId: id,
      description: 'Patient archived'
    })

    return {
      success: true,
      message: 'Patient archived successfully'
    }
  })
}

// Helper functions

function generateRegistrationKey(): string {
  // Generate a user-friendly key: XXXX-XXXX-XXXX (alphanumeric, no confusing chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No 0, O, I, 1
  const segments = []
  for (let s = 0; s < 3; s++) {
    let segment = ''
    for (let i = 0; i < 4; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(segment)
  }
  return segments.join('-')
}

function buildTimeline(
  sobrietyDate: Date,
  checkIns: any[],
  cravings: any[],
  treatmentAssignment: any
): any[] {
  const events: any[] = []

  // Add milestones
  const today = new Date()
  const daysSober = Math.floor((today.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24))

  const milestones = [1, 7, 14, 30, 60, 90, 180, 365]
  for (const days of milestones) {
    if (daysSober >= days) {
      const milestoneDate = new Date(sobrietyDate.getTime() + days * 24 * 60 * 60 * 1000)
      events.push({
        id: `milestone-${days}`,
        date: milestoneDate.toISOString(),
        type: 'milestone',
        title: `${days} Days Sober!`,
        description: `Reached ${days} day milestone`
      })
    }
  }

  // Add recent check-ins
  for (const checkIn of checkIns.slice(0, 5)) {
    events.push({
      id: `checkin-${checkIn.id}`,
      date: checkIn.date,
      type: 'check-in',
      title: `Daily Check-in: Mood ${checkIn.mood}/10`,
      description: checkIn.notes ?? ''
    })
  }

  // Add high-intensity cravings as alerts
  for (const craving of cravings) {
    if (craving.intensity >= 7) {
      events.push({
        id: `craving-${craving.id}`,
        date: craving.date,
        type: 'alert',
        title: `High Craving Alert (${craving.intensity}/10)`,
        description: craving.trigger ?? 'Unknown trigger'
      })
    }
  }

  // Add treatment phase
  if (treatmentAssignment?.treatmentPlan?.phases) {
    const currentPhase = treatmentAssignment.treatmentPlan.phases[treatmentAssignment.currentPhaseIndex]
    if (currentPhase) {
      events.push({
        id: `phase-${currentPhase.id}`,
        date: treatmentAssignment.startDate,
        type: 'phase',
        title: `Phase ${treatmentAssignment.currentPhaseIndex + 1}: ${currentPhase.name}`,
        description: currentPhase.description ?? ''
      })
    }
  }

  // Sort by date descending
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
