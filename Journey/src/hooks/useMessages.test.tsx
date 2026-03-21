import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMarkMessageAsRead,
} from './useMessages'

// Mock the API
vi.mock('../services/api', () => ({
  messagesAPI: {
    getAll: vi.fn(),
    getConversation: vi.fn(),
    send: vi.fn(),
    markAsRead: vi.fn(),
  },
}))

// Mock the toast
vi.mock('../components/Toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Import after mocking
import { messagesAPI } from '../services/api'

// Create wrapper with fresh QueryClient for each test
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch conversations successfully and mark isFromApi true', async () => {
    const mockConversations = [
      { id: '1', patientName: 'John Doe', lastMessage: 'Hello' },
      { id: '2', patientName: 'Jane Smith', lastMessage: 'Hi there' },
    ]

    vi.mocked(messagesAPI.getAll).mockResolvedValueOnce({
      success: true,
      conversations: mockConversations,
    })

    const { result } = renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    })

    // Wait for API data to replace placeholder
    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(result.current.data?.conversations).toEqual(mockConversations)
  })

  it('should use placeholder data before API resolves', () => {
    vi.mocked(messagesAPI.getAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    })

    // Should have placeholder data with isFromApi: false immediately
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.isFromApi).toBe(false)
    expect(Array.isArray(result.current.data?.conversations)).toBe(true)
  })

  it('should handle API errors gracefully', async () => {
    vi.mocked(messagesAPI.getAll).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    // Error state verified - placeholder data behavior varies by React Query version
    expect(result.current.error).toBeDefined()
  })

  it('should call the API', async () => {
    vi.mocked(messagesAPI.getAll).mockResolvedValueOnce({
      success: true,
      conversations: [],
    })

    renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(messagesAPI.getAll).toHaveBeenCalled()
    })
  })
})

describe('useConversationMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch messages for a patient and mark isFromApi true', async () => {
    const mockMessages = [
      { id: 'm1', content: 'Hello', sender: 'patient' },
      { id: 'm2', content: 'Hi!', sender: 'clinician' },
    ]

    vi.mocked(messagesAPI.getConversation).mockResolvedValueOnce({
      success: true,
      messages: mockMessages,
    })

    const { result } = renderHook(() => useConversationMessages('patient-1'), {
      wrapper: createWrapper(),
    })

    // Wait for API data to replace placeholder
    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(result.current.data?.messages).toEqual(mockMessages)
    expect(messagesAPI.getConversation).toHaveBeenCalledWith('patient-1')
  })

  it('should not fetch when patientId is undefined', () => {
    const { result } = renderHook(() => useConversationMessages(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(messagesAPI.getConversation).not.toHaveBeenCalled()
  })

  it('should not fetch when patientId is empty string', () => {
    const { result } = renderHook(() => useConversationMessages(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })

  it('should use placeholder data while loading', () => {
    vi.mocked(messagesAPI.getConversation).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useConversationMessages('patient-1'), {
      wrapper: createWrapper(),
    })

    // Should have placeholder data with isFromApi: false
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.isFromApi).toBe(false)
  })
})

describe('useSendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send a message successfully', async () => {
    vi.mocked(messagesAPI.send).mockResolvedValueOnce({
      success: true,
      message: { id: 'new-1', content: 'Test message' },
    })

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      recipient_id: 'patient-1',
      body: 'Test message',
    })

    expect(messagesAPI.send).toHaveBeenCalledWith({
      recipient_id: 'patient-1',
      body: 'Test message',
    })
  })

  it('should handle send errors', async () => {
    vi.mocked(messagesAPI.send).mockRejectedValueOnce(new Error('Failed to send'))

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        recipient_id: 'patient-1',
        body: 'Test message',
      })
    ).rejects.toThrow()
  })

  it('should handle API returning success: false', async () => {
    vi.mocked(messagesAPI.send).mockResolvedValueOnce({
      success: false,
      error: 'Message too long',
    })

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        recipient_id: 'patient-1',
        body: 'Test message',
      })
    ).rejects.toThrow('Message too long')
  })
})

describe('useMarkMessageAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should mark message as read', async () => {
    vi.mocked(messagesAPI.markAsRead).mockResolvedValueOnce({
      success: true,
    })

    const { result } = renderHook(() => useMarkMessageAsRead(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('message-1')

    expect(messagesAPI.markAsRead).toHaveBeenCalledWith('message-1')
  })

  it('should handle errors when marking as read', async () => {
    vi.mocked(messagesAPI.markAsRead).mockResolvedValueOnce({
      success: false,
      error: 'Message not found',
    })

    const { result } = renderHook(() => useMarkMessageAsRead(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync('message-1')).rejects.toThrow(
      'Message not found'
    )
  })
})
