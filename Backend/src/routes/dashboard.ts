import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { requireStaff } from '../middleware/auth.js'

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireStaff)

  /**
   * GET /dashboard/stats
   * Get dashboard statistics for current user's facility
   */
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.staffUser!

    // Build where clause for facility
    const facilityWhere = user.role === 'SUPER_ADMIN' ? {} : { facilityId: user.facilityId! }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch all stats in parallel
    const [
      totalPatients,
      activePatients,
      pendingAdmissions,
      checkInsToday,
      alertsCount,
      avgMoodResult
    ] = await Promise.all([
      // Total patients
      prisma.patient.count({ where: facilityWhere }),

      // Active patients
      prisma.patient.count({
        where: { ...facilityWhere, status: 'ACTIVE' }
      }),

      // Pending admissions
      prisma.patient.count({
        where: { ...facilityWhere, status: 'PENDING' }
      }),

      // Check-ins today
      prisma.checkIn.count({
        where: {
          patient: facilityWhere,
          date: { gte: today, lt: tomorrow }
        }
      }),

      // High-intensity cravings (alerts) in last 7 days
      prisma.craving.count({
        where: {
          patient: facilityWhere,
          intensity: { gte: 7 },
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),

      // Average mood from recent check-ins
      prisma.checkIn.aggregate({
        where: {
          patient: facilityWhere,
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        _avg: { mood: true }
      })
    ])

    // Calculate average days sober
    const patientsWithSobriety = await prisma.patient.findMany({
      where: { ...facilityWhere, status: 'ACTIVE' },
      select: { sobrietyDate: true }
    })

    const avgDaysSober = patientsWithSobriety.length > 0
      ? Math.round(
        patientsWithSobriety.reduce((sum, p) => {
          const days = Math.floor((today.getTime() - new Date(p.sobrietyDate).getTime()) / (1000 * 60 * 60 * 24))
          return sum + Math.max(0, days)
        }, 0) / patientsWithSobriety.length
      )
      : 0

    return {
      success: true,
      stats: {
        totalPatients,
        activePatients,
        pendingAdmissions,
        checkInsToday,
        alertsCount,
        avgDaysSober,
        avgMood: avgMoodResult._avg.mood ?? 0
      }
    }
  })

  /**
   * GET /dashboard/appointments
   * Get today's appointments
   */
  fastify.get('/appointments', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.staffUser!

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // For counselors, show their appointments; for admins, show facility appointments
    const where: any = {
      startTime: { gte: today, lt: tomorrow }
    }

    if (user.role === 'COUNSELOR') {
      where.staffId = user.id
    } else if (user.role !== 'SUPER_ADMIN') {
      where.facilityId = user.facilityId
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      take: 10
    })

    // Get patient names for appointments
    const patientIds = [...new Set(appointments.map(a => a.patientId))]
    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, firstName: true, lastName: true }
    })

    const patientMap = new Map(patients.map(p => [p.id, p]))

    return {
      success: true,
      appointments: appointments.map(a => ({
        ...a,
        patient: patientMap.get(a.patientId)
      }))
    }
  })

  /**
   * GET /dashboard/recent-messages
   * Get recent unread messages
   */
  fastify.get('/recent-messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.staffUser!

    const messages = await prisma.message.findMany({
      where: {
        staffId: user.id,
        senderType: 'PATIENT',
        readAt: null
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: 5
    })

    return {
      success: true,
      messages
    }
  })

  /**
   * GET /dashboard/alerts
   * Get recent alerts (high cravings, missed check-ins, etc.)
   */
  fastify.get('/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.staffUser!

    const facilityWhere = user.role === 'SUPER_ADMIN' ? {} : { facilityId: user.facilityId! }

    // Get high-intensity cravings from last 48 hours
    const highCravings = await prisma.craving.findMany({
      where: {
        patient: facilityWhere,
        intensity: { gte: 7 },
        date: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 10
    })

    // Get low mood check-ins from last 48 hours
    const lowMoodCheckIns = await prisma.checkIn.findMany({
      where: {
        patient: facilityWhere,
        mood: { lte: 3 },
        date: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 10
    })

    // Get patient-initiated SOS (urgent) messages from last 48 hours.
    // Unread only: once the counselor opens the conversation the messages are
    // marked read, so an acknowledged SOS drops off the triage panel.
    const sosMessages = await prisma.message.findMany({
      where: {
        patient: facilityWhere,
        senderType: 'PATIENT',
        priority: 'URGENT',
        readAt: null,
        sentAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: 10
    })

    // Combine and format alerts
    const alerts = [
      ...sosMessages.map(m => ({
        id: `sos-${m.id}`,
        type: 'sos' as const,
        severity: 'critical' as const,
        patientId: m.patient.id,
        patientName: `${m.patient.firstName} ${m.patient.lastName}`,
        title: 'SOS — Patient requested urgent help',
        description: m.content.slice(0, 200),
        timestamp: m.sentAt
      })),
      ...highCravings.map(c => ({
        id: `craving-${c.id}`,
        type: 'high_craving' as const,
        severity: 'high' as const,
        patientId: c.patient.id,
        patientName: `${c.patient.firstName} ${c.patient.lastName}`,
        title: `High Craving Alert (${c.intensity}/10)`,
        description: c.trigger ?? 'Unknown trigger',
        timestamp: c.date
      })),
      ...lowMoodCheckIns.map(ci => ({
        id: `mood-${ci.id}`,
        type: 'low_mood' as const,
        severity: ci.mood <= 2 ? 'critical' as const : 'medium' as const,
        patientId: ci.patient.id,
        patientName: `${ci.patient.firstName} ${ci.patient.lastName}`,
        title: `Low Mood Alert (${ci.mood}/10)`,
        description: ci.notes ?? '',
        timestamp: ci.date
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      success: true,
      alerts: alerts.slice(0, 15)
    }
  })
}
