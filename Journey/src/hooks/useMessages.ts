import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesAPI, SendMessageData } from '../services/api'
import { queryKeys } from '../lib/queryClient'
import { mockConversations, mockMessages } from '../data/mockData'
import { showToast } from '../components/Toast'

/**
 * Hook for fetching all conversations
 */
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.messages.conversations(),
    queryFn: async () => {
      const response = await messagesAPI.getAll()
      if (response.success && response.conversations) {
        return { conversations: response.conversations, isFromApi: true }
      }
      throw new Error('Failed to fetch conversations')
    },
    placeholderData: { conversations: mockConversations, isFromApi: false },
    retry: false,
  })
}

/**
 * Hook for fetching messages in a conversation
 */
export function useConversationMessages(patientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.conversation(patientId || ''),
    queryFn: async () => {
      if (!patientId) throw new Error('No patient ID provided')
      const response = await messagesAPI.getConversation(patientId)
      if (response.success && response.messages) {
        return { messages: response.messages, isFromApi: true }
      }
      throw new Error('Failed to fetch messages')
    },
    enabled: !!patientId,
    placeholderData: { messages: mockMessages, isFromApi: false },
    retry: false,
  })
}

/**
 * Hook for sending a message
 * Uses optimistic updates to show the message immediately
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      const response = await messagesAPI.send(data)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to send message')
    },
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.conversation(newMessage.recipient_id),
      })

      // Snapshot the previous messages
      const previousMessages = queryClient.getQueryData(
        queryKeys.messages.conversation(newMessage.recipient_id)
      )

      // Optimistically add the new message
      queryClient.setQueryData(
        queryKeys.messages.conversation(newMessage.recipient_id),
        (old: { messages: Array<Record<string, unknown>>; isFromApi: boolean } | undefined) => {
          if (!old) return old
          const tempMessage = {
            id: `temp-${Date.now()}`,
            content: newMessage.body,
            sender: 'clinician',
            sent_at: new Date().toISOString(),
            read: false,
            _optimistic: true,
            _pending: true,
          }
          return {
            ...old,
            messages: [...old.messages, tempMessage],
          }
        }
      )

      return { previousMessages, recipientId: newMessage.recipient_id }
    },
    onError: (error: Error, _newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages && context?.recipientId) {
        queryClient.setQueryData(
          queryKeys.messages.conversation(context.recipientId),
          context.previousMessages
        )
      }
      showToast.error(error.message)
    },
    onSuccess: () => {
      showToast.success('Message sent!')
    },
    onSettled: (_, __, variables) => {
      // Always refetch to get server data
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(variables.recipient_id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      })
    },
  })
}

/**
 * Hook for marking a message as read
 */
export function useMarkMessageAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await messagesAPI.markAsRead(messageId)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to mark as read')
    },
    onSuccess: () => {
      // Invalidate conversations to update unread counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      })
    },
  })
}
