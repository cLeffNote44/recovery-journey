import { useState, useEffect, useCallback, useRef } from 'react'
import {
  webSocket,
  WebSocketStatus,
  WebSocketMessageType,
  NewMessagePayload,
  TypingPayload,
  PatientCheckinPayload,
  NotificationPayload,
} from '../services/websocket'
import { useAuthStore } from '../stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryClient'
import { showToast } from '../components/Toast'

/**
 * Hook for WebSocket real-time communication
 *
 * Provides:
 * - Automatic connection on login
 * - Status monitoring
 * - Message sending utilities
 * - Automatic cache invalidation on updates
 *
 * @example
 * ```tsx
 * function Messages() {
 *   const { status, sendMessage, sendTyping } = useWebSocket()
 *
 *   return (
 *     <div>
 *       <span>Status: {status}</span>
 *       <button onClick={() => sendMessage(patientId, 'Hello!')}>
 *         Send
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>(webSocket.getStatus())
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const queryClient = useQueryClient()

  // Track if we've set up handlers
  const handlersSetUp = useRef(false)

  // Connect/disconnect based on auth status
  useEffect(() => {
    if (isAuthenticated) {
      webSocket.connect()
    } else {
      webSocket.disconnect()
    }

    return () => {
      // Don't disconnect on unmount - let the service manage connection
    }
  }, [isAuthenticated])

  // Subscribe to status changes
  useEffect(() => {
    return webSocket.onStatusChange(setStatus)
  }, [])

  // Set up message handlers (once)
  useEffect(() => {
    if (handlersSetUp.current) return
    handlersSetUp.current = true

    // Handle new messages
    const unsubNewMessage = webSocket.on<NewMessagePayload>('message.new', (payload) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(payload.patientId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      })

      // Show notification for patient messages
      if (payload.sender === 'patient') {
        showToast.info(`New message from patient`)
      }
    })

    // Handle message read receipts
    const unsubMessageRead = webSocket.on<{ patientId: string }>('message.read', (payload) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(payload.patientId),
      })
    })

    // Handle patient updates
    const unsubPatientUpdate = webSocket.on<{ patientId: string }>('patient.updated', (payload) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.detail(payload.patientId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.dashboard(payload.patientId),
      })
    })

    // Handle patient check-ins
    const unsubCheckin = webSocket.on<PatientCheckinPayload>('patient.checkin', (payload) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.detail(payload.patientId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.dashboard(payload.patientId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.stats(),
      })

      // Show notification for concerning check-ins
      if (payload.cravingLevel >= 8 || payload.mood <= 2) {
        showToast.warning('A patient reported concerning symptoms')
      }
    })

    // Handle notifications
    const unsubNotification = webSocket.on<NotificationPayload>('notification', (payload) => {
      switch (payload.type) {
        case 'alert':
          showToast.error(payload.message)
          break
        case 'warning':
          showToast.warning(payload.message)
          break
        default:
          showToast.info(payload.message)
      }
    })

    return () => {
      unsubNewMessage()
      unsubMessageRead()
      unsubPatientUpdate()
      unsubCheckin()
      unsubNotification()
      handlersSetUp.current = false
    }
  }, [queryClient])

  // Action: Send a message
  const sendMessage = useCallback((patientId: string, content: string) => {
    webSocket.send<Partial<NewMessagePayload>>('message.new', {
      patientId,
      content,
      sender: 'clinician',
    })
  }, [])

  // Action: Send typing indicator
  const sendTyping = useCallback((patientId: string, isTyping: boolean) => {
    webSocket.sendTyping(patientId, isTyping)
  }, [])

  // Action: Mark messages as read
  const markAsRead = useCallback((patientId: string) => {
    webSocket.sendMarkRead(patientId)
  }, [])

  return {
    status,
    isConnected: status === 'connected',
    isReconnecting: status === 'reconnecting',
    sendMessage,
    sendTyping,
    markAsRead,
    connect: useCallback(() => webSocket.connect(), []),
    disconnect: useCallback(() => webSocket.disconnect(), []),
  }
}

/**
 * Hook for subscribing to typing indicators
 *
 * @example
 * ```tsx
 * function ConversationView({ patientId }) {
 *   const { isTyping } = useTypingIndicator(patientId)
 *
 *   return (
 *     <div>
 *       {isTyping && <span>Patient is typing...</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useTypingIndicator(patientId: string) {
  const [isTyping, setIsTyping] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = webSocket.on<TypingPayload>('message.typing', (payload) => {
      if (payload.patientId === patientId) {
        setIsTyping(payload.isTyping)

        // Clear typing indicator after 3 seconds if no update
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        if (payload.isTyping) {
          timeoutRef.current = setTimeout(() => {
            setIsTyping(false)
          }, 3000)
        }
      }
    })

    return () => {
      unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [patientId])

  return { isTyping }
}

/**
 * Hook for subscribing to specific message types
 *
 * @example
 * ```tsx
 * function AlertListener() {
 *   useWebSocketSubscription('notification', (payload) => {
 *     console.log('Notification:', payload)
 *   })
 *
 *   return null
 * }
 * ```
 */
export function useWebSocketSubscription<T>(
  type: WebSocketMessageType,
  handler: (payload: T) => void
) {
  useEffect(() => {
    return webSocket.on<T>(type, handler)
  }, [type, handler])
}

/**
 * Connection status indicator component hook
 */
export function useWebSocketStatus() {
  const [status, setStatus] = useState<WebSocketStatus>(webSocket.getStatus())

  useEffect(() => {
    return webSocket.onStatusChange(setStatus)
  }, [])

  const statusInfo = {
    connected: {
      label: 'Connected',
      color: 'green',
      icon: 'check',
    },
    connecting: {
      label: 'Connecting...',
      color: 'yellow',
      icon: 'loader',
    },
    reconnecting: {
      label: 'Reconnecting...',
      color: 'yellow',
      icon: 'refresh',
    },
    disconnected: {
      label: 'Disconnected',
      color: 'gray',
      icon: 'x',
    },
    error: {
      label: 'Connection Error',
      color: 'red',
      icon: 'alert',
    },
  }

  return {
    status,
    ...statusInfo[status],
  }
}
