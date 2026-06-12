import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../lib/error-handler.js'
import { AuditLogger } from '../lib/audit-log.js'
import { requireSuperAdmin, requireFacilityAdmin } from '../middleware/auth.js'

// Validation schemas
const createFacilitySchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(50),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
  licenseNumber: z.string().optional()
})

const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['FACILITY_ADMIN', 'COUNSELOR']),
  facilityId: z.string(),
  phone: z.string().optional()
})

export async function adminRoutes(fastify: FastifyInstance) {
  // =====================================
  // Super Admin Routes
  // =====================================

  /**
   * GET /admin/stats
   * System-wide statistics
   */
  fastify.get('/stats', { preHandler: [requireSuperAdmin] }, async (request: FastifyRequest) => {
    const [
      totalFacilities,
      activeFacilities,
      totalPatients,
      activePatients,
      totalStaff,
      totalCheckIns
    ] = await Promise.all([
      prisma.facility.count(),
      prisma.facility.count({ where: { status: 'ACTIVE' } }),
      prisma.patient.count(),
      prisma.patient.count({ where: { status: 'ACTIVE' } }),
      prisma.staff.count(),
      prisma.checkIn.count()
    ])

    return {
      success: true,
      stats: {
        totalFacilities,
        activeFacilities,
        totalPatients,
        activePatients,
        totalStaff,
        totalCheckIns
      }
    }
  })

  /**
   * GET /admin/facilities
   * List all facilities
   */
  fastify.get('/facilities', { preHandler: [requireSuperAdmin] }, async (request: FastifyRequest) => {
    const query = z.object({
      status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']).optional()
    }).parse(request.query)

    const where = query.status ? { status: query.status } : {}

    const facilities = await prisma.facility.findMany({
      where,
      include: {
        _count: {
          select: { staff: true, patients: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      facilities: facilities.map(f => ({
        ...f,
        staffCount: f._count.staff,
        patientCount: f._count.patients
      }))
    }
  })

  /**
   * GET /admin/facilities/:id
   * Get facility details
   */
  fastify.get('/facilities/:id', { preHandler: [requireSuperAdmin] }, async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }

    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true
          }
        },
        _count: {
          select: { patients: true, treatmentPlans: true }
        }
      }
    })

    if (!facility) {
      throw ApiError.notFound('Facility not found')
    }

    return { success: true, facility }
  })

  /**
   * POST /admin/facilities
   * Create new facility
   */
  fastify.post('/facilities', { preHandler: [requireSuperAdmin] }, async (request: FastifyRequest) => {
    const body = createFacilitySchema.parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    const facility = await prisma.facility.create({
      data: body
    })

    await audit.log({
      action: 'FACILITY_CREATE',
      resourceType: 'facility',
      resourceId: facility.id,
      description: `Created facility: ${facility.name}`
    })

    return { success: true, facility }
  })

  /**
   * PUT /admin/facilities/:id
   * Update facility
   */
  fastify.put('/facilities/:id', { preHandler: [requireSuperAdmin] }, async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const body = createFacilitySchema.partial().parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    const facility = await prisma.facility.update({
      where: { id },
      data: body
    })

    await audit.log({
      action: 'FACILITY_UPDATE',
      resourceType: 'facility',
      resourceId: id,
      description: `Updated facility: ${facility.name}`
    })

    return { success: true, facility }
  })

  /**
   * POST /admin/facilities/:id/suspend
   * Suspend facility
   */
  fastify.post('/facilities/:id/suspend', { preHandler: [requireSuperAdmin] }, async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    await prisma.facility.update({
      where: { id },
      data: { status: 'SUSPENDED' }
    })

    await audit.log({
      action: 'FACILITY_UPDATE',
      resourceType: 'facility',
      resourceId: id,
      description: 'Suspended facility'
    })

    return { success: true, message: 'Facility suspended' }
  })

  // =====================================
  // Staff Management (Facility Admin+)
  // =====================================

  /**
   * GET /admin/staff
   * List staff (filtered by facility for non-super-admins)
   */
  fastify.get('/staff', { preHandler: [requireFacilityAdmin] }, async (request: FastifyRequest) => {
    const user = request.staffUser!
    const query = z.object({
      facilityId: z.string().optional(),
      role: z.enum(['SUPER_ADMIN', 'FACILITY_ADMIN', 'COUNSELOR']).optional()
    }).parse(request.query)

    const where: any = {}

    if (user.role !== 'SUPER_ADMIN') {
      where.facilityId = user.facilityId
    } else if (query.facilityId) {
      where.facilityId = query.facilityId
    }

    if (query.role) {
      where.role = query.role
    }

    const staff = await prisma.staff.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        status: true,
        lastLoginAt: true,
        facility: {
          select: { id: true, name: true }
        }
      },
      orderBy: { lastName: 'asc' }
    })

    return { success: true, staff }
  })

  /**
   * POST /admin/staff
   * Create new staff member
   */
  fastify.post('/staff', { preHandler: [requireFacilityAdmin] }, async (request: FastifyRequest) => {
    const body = createStaffSchema.parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Check facility access
    if (user.role !== 'SUPER_ADMIN' && user.facilityId !== body.facilityId) {
      throw ApiError.forbidden('Cannot create staff for other facilities')
    }

    // Facility admins can only create counselors
    if (user.role === 'FACILITY_ADMIN' && body.role !== 'COUNSELOR') {
      throw ApiError.forbidden('Facility admins can only create counselors')
    }

    // Check for existing email
    const existing = await prisma.staff.findUnique({
      where: { email: body.email.toLowerCase() }
    })

    if (existing) {
      throw ApiError.conflict('Email already in use')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 12)

    const staff = await prisma.staff.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        facilityId: body.facilityId,
        phone: body.phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        status: true
      }
    })

    await audit.log({
      action: 'STAFF_CREATE',
      resourceType: 'staff',
      resourceId: staff.id,
      description: `Created staff member: ${staff.firstName} ${staff.lastName}`
    })

    return { success: true, staff }
  })

  /**
   * POST /admin/staff/:id/deactivate
   * Deactivate staff member
   */
  fastify.post('/staff/:id/deactivate', { preHandler: [requireFacilityAdmin] }, async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    const staff = await prisma.staff.findUnique({
      where: { id },
      select: { facilityId: true }
    })

    if (!staff) {
      throw ApiError.notFound('Staff member not found')
    }

    if (user.role !== 'SUPER_ADMIN' && user.facilityId !== staff.facilityId) {
      throw ApiError.forbidden('Access denied')
    }

    // Can't deactivate yourself
    if (id === user.id) {
      throw ApiError.badRequest('Cannot deactivate your own account')
    }

    await prisma.staff.update({
      where: { id },
      // Bump tokenVersion so any outstanding access token is rejected at the
      // next request (requireStaff re-check), not just at expiry.
      data: { status: 'INACTIVE', tokenVersion: { increment: 1 } }
    })

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { staffId: id },
      data: { revokedAt: new Date() }
    })

    await audit.log({
      action: 'STAFF_DEACTIVATE',
      resourceType: 'staff',
      resourceId: id,
      description: 'Deactivated staff member'
    })

    return { success: true, message: 'Staff member deactivated' }
  })

  /**
   * GET /admin/activity
   * Get recent audit log activity
   */
  fastify.get('/activity', { preHandler: [requireSuperAdmin] }, async (request: FastifyRequest) => {
    const query = z.object({
      limit: z.coerce.number().min(1).max(100).default(20)
    }).parse(request.query)

    const activities = await prisma.auditLog.findMany({
      include: {
        staff: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: query.limit
    })

    return { success: true, activities }
  })

  /**
   * GET /admin/analytics
   * Get system analytics
   */
  fastify.get('/analytics', { preHandler: [requireSuperAdmin] }, async (request: FastifyRequest) => {
    const query = z.object({
      timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d')
    }).parse(request.query)

    const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[query.timeframe]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get check-in trend
    const checkInsByDay = await prisma.$queryRaw`
      SELECT DATE(date) as day, COUNT(*) as count, AVG(mood) as avg_mood
      FROM check_ins
      WHERE date >= ${startDate}
      GROUP BY DATE(date)
      ORDER BY day ASC
    ` as any[]

    // Get new patient count
    const newPatients = await prisma.patient.count({
      where: { createdAt: { gte: startDate } }
    })

    // Get discharge count
    const discharges = await prisma.patient.count({
      where: {
        status: 'DISCHARGED',
        dischargeDate: { gte: startDate }
      }
    })

    return {
      success: true,
      analytics: {
        timeframe: query.timeframe,
        checkInTrend: checkInsByDay,
        newPatients,
        discharges,
        retentionRate: newPatients > 0
          ? Math.round((1 - discharges / newPatients) * 100)
          : 100
      }
    }
  })
}
