import { useState, useEffect, useRef } from 'react'
import type { ChatMessage, ExamType } from '../types'
import { chatStorage, generateId } from '../utils/storage'
import { streamChat } from '../utils/ai'
import { sanitizeText } from '../utils/sanitize'
import { format } from 'date-fns'
 
interface ChatWindowProps {
  examType: ExamType
  studentName: string
}
 
export default function ChatWindow({ examType, studentName }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
 
  // Load saved chat history on mount
  useEffect(() => {
    setMessages(chatStorage.getAll())
  }, [])
 
  // Auto-scroll to bottom of messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText, streaming])
 
  const saveHistory = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs)
    chatStorage.save(newMsgs)
  }
 
  const handleSend = async () => {
    const text = input.trim()
    if (!text || streaming) return
 
    const sanitized = sanitizeText(text)
    if (!sanitized) return
 
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: sanitized,
      timestamp: new Date().toISOString(),
    }
 
    const updatedMessages = [...messages, userMsg]
    saveHistory(updatedMessages)
    setInput('')
    setStreaming(true)
    setStreamText('')
    setError(null)
 
    try {
      let accumulated = ''
      // Format messages history to match API requirements
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))
 
      await streamChat(
        apiMessages,
        examType,
        studentName,
        (chunk) => {
          accumulated += chunk
          setStreamText(accumulated)
        },
        () => {
          const aiMsg: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: accumulated,
            timestamp: new Date().toISOString(),
          }
          saveHistory([...updatedMessages, aiMsg])
          setStreaming(false)
          setStreamText('')
          // Focus input after done
          setTimeout(() => inputRef.current?.focus(), 50)
        }
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI service error. Please check your API key in Settings.')
      setStreaming(false)
      setStreamText('')
    }
  }
 
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
 
  // Clear chat button with confirmation
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your chat history? This cannot be undone.')) {
      chatStorage.clear()
      setMessages([])
      setStreamText('')
      setStreaming(false)
      setError(null)
    }
  }
 
  const STARTERS = [
    "I'm feeling overwhelmed with my syllabus",
    'How do I stay motivated today?',
    "I can't focus during my study sessions",
    'Share a quick stress relief technique',
  ]
 
  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Header action panel */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {messages.length} messages
        </span>
        {messages.length > 0 && (
          <button 
            onClick={handleClear} 
            className="text-xs py-1.5 px-3 rounded-lg font-medium transition-all"
            style={{ 
              background: 'rgba(251,113,133,0.1)', 
              color: '#fb7185', 
              border: '1px solid rgba(251,113,133,0.2)' 
            }}
            aria-label="Clear chat history"
            type="button"
          >
            🗑 Clear Chat
          </button>
        )}
      </div>
 
      {/* Message List */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0 card flex flex-col justify-between" style={{ minHeight: '300px' }}>
        <div className="space-y-4 py-2" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-3 animate-breathe">✨</div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: 'Outfit,sans-serif' }}>Meet Antigravity</h3>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Your warm and empathetic mental wellness companion for your {examType} preparation journey. Share how you're feeling.
              </p>
            </div>
          )}
 
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 animate-fade-in ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              style={{ animationDelay: `${i * 0.01}s` }}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 pl-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'linear-gradient(135deg,#6377ff,#a855f7)' }}>✦</div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Antigravity</span>
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="text-[10px] px-1" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(msg.timestamp), 'h:mm a')}
              </span>
            </div>
          ))}
 
          {/* Streaming response */}
          {(streaming || streamText) && (
            <div className="flex flex-col gap-1 items-start animate-fade-in">
              <div className="flex items-center gap-1.5 pl-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs animate-pulse-glow"
                  style={{ background: 'linear-gradient(135deg,#6377ff,#a855f7)' }}>✦</div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Antigravity</span>
              </div>
              <div className="chat-bubble-ai">
                {streamText ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {streamText}
                    <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse bg-[#6377ff]" style={{ borderRadius: 2 }} />
                  </p>
                ) : (
                  <div className="flex gap-1.5 py-1.5 px-1" aria-label="Antigravity is typing">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: '#6377ff', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
 
      {/* Conversation Starters */}
      {messages.length === 0 && !streaming && (
        <div className="grid grid-cols-2 gap-2 mt-3 flex-shrink-0">
          {STARTERS.map(s => (
            <button 
              key={s} 
              onClick={() => {
                setInput(s)
                inputRef.current?.focus()
              }}
              className="text-xs text-left p-3 rounded-xl transition-all hover:bg-[rgba(99,119,255,0.1)]"
              style={{ 
                background: 'rgba(99,119,255,0.04)', 
                border: '1px solid rgba(99,119,255,0.1)', 
                color: 'var(--text-secondary)' 
              }}
              type="button"
            >
              "{s}"
            </button>
          ))}
        </div>
      )}
 
      {/* Error notification */}
      {error && (
        <div className="mt-2 p-3 rounded-xl text-sm animate-fade-in flex-shrink-0"
          style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', color: '#fb7185' }}>
          ⚠️ {error}
        </div>
      )}
 
      {/* Input panel */}
      <div className="mt-3 flex-shrink-0 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Antigravity anything… (Enter to send, Shift+Enter for new line)"
          rows={2}
          maxLength={500}
          disabled={streaming}
          className="input-field flex-1 resize-none"
          aria-label="Message text"
        />
        <button
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          className="btn-primary"
          style={{ height: '3.2rem', minWidth: '4.5rem' }}
          aria-label="Send message"
          type="button"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
