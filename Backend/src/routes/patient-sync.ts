import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../lib/error-handler.js'
import { AuditLogger } from '../lib/audit-log.js'
import { requirePatient } from '../middleware/auth.js'
import { broadcastToUser } from '../websocket/handler.js'

/**
 * Patient Sync Routes
 *
 * These routes are used by the Recover mobile app to sync patient data
 * with the facility backend. Data flows from patient device → backend.
 */

// Validation schemas
const checkInSchema = z.object({
  date: z.string().datetime(),
  mood: z.number().int().min(1).max(10),
  notes: z.string().optional(),
  haltHungry: z.number().int().min(1).max(10).optional(),
  haltAngry: z.number().int().min(1).max(10).optional(),
  haltLonely: z.number().int().min(1).max(10).optional(),
  haltTired: z.number().int().min(1).max(10).optional(),
  hoursSlept: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(10).optional(),
  exerciseMinutes: z.number().int().min(0).optional()
})

const cravingSchema = z.object({
  date: z.string().datetime(),
  intensity: z.number().int().min(1).max(10),
  trigger: z.string().optional(),
  triggerNotes: z.string().optional(),
  copingStrategy: z.string().optional(),
  overcame: z.boolean(),
  haltHungry: z.number().int().min(1).max(10).optional(),
  haltAngry: z.number().int().min(1).max(10).optional(),
  haltLonely: z.number().int().min(1).max(10).optional(),
  haltTired: z.number().int().min(1).max(10).optional()
})

