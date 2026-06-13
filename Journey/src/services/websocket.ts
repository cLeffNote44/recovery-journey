/* eslint-disable no-console -- intentional connection diagnostics; stripped from prod builds */
/**
 * WebSocket Service for Real-Time Communication
 *
 * Provides real-time messaging capabilities:
 * - Automatic connection management
 * - Reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Event-based message handling
 * - Heartbeat/ping-pong for connection health
 */

import { useAuthStore } from '../stores/authStore'

// =============================================================================
// TYPES
// =============================================================================

export type WebSocketMessageType =
  | 'message.new'
  | 'message.read'
  | 'message.typing'
  | 'typing'
  | 'patient.updated'
  | 'patient.checkin'
  | 'patient.alert'
  | 'notification'
  | 'ping'
  | 'pong'
  | 'error'

// Wire envelope. The server uses `{ type, data }` (see Backend websocket
// handler); `data` is what every handler receives.
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType
  data: T
  timestamp?: string
}

// Shapes below mirror what the Backend broadcasts (see Backend routes
// messages.ts / patient-sync.ts).
export interface NewMessagePayload {
  id: string
  patientId: string
  content: string
  senderType: 'staff' | 'patient'
  senderName?: string
  createdAt: string
}

export interface TypingPayload {
  patientId: string
  isTyping: boolean
}

export interface PatientCheckinPayload {
  patientId: string
  patientName: string
  checkIn: { mood: number; date: string; wellnessScore: number | null }
  isConcerning: boolean
}

export interface PatientAlertPayload {
  patientId: string
  patientName: string
  alertType: string
  severity: 'high' | 'critical'
  title: string
  description: string
  timestamp: string
}

export interface NotificationPayload {
  id: string
  type: 'info' | 'warning' | 'alert'
  title: string
  message: string
}

type MessageHandler<T = unknown> = (payload: T) => void

export interface ReconnectConfig {
  /** Whether to automatically reconnect */
  enabled: boolean
  /** Initial delay in ms */
  delay: number
  /** Maximum delay in ms */
  maxDelay: number
  /** Maximum number of attempts */
  maxAttempts: number
}

export interface WebSocketConfig {
  /** WebSocket server URL */
  url?: string
  /** Reconnection options */
  reconnect?: Partial<ReconnectConfig>
  /** Heartbeat interval in ms */
  heartbeatInterval?: number
  /** Connection timeout in ms */
  connectionTimeout?: number
}

interface RequiredWebSocketConfig {
  url: string
  reconnect: ReconnectConfig
  heartbeatInterval: number
  connectionTimeout: number
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: RequiredWebSocketConfig = {
  url: import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'ws://localhost:8000/ws' : ''),
  reconnect: {
    enabled: true,
    delay: 1000,
    maxDelay: 30000,
    maxAttempts: 10,
  },
  heartbeatInterval: 30000,
  connectionTimeout: 10000,
}

// =============================================================================
// WEBSOCKET SERVICE
// =============================================================================

