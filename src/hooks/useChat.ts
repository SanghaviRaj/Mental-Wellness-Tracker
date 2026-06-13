import { useState, useEffect, useCallback } from 'react'
import type { ChatMessage, ExamType } from '../types'
import { chatStorage, generateId } from '../utils/storage'
import { streamChat } from '../utils/ai'
import { sanitizeText } from '../utils/sanitize'
 
export function useChat(examType: ExamType, studentName: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState<string | null>(null)
 
  // Load saved history on mount
  useEffect(() => {
    setMessages(chatStorage.getAll())
  }, [])
 
  const saveHistory = useCallback((newMsgs: ChatMessage[]) => {
    setMessages(newMsgs)
    chatStorage.save(newMsgs)
  }, [])
 
  const handleSend = useCallback(async () => {
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
        }
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI service error. Please check your API key in Settings.')
      setStreaming(false)
      setStreamText('')
    }
  }, [input, streaming, messages, examType, studentName, saveHistory])
 
  const handleClear = useCallback(() => {
    chatStorage.clear()
    setMessages([])
    setStreamText('')
    setStreaming(false)
    setError(null)
  }, [])
 
  return {
    messages,
    input,
    setInput,
    streaming,
    streamText,
    error,
    handleSend,
    handleClear,
  }
}
