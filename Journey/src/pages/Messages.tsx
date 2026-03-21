import { useState, useEffect, useRef } from 'react'
import { Search, Send, Clock, AlertCircle } from 'lucide-react'
import { messagesAPI } from '../services/api'
import {
  mockConversations,
  mockMessages,
  type Conversation,
  type Message,
} from '../data/mockData'
import { showToast } from '../components/Toast'
import {
  ConversationListSkeleton,
  MessagesSkeleton,
  Spinner,
} from '../components/LoadingState'
import { SectionErrorBoundary } from '../components/ErrorBoundary'
import { auditLog } from '../services/auditLog'

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoadingConversations(true)
      try {
        const response = await messagesAPI.getAll()
        if (response.success && response.conversations) {
          setConversations(response.conversations)
          if (response.conversations.length > 0) {
            setSelectedConversation(response.conversations[0])
          }
          setIsUsingMockData(false)
          setIsLoadingConversations(false)
          return
        }
      } catch {
        // API unavailable - will use mock data below
      }
      // Use mock data
      setConversations(mockConversations)
      setSelectedConversation(mockConversations[0])
      setIsUsingMockData(true)
      setIsLoadingConversations(false)
    }

    fetchConversations()
  }, [])

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const response = await messagesAPI.getConversation(String(selectedConversation.id))
        if (response.success && response.messages) {
          setMessages(response.messages)
          setIsLoadingMessages(false)

          // Audit log conversation view
          auditLog.conversationView(String(selectedConversation.id))
          return
        }
      } catch {
        // API unavailable - will use mock data below
      }
      // Use mock data
      setMessages(mockMessages)
      setIsLoadingMessages(false)

      // Still log conversation view in demo mode
      auditLog.conversationView(String(selectedConversation.id))
    }

    fetchMessages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setIsSending(true)
    const messageText = newMessage
    setNewMessage('') // Clear input immediately for better UX

    try {
      const response = await messagesAPI.send({
        recipient_id: String(selectedConversation.id),
        body: messageText,
      })

      if (response.success) {
        // Add the new message to the list
        const newMsg: Message = {
          id: Date.now(),
          sender: 'staff',
          text: messageText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, newMsg])
        showToast.success('Message sent!')

        // Audit log message send
        auditLog.messageSend(String(selectedConversation.id))
      }
    } catch {
      // Still add the message locally for demo mode
      const newMsg: Message = {
        id: Date.now(),
        sender: 'staff',
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, newMsg])
      showToast.warning('Message saved locally (server unavailable)')

      // Still log the message send attempt in demo mode
      auditLog.messageSend(String(selectedConversation.id))
    } finally {
      setIsSending(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.patient.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SectionErrorBoundary>
      <div className="animate-fadeIn h-[calc(100vh-8rem)] flex">
        {/* Conversations List */}
        <div className="w-80 bg-white dark:bg-gray-800 rounded-l-xl shadow-card border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3" id="messages-heading">Messages</h2>
            <div className="relative">
              <label htmlFor="conversation-search" className="sr-only">Search conversations</label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                id="conversation-search"
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Mock data warning */}
          {isUsingMockData && !isLoadingConversations && (
            <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Demo mode
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <ConversationListSkeleton count={4} />
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-semibold text-primary-600 dark:text-primary-400">
                      {conv.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">{conv.patient}</p>
                        <span className="text-xs text-gray-400">{conv.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-r-xl shadow-card flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-semibold text-primary-600 dark:text-primary-400">
                    {selectedConversation.patient.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedConversation.patient}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active patient</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-6 space-y-4"
                role="log"
                aria-live="polite"
                aria-label="Message history"
              >
                {isLoadingMessages ? (
                  <MessagesSkeleton count={5} />
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            msg.sender === 'staff'
                              ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm'
                          } px-4 py-3`}
                          aria-label={`${msg.sender === 'staff' ? 'You' : 'Patient'} at ${msg.time}`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 flex items-center gap-1 ${
                            msg.sender === 'staff' ? 'text-primary-200' : 'text-gray-400'
                          }`}>
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <label htmlFor="message-input" className="sr-only">Type a message</label>
                  <input
                    id="message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
                    placeholder="Type a message..."
                    disabled={isSending}
                    aria-describedby={isSending ? 'sending-status' : undefined}
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                  {isSending && <span id="sending-status" className="sr-only">Sending message...</span>}
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || isSending}
                    aria-label={isSending ? 'Sending...' : 'Send message'}
                    className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-800 text-white rounded-lg transition-colors"
                  >
                    {isSending ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      <Send className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </SectionErrorBoundary>
  )
}
