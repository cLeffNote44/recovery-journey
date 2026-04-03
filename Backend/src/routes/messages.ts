import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../lib/error-handler.js'
import { AuditLogger } from '../lib/audit-log.js'
import { requireStaff, requirePatient, canAccessPatient, authenticate } from '../middleware/auth.js'
import { broadcastToUser } from '../websocket/handler.js'

// Validation schemas
const sendMessageSchema = z.object({
  recipientId: z.string(), // Patient ID (for staff) or Staff ID (for patient)
  content: z.string().min(1).max(5000),
  messageType: z.enum(['TEXT', 'SYSTEM']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional()
})

const listMessagesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50)
})

export async function messageRoutes(fastify: FastifyInstance) {
  /**
   * GET /messages
   * List all conversations for current user (staff sees patient conversations)
   */
  fastify.get('/', { preHandler: [requireStaff] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listMessagesSchema.parse(request.query)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Get all conversations this staff member is part of
    const conversations = await prisma.message.groupBy({
      by: ['patientId'],
      where: { staffId: user.id },
      _max: { sentAt: true },
      _count: true
    })

    // Get patient details and last message for each conversation
    const conversationDetails = await Promise.all(
      conversations.map(async (conv) => {
        const [patient, lastMessage, unreadCount] = await Promise.all([
          prisma.patient.findUnique({
            where: { id: conv.patientId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true
            }
          }),
          prisma.message.findFirst({
            where: { patientId: conv.patientId, staffId: user.id },
            orderBy: { sentAt: 'desc' }
          }),
          prisma.message.count({
            where: {
              patientId: conv.patientId,
              staffId: user.id,
              senderType: 'PATIENT',
              readAt: null
            }
          })
        ])

        return {
          patientId: conv.patientId,
          patient,
          lastMessage,
          unreadCount,
          updatedAt: conv._max.sentAt
        }
      })
    )

    // Sort by most recent
    conversationDetails.sort((a, b) =>
      new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    )

    // Audit log
    await audit.log({
      action: 'MESSAGE_VIEW',
      resourceType: 'conversations',
      description: `Listed ${conversationDetails.length} conversations`
    })

    return {
      success: true,
      conversations: conversationDetails,
      total: conversationDetails.length
    }
  })

  /**
   * GET /messages/conversations/:patientId
   * Get all messages in a conversation with a patient
   */
  fastify.get('/conversations/:patientId', { preHandler: [requireStaff] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { patientId } = request.params as { patientId: string }
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Verify access to patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { facilityId: true, assignedCounselorId: true }
    })

    if (!patient) {
      throw ApiError.notFound('Patient not found')
    }

    const hasAccess = await canAccessPatient(user, patient.facilityId, patient.assignedCounselorId)
    if (!hasAccess) {
      throw ApiError.forbidden('Access denied to this conversation')
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { patientId, staffId: user.id },
      orderBy: { sentAt: 'asc' }
    })

    // Mark patient messages as read
    await prisma.message.updateMany({
      where: {
        patientId,
        staffId: user.id,
        senderType: 'PATIENT',
        readAt: null
      },
      data: { readAt: new Date() }
    })

    // Audit log
    await audit.messageView(patientId)

    return {
      success: true,
      messages,
      patientId
    }
  })

  /**
   * POST /messages
   * Send a message (staff to patient)
   */
  fastify.post('/', { preHandler: [requireStaff] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = sendMessageSchema.parse(request.body)
    const user = request.staffUser!
    const audit = AuditLogger.fromRequest(request, user.id)

    // Verify access to patient
    const patient = await prisma.patient.findUnique({
      where: { id: body.recipientId },
      select: { facilityId: true, assignedCounselorId: true }
    })

    if (!patient) {
      throw ApiError.notFound('Patient not found')
    }

    const hasAccess = await canAccessPatient(user, patient.facilityId, patient.assignedCounselorId)
    if (!hasAccess) {
      throw ApiError.forbidden('Cannot send messages to this patient')
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        patientId: body.recipientId,
        staffId: user.id,
        senderType: 'STAFF',
        content: body.content,
        messageType: body.messageType ?? 'TEXT',
        priority: body.priority ?? 'NORMAL'
      }
    })

    // Broadcast to patient via WebSocket
    broadcastToUser(`patient:${body.recipientId}`, {
      type: 'message.new',
      data: {
        ...message,
        senderName: `${user.id}` // Will be resolved on client
      }
    })

    // Audit log
    await audit.messageSend(body.recipientId, message.id)

    return {
      success: true,
      message
    }
  })

  /**
   * PUT /messages/:id/read
   * Mark a message as read
   */
  fastify.put('/:id/read', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }

    const message = await prisma.message.findUnique({
      where: { id }
    })

    if (!message) {
      throw ApiError.notFound('Message not found')
    }

    // Verify the current user is the intended recipient of this message
    const staffUser = request.staffUser
    const patientUser = request.patientUser
    if (staffUser) {
      // Staff can only mark patient-sent messages addressed to them
      if (message.senderType !== 'PATIENT' || message.staffId !== staffUser.id) {
        throw ApiError.forbidden('Cannot mark this message as read')
      }
    } else if (patientUser) {
      // Patients can only mark staff-sent messages addressed to them
      if (message.senderType !== 'STAFF' || message.patientId !== patientUser.id) {
        throw ApiError.forbidden('Cannot mark this message as read')
      }
    }

    // Update read status
    await prisma.message.update({
      where: { id },
      data: { readAt: new Date() }
    })

    // Broadcast read receipt
    const recipientKey = message.senderType === 'PATIENT'
      ? `staff:${message.staffId}`
      : `patient:${message.patientId}`

    broadcastToUser(recipientKey, {
      type: 'message.read',
      data: { messageId: id, readAt: new Date() }
    })

    return { success: true }
  })

  // =====================================
  // Patient endpoints (for Recover app)
  // =====================================

  /**
   * GET /messages/patient/inbox
   * Get messages for current patient
   */
  fastify.get('/patient/inbox', { preHandler: [requirePatient] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const patient = request.patientUser!

    const messages = await prisma.message.findMany({
      where: { patientId: patient.id },
      include: {
        staff: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { sentAt: 'asc' }
    })

    // Mark staff messages as read
    await prisma.message.updateMany({
      where: {
        patientId: patient.id,
        senderType: 'STAFF',
        readAt: null
      },
      data: { readAt: new Date() }
    })

    return {
      success: true,
      messages
    }
  })

  /**
   * POST /messages/patient/send
   * Send message from patient to their counselor
   */
  fastify.post('/patient/send', { preHandler: [requirePatient] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      content: z.string().min(1).max(5000),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional()
    }).parse(request.body)

    const patient = request.patientUser!

    // Get patient's assigned counselor
    const patientRecord = await prisma.patient.findUnique({
      where: { id: patient.id },
      select: { assignedCounselorId: true }
    })

    if (!patientRecord?.assignedCounselorId) {
      throw ApiError.badRequest('No counselor assigned. Please contact your facility.')
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        patientId: patient.id,
        staffId: patientRecord.assignedCounselorId,
        senderType: 'PATIENT',
        content: body.content,
        messageType: 'TEXT',
        priority: body.priority ?? 'NORMAL'
      }
    })

    // Broadcast to counselor via WebSocket
    broadcastToUser(`staff:${patientRecord.assignedCounselorId}`, {
      type: 'message.new',
      data: message
    })

    return {
      success: true,
      message
    }
  })
}