const goalSchema = z.object({
  recoverGoalId: z.string(), // ID from Recover app
  title: z.string(),
  description: z.string().optional(),
  category: z.enum(['RECOVERY', 'WELLNESS', 'PERSONAL', 'SOCIAL']),
  targetType: z.enum(['NUMERICAL', 'YES_NO', 'STREAK']),
  targetValue: z.number().int().optional(),
  currentValue: z.number().int(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ONE_TIME']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean(),
  isCompleted: z.boolean()
})

const batchSyncSchema = z.object({
  checkIns: z.array(checkInSchema).optional(),
  cravings: z.array(cravingSchema).optional(),
  goals: z.array(goalSchema).optional()
})

export async function patientSyncRoutes(fastify: FastifyInstance) {
  // All routes require patient authentication
  fastify.addHook('preHandler', requirePatient)

  /**
   * POST /sync/check-in
   * Submit a single check-in from Recover app
   */
  fastify.post('/check-in', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = checkInSchema.parse(request.body)
    const patient = request.patientUser!

    // Calculate wellness score if we have enough data
    const wellnessScore = calculateWellnessScore(body)

    const checkIn = await prisma.checkIn.create({
      data: {
        patientId: patient.id,
        date: new Date(body.date),
        mood: body.mood,
        notes: body.notes,
        haltHungry: body.haltHungry,
        haltAngry: body.haltAngry,
        haltLonely: body.haltLonely,
        haltTired: body.haltTired,
        hoursSlept: body.hoursSlept,
        sleepQuality: body.sleepQuality,
        exerciseMinutes: body.exerciseMinutes,
        wellnessScore
      }
    })

    // Get patient's counselor and notify them
    const patientRecord = await prisma.patient.findUnique({
      where: { id: patient.id },
      select: { assignedCounselorId: true, firstName: true, lastName: true }
    })

    if (patientRecord?.assignedCounselorId) {
      // Send real-time notification to counselor
      broadcastToUser(`staff:${patientRecord.assignedCounselorId}`, {
        type: 'patient.checkin',
        data: {
          patientId: patient.id,
          patientName: `${patientRecord.firstName} ${patientRecord.lastName}`,
          checkIn: {
            mood: checkIn.mood,
            date: checkIn.date,
            wellnessScore
          },
          // Flag concerning check-ins
          isConcerning: body.mood <= 3 || (wellnessScore !== null && wellnessScore <= 3)
        }
      })
    }

    return {
      success: true,
      checkIn
    }
  })

  /**
   * POST /sync/craving
   * Submit a single craving from Recover app
   */
  fastify.post('/craving', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = cravingSchema.parse(request.body)
    const patient = request.patientUser!

    const craving = await prisma.craving.create({
      data: {
        patientId: patient.id,
        date: new Date(body.date),
        intensity: body.intensity,
        trigger: body.trigger,
        triggerNotes: body.triggerNotes,
        copingStrategy: body.copingStrategy,
        overcame: body.overcame,
        haltHungry: body.haltHungry,
        haltAngry: body.haltAngry,
        haltLonely: body.haltLonely,
        haltTired: body.haltTired
      }
    })

    // Notify counselor of high-intensity cravings
    if (body.intensity >= 7) {
      const patientRecord = await prisma.patient.findUnique({
        where: { id: patient.id },
        select: { assignedCounselorId: true, firstName: true, lastName: true }
      })

      if (patientRecord?.assignedCounselorId) {
        broadcastToUser(`staff:${patientRecord.assignedCounselorId}`, {
          type: 'patient.alert',
          data: {
            patientId: patient.id,
            patientName: `${patientRecord.firstName} ${patientRecord.lastName}`,
            alertType: 'high_craving',
            severity: body.intensity >= 9 ? 'critical' : 'high',
            title: `High Craving Alert (${body.intensity}/10)`,
            description: body.trigger ?? 'Unknown trigger',
            timestamp: craving.date
          }
        })
      }
    }

    return {
      success: true,
      craving
    }
  })

  /**
   * POST /sync/check-ins
   * Submit multiple check-ins from Recover app (plural endpoint)
   */
  fastify.post('/check-ins', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({ checkIns: z.array(checkInSchema) }).parse(request.body)
    const patient = request.patientUser!
    let syncedCount = 0

    for (const ci of body.checkIns) {
      try {
        const wellnessScore = calculateWellnessScore(ci)
        await prisma.checkIn.create({
          data: {
            patientId: patient.id,
            date: new Date(ci.date),
            mood: ci.mood,
            notes: ci.notes,
            haltHungry: ci.haltHungry,
            haltAngry: ci.haltAngry,
            haltLonely: ci.haltLonely,
            haltTired: ci.haltTired,
            hoursSlept: ci.hoursSlept,
            sleepQuality: ci.sleepQuality,
            exerciseMinutes: ci.exerciseMinutes,
            wellnessScore
          }
        })
        syncedCount++
      } catch {
        // Skip duplicates or invalid entries
      }
    }

    return { success: true, syncedCount }
  })

  /**
   * POST /sync/cravings
   * Submit multiple cravings from Recover app (plural endpoint)
   */
  fastify.post('/cravings', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({ cravings: z.array(cravingSchema) }).parse(request.body)
    const patient = request.patientUser!
    let syncedCount = 0

    for (const c of body.cravings) {
      try {
        await prisma.craving.create({
          data: {
            patientId: patient.id,
            date: new Date(c.date),
            intensity: c.intensity,
            trigger: c.trigger,
            triggerNotes: c.triggerNotes,
            copingStrategy: c.copingStrategy,
            overcame: c.overcame,
            haltHungry: c.haltHungry,
            haltAngry: c.haltAngry,
            haltLonely: c.haltLonely,
            haltTired: c.haltTired
          }
        })
        syncedCount++
      } catch {
        // Skip duplicates or invalid entries
      }
    }

    return { success: true, syncedCount }
  })

  /**
   * POST /sync/goals
   * Submit multiple goals from Recover app (plural endpoint)
   */
  fastify.post('/goals', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      goals: z.array(goalSchema.extend({
        // Recover sends lowercase enums — normalize to uppercase
        category: z.enum(['RECOVERY', 'WELLNESS', 'PERSONAL', 'SOCIAL'])
          .or(z.enum(['recovery', 'wellness', 'personal', 'social']).transform(v => v.toUpperCase() as 'RECOVERY' | 'WELLNESS' | 'PERSONAL' | 'SOCIAL')),
        targetType: z.enum(['NUMERICAL', 'YES_NO', 'STREAK'])
          .or(z.enum(['numerical', 'yes-no', 'streak']).transform(v => {
            const map: Record<string, string> = { 'numerical': 'NUMERICAL', 'yes-no': 'YES_NO', 'streak': 'STREAK' }
            return map[v] as 'NUMERICAL' | 'YES_NO' | 'STREAK'
          })),
        frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ONE_TIME'])
          .or(z.enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'one-time']).transform(v => {
            const map: Record<string, string> = { 'hourly': 'DAILY', 'daily': 'DAILY', 'weekly': 'WEEKLY', 'monthly': 'MONTHLY', 'yearly': 'MONTHLY', 'one-time': 'ONE_TIME' }
            return map[v] as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME'
          })),
        recoverGoalId: z.union([z.string(), z.number().transform(v => String(v))]),
      })),
      progress: z.array(z.object({
        goalId: z.union([z.string(), z.number().transform(v => String(v))]),
        date: z.string().datetime(),
        value: z.number(),
        notes: z.string().optional()
      })).optional()
    }).parse(request.body)

    const patient = request.patientUser!
    let syncedCount = 0

    for (const g of body.goals) {
      try {
        await prisma.patientGoal.upsert({
          where: { recoverGoalId: g.recoverGoalId },
          create: {
            patientId: patient.id,
            recoverGoalId: g.recoverGoalId,
            title: g.title,
            description: g.description,
            category: g.category,
            targetType: g.targetType,
            targetValue: g.targetValue,
            currentValue: g.currentValue,
            frequency: g.frequency,
            startDate: new Date(g.startDate),
            endDate: g.endDate ? new Date(g.endDate) : null,
            isActive: g.isActive,
            isCompleted: g.isCompleted,
            lastSyncedAt: new Date()
          },
          update: {
            title: g.title,
            description: g.description,
            currentValue: g.currentValue,
            isActive: g.isActive,
            isCompleted: g.isCompleted,
            completedAt: g.isCompleted ? new Date() : null,
            lastSyncedAt: new Date()
          }
        })
        syncedCount++
      } catch {
        // Skip invalid entries
      }
    }

    return { success: true, syncedCount }
  })

  /**
   * POST /sync/batch
   * Batch sync multiple items from Recover app
   * Used for syncing offline data when reconnecting
   */
  fastify.post('/batch', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = batchSyncSchema.parse(request.body)
    const patient = request.patientUser!
    const audit = new AuditLogger({ patientActorId: patient.id, request })

    const results = {
      checkIns: { created: 0, errors: 0 },
      cravings: { created: 0, errors: 0 },
      goals: { synced: 0, errors: 0 }
    }

    // Sync check-ins
    if (body.checkIns?.length) {
      for (const ci of body.checkIns) {
        try {
          await prisma.checkIn.create({
            data: {
              patientId: patient.id,
              date: new Date(ci.date),
              mood: ci.mood,
              notes: ci.notes,
              haltHungry: ci.haltHungry,
              haltAngry: ci.haltAngry,
              haltLonely: ci.haltLonely,
              haltTired: ci.haltTired,
              hoursSlept: ci.hoursSlept,
              sleepQuality: ci.sleepQuality,
              exerciseMinutes: ci.exerciseMinutes,
              wellnessScore: calculateWellnessScore(ci)
            }
          })
          results.checkIns.created++
        } catch (error) {
          results.checkIns.errors++
        }
      }

      await audit.checkInSync(patient.id, results.checkIns.created)
    }

    // Sync cravings
    if (body.cravings?.length) {
      for (const c of body.cravings) {
        try {
          await prisma.craving.create({
            data: {
              patientId: patient.id,
              date: new Date(c.date),
              intensity: c.intensity,
              trigger: c.trigger,
              triggerNotes: c.triggerNotes,
              copingStrategy: c.copingStrategy,
              overcame: c.overcame,
              haltHungry: c.haltHungry,
              haltAngry: c.haltAngry,
              haltLonely: c.haltLonely,
              haltTired: c.haltTired
            }
          })
          results.cravings.created++
        } catch (error) {
          results.cravings.errors++
        }
      }
    }

    // Sync goals
    if (body.goals?.length) {
      for (const g of body.goals) {
        try {
          await prisma.patientGoal.upsert({
            where: { recoverGoalId: g.recoverGoalId },
            create: {
              patientId: patient.id,
              recoverGoalId: g.recoverGoalId,
              title: g.title,
              description: g.description,
              category: g.category,
              targetType: g.targetType,
              targetValue: g.targetValue,
              currentValue: g.currentValue,
              frequency: g.frequency,
              startDate: new Date(g.startDate),
              endDate: g.endDate ? new Date(g.endDate) : null,
              isActive: g.isActive,
              isCompleted: g.isCompleted,
              lastSyncedAt: new Date()
            },
            update: {
              title: g.title,
              description: g.description,
              currentValue: g.currentValue,
              isActive: g.isActive,
              isCompleted: g.isCompleted,
              completedAt: g.isCompleted ? new Date() : null,
              lastSyncedAt: new Date()
            }
          })
          results.goals.synced++
        } catch (error) {
          results.goals.errors++
        }
      }
    }

    return {
      success: true,
      results
    }
  })

  /**
   * GET /sync/treatment-plan
   * Get patient's assigned treatment plan
   */
  fastify.get('/treatment-plan', async (request: FastifyRequest, reply: FastifyReply) => {
    const patient = request.patientUser!

    const assignment = await prisma.treatmentAssignment.findUnique({
      where: { patientId: patient.id },
      include: {
        treatmentPlan: {
          include: {
            phases: { orderBy: { orderIndex: 'asc' } }
          }
        }
      }
    })

    if (!assignment) {
      return {
        success: true,
        treatmentPlan: null
      }
    }

    return {
      success: true,
      treatmentPlan: {
        id: assignment.treatmentPlan.id,
        name: assignment.treatmentPlan.name,
        description: assignment.treatmentPlan.description,
        currentPhaseIndex: assignment.currentPhaseIndex,
        startDate: assignment.startDate,
        phases: assignment.treatmentPlan.phases.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          duration: p.duration,
          durationUnit: p.durationUnit,
          goals: p.goals,
          activities: p.activities
        }))
      }
    }
  })

  /**
   * GET /sync/profile
   * Get patient profile data
   */
  fastify.get('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    const patient = request.patientUser!

    const patientRecord = await prisma.patient.findUnique({
      where: { id: patient.id },
      include: {
        facility: {
          select: { id: true, name: true, phone: true }
        },
        assignedCounselor: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    if (!patientRecord) {
      throw ApiError.notFound('Patient not found')
    }

    // Calculate days sober
    const daysSober = Math.max(0, Math.floor(
      (Date.now() - new Date(patientRecord.sobrietyDate).getTime()) / (1000 * 60 * 60 * 24)
    ))

    // Get check-in streak
    const recentCheckIns = await prisma.checkIn.findMany({
      where: { patientId: patient.id },
      orderBy: { date: 'desc' },
      take: 30,
      select: { date: true }
    })

    const checkInStreak = calculateStreak(recentCheckIns.map(ci => ci.date))

    return {
      success: true,
      profile: {
        id: patientRecord.id,
        firstName: patientRecord.firstName,
        lastName: patientRecord.lastName,
        sobrietyDate: patientRecord.sobrietyDate,
        daysSober,
        checkInStreak,
        facility: patientRecord.facility,
        counselor: patientRecord.assignedCounselor
          ? {
            id: patientRecord.assignedCounselor.id,
            name: `${patientRecord.assignedCounselor.firstName} ${patientRecord.assignedCounselor.lastName}`
          }
          : null
      }
    }
  })
}

// Helper functions

function calculateWellnessScore(checkIn: {
  mood?: number
  haltHungry?: number
  haltAngry?: number
  haltLonely?: number
  haltTired?: number
  sleepQuality?: number
}): number | null {
  const scores: number[] = []

  if (checkIn.mood) scores.push(checkIn.mood)

  // HALT scores are inverted (lower is better)
  if (checkIn.haltHungry) scores.push(11 - checkIn.haltHungry)
  if (checkIn.haltAngry) scores.push(11 - checkIn.haltAngry)
  if (checkIn.haltLonely) scores.push(11 - checkIn.haltLonely)
  if (checkIn.haltTired) scores.push(11 - checkIn.haltTired)

  if (checkIn.sleepQuality) scores.push(checkIn.sleepQuality)

  if (scores.length === 0) return null

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < dates.length; i++) {
    const checkDate = new Date(dates[i]!)
    checkDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (checkDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }

  return streak
}