class WebSocketService {
  private socket: WebSocket | null = null
  private config: RequiredWebSocketConfig
  private handlers: Map<WebSocketMessageType, Set<MessageHandler>> = new Map()
  private statusHandlers: Set<(status: WebSocketStatus) => void> = new Set()
  private messageQueue: WebSocketMessage[] = []
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private status: WebSocketStatus = 'disconnected'

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      reconnect: {
        ...DEFAULT_CONFIG.reconnect,
        ...config.reconnect,
      },
    }
  }

  // ===========================================================================
  // CONNECTION MANAGEMENT
  // ===========================================================================

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected')
      return
    }

    this.setStatus('connecting')

    const token = useAuthStore.getState().accessToken
    if (!token) {
      console.warn('[WS] No auth token, cannot connect')
      this.setStatus('error')
      return
    }

    try {
      // The server authenticates via an `auth` message after connect, NOT a
      // token in the URL — this keeps the JWT out of server/proxy access logs.
      this.socket = new WebSocket(this.config.url)

      // Connection timeout
      const timeoutId = setTimeout(() => {
        if (this.socket?.readyState === WebSocket.CONNECTING) {
          console.warn('[WS] Connection timeout')
          this.socket.close()
        }
      }, this.config.connectionTimeout)

      this.socket.onopen = () => {
        clearTimeout(timeoutId)
        console.log('[WS] Connected')
        // Authenticate over the socket before anything else.
        this.socket?.send(JSON.stringify({ type: 'auth', data: { token } }))
        this.setStatus('connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.flushMessageQueue()
      }

      this.socket.onclose = (event) => {
        clearTimeout(timeoutId)
        console.log('[WS] Disconnected:', event.code, event.reason)
        this.stopHeartbeat()

        if (this.status !== 'error') {
          this.setStatus('disconnected')
        }

        // Attempt reconnection
        if (this.config.reconnect.enabled && this.shouldReconnect(event.code)) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error('[WS] Error:', error)
        this.setStatus('error')
      }

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data)
      }
    } catch (error) {
      console.error('[WS] Failed to create connection:', error)
      this.setStatus('error')
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.reconnectAttempts = this.config.reconnect.maxAttempts // Prevent reconnection
    this.stopHeartbeat()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
    }

    this.setStatus('disconnected')
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  /**
   * Get current status
   */
  getStatus(): WebSocketStatus {
    return this.status
  }

  // ===========================================================================
  // SENDING MESSAGES
  // ===========================================================================

  /**
   * Send a message through the WebSocket
   */
  send<T>(type: WebSocketMessageType, payload: T): void {
    const message: WebSocketMessage<T> = {
      type,
      data: payload,
      timestamp: new Date().toISOString(),
    }

    if (this.isConnected() && this.socket) {
      this.socket.send(JSON.stringify(message))
    } else {
      // Queue for later
      this.messageQueue.push(message)
      console.log('[WS] Message queued (not connected):', type)
    }
  }

  /**
   * Send a typing indicator
   */
  sendTyping(patientId: string, isTyping: boolean): void {
    this.send<TypingPayload>('message.typing', { patientId, isTyping })
  }

  /**
   * Mark messages as read
   */
  sendMarkRead(patientId: string): void {
    this.send('message.read', { patientId })
  }

  // ===========================================================================
  // EVENT HANDLING
  // ===========================================================================

  /**
   * Subscribe to a message type
   */
  on<T>(type: WebSocketMessageType, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }

    this.handlers.get(type)!.add(handler as MessageHandler)

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler as MessageHandler)
    }
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(handler: (status: WebSocketStatus) => void): () => void {
    this.statusHandlers.add(handler)
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  /**
   * Remove all handlers for a type
   */
  off(type: WebSocketMessageType): void {
    this.handlers.delete(type)
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data)

      // Handle pong (heartbeat response)
      if (message.type === 'pong') {
        return
      }

      // The server also pings us; reply so it knows we're alive.
      if (message.type === 'ping') {
        this.socket?.send(JSON.stringify({ type: 'pong' }))
        return
      }

      // Log messages in dev
      if (process.env.NODE_ENV === 'development') {
        console.log('[WS] Received:', message.type, message.data)
      }

      // Notify handlers
      const handlers = this.handlers.get(message.type)
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(message.data)
          } catch (error) {
            console.error('[WS] Handler error:', error)
          }
        })
      }
    } catch (error) {
      console.error('[WS] Failed to parse message:', error)
    }
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status
    this.statusHandlers.forEach((handler) => {
      try {
        handler(status)
      } catch (error) {
        console.error('[WS] Status handler error:', error)
      }
    })
  }

  private shouldReconnect(closeCode: number): boolean {
    // Don't reconnect on normal closure or auth errors
    if (closeCode === 1000 || closeCode === 4401 || closeCode === 4403) {
      return false
    }
    return this.reconnectAttempts < this.config.reconnect.maxAttempts
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    this.reconnectAttempts++
    const delay = Math.min(
      this.config.reconnect.delay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.reconnect.maxDelay
    )

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    this.setStatus('reconnecting')

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', {})
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private flushMessageQueue(): void {
    if (!this.isConnected() || this.messageQueue.length === 0) return

    console.log(`[WS] Flushing ${this.messageQueue.length} queued messages`)

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message && this.socket) {
        this.socket.send(JSON.stringify(message))
      }
    }
  }
}

// Export singleton instance
export const webSocket = new WebSocketService()

// Export class for testing
export { WebSocketService }
