/**
 * WebSocket Handler
 *
 * Handles real-time communication for the Recovery Journey platform.
 * Supports authentication, messaging, and typing indicators.
 */

import type { FastifyRequest } from 'fastify'
import type { WebSocket } from '@fastify/websocket'
import type { RawData } from 'ws'
import logger from '../lib/logger.js'

// Connected clients map: userId -> Set of WebSocket connections
const clients = new Map<string, Set<WebSocket>>()

// Track facility associations for each userId
const userFacilities = new Map<string, string>()

// Connection heartbeat interval
const HEARTBEAT_INTERVAL = 30000
const heartbeats = new Map<WebSocket, NodeJS.Timeout>()

interface WebSocketMessage {
  type: string
  data?: unknown
}

interface AuthData {
  token: string
  userType: 'staff' | 'patient'
}

interface TypingData {
  recipientId: string
  isTyping: boolean
}

interface DecodedToken {
  id: string
  [key: string]: unknown
}

/**
 * Main WebSocket connection handler
 */
export async function websocketHandler(socket: WebSocket, request: FastifyRequest): Promise<void> {
  let userId: string | null = null

  // Handle incoming messages
  socket.on('message', (rawMessage: RawData) => {
    void (async () => {
      try {
        const message: WebSocketMessage = JSON.parse(rawMessage.toString())

        switch (message.type) {
          case 'auth':
            // Authenticate and register connection
            userId = await handleAuth(socket, message.data as AuthData, request)
            break

          case 'ping':
            // Heartbeat response
            socket.send(JSON.stringify({ type: 'pong' }))
            break

          case 'typing':
            // Forward typing indicator
            handleTyping(userId, message.data as TypingData)
            break

          default:
            socket.send(JSON.stringify({
              type: 'error',
              data: { message: 'Unknown message type' }
            }))
        }
      } catch (err) {
        logger.error('WebSocket message error', err as Error)
        socket.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }))
      }
    })()
  })

  // Handle disconnection
  socket.on('close', () => {
    if (userId) {
      removeClient(userId, socket)
    }
    clearHeartbeat(socket)
  })

  socket.on('error', (err: Error) => {
    logger.error('WebSocket connection error', err)
    if (userId) {
      removeClient(userId, socket)
    }
    clearHeartbeat(socket)
  })

  // Start heartbeat
  startHeartbeat(socket)

  // Send welcome message
  socket.send(JSON.stringify({
    type: 'connected',
    data: { message: 'WebSocket connected. Send auth message to authenticate.' }
  }))
}

/**
 * Handle authentication message
 */
async function handleAuth(
  socket: WebSocket,
  data: AuthData,
  request: FastifyRequest
): Promise<string | null> {
  try {
    // Verify JWT token
    const decoded = await request.server.jwt.verify<DecodedToken>(data.token)
    const userId = `${data.userType}:${decoded.id}`

    // Register connection
    addClient(userId, socket)

    // Track facility association for facility-scoped broadcasts
    if (decoded['facilityId']) {
      userFacilities.set(userId, decoded['facilityId'] as string)
    }

    socket.send(JSON.stringify({
      type: 'authenticated',
      data: { userId }
    }))

    logger.info('WebSocket authenticated', { userId })
    return userId

  } catch {
    socket.send(JSON.stringify({
      type: 'auth_error',
      data: { message: 'Invalid token' }
    }))
    return null
  }
}

/**
 * Handle typing indicator
 */
function handleTyping(
  senderId: string | null,
  data: TypingData
): void {
  if (!senderId) return

  const recipientKey = data.recipientId
  broadcastToUser(recipientKey, {
    type: 'typing',
    data: {
      userId: senderId,
      isTyping: data.isTyping
    }
  })
}

/**
 * Add a client connection
 */
function addClient(userId: string, socket: WebSocket): void {
  if (!clients.has(userId)) {
    clients.set(userId, new Set())
  }
  clients.get(userId)!.add(socket)
}

/**
 * Remove a client connection
 */
function removeClient(userId: string, socket: WebSocket): void {
  const userClients = clients.get(userId)
  if (userClients) {
    userClients.delete(socket)
    if (userClients.size === 0) {
      clients.delete(userId)
      userFacilities.delete(userId)
    }
  }
}

/**
 * Broadcast message to a specific user
 */
export function broadcastToUser(userId: string, message: WebSocketMessage): void {
  const userClients = clients.get(userId)
  if (userClients) {
    const payload = JSON.stringify(message)
    for (const socket of userClients) {
      if (socket.readyState === 1) { // OPEN
        socket.send(payload)
      }
    }
  }
}

/**
 * Broadcast message to all clients in a facility
 */
export function broadcastToFacility(facilityId: string, message: WebSocketMessage): void {
  const payload = JSON.stringify(message)
  for (const [userId, sockets] of clients) {
    // Only send to users associated with this facility
    if (userFacilities.get(userId) !== facilityId) continue

    for (const socket of sockets) {
      if (socket.readyState === 1) {
        socket.send(payload)
      }
    }
  }
}

/**
 * Broadcast message to all connected clients
 */
export function broadcastToAll(message: WebSocketMessage): void {
  const payload = JSON.stringify(message)
  for (const sockets of clients.values()) {
    for (const socket of sockets) {
      if (socket.readyState === 1) {
        socket.send(payload)
      }
    }
  }
}

/**
 * Start heartbeat for connection
 */
function startHeartbeat(socket: WebSocket): void {
  const interval = setInterval(() => {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify({ type: 'ping' }))
    }
  }, HEARTBEAT_INTERVAL)

  heartbeats.set(socket, interval)
}

/**
 * Clear heartbeat for connection
 */
function clearHeartbeat(socket: WebSocket): void {
  const interval = heartbeats.get(socket)
  if (interval) {
    clearInterval(interval)
    heartbeats.delete(socket)
  }
}

/**
 * Get connected client count
 */
export function getConnectedCount(): number {
  return clients.size
}

/**
 * Check if user is connected
 */
export function isUserConnected(userId: string): boolean {
  return clients.has(userId) && clients.get(userId)!.size > 0
}
