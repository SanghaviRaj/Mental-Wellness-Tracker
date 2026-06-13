import { useState, useEffect, useRef } from 'react'
import { sanitizeText, validateJournalContent } from '../utils/sanitize'
import { STORAGE_KEYS, CHARACTER_LIMITS, TIMERS } from '../constants'
 
interface JournalEditorProps {
  examType: string
  onSave: (content: string) => void
  saving?: boolean
}
 
export default function JournalEditor({ examType, onSave, saving = false }: JournalEditorProps) {
  // Load draft from localStorage on mount
  const [content, setContent] = useState(() => localStorage.getItem(STORAGE_KEYS.DRAFT) ?? '')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef(content)
 
  // Update the ref whenever content changes
  useEffect(() => {
    contentRef.current = content
  }, [content])
 
  // Auto-save to localStorage every interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (contentRef.current.trim()) {
        localStorage.setItem(STORAGE_KEYS.DRAFT, contentRef.current)
      }
    }, TIMERS.DRAFT_AUTOSAVE_INTERVAL_MS)
 
    return () => {
      clearInterval(interval)
    }
  }, [])
 
  const charCount = content.length
  // Submit button disabled based on character limits
  const isDisabled = charCount < CHARACTER_LIMITS.JOURNAL_MIN_LENGTH || charCount > CHARACTER_LIMITS.JOURNAL_MAX_LENGTH || saving
 
  const handleSave = () => {
    const err = validateJournalContent(content)
    if (err) {
      setError(err)
      return
    }
    setError(null)
 
    // Sanitize before saving
    const sanitized = sanitizeText(content)
    onSave(sanitized)
 
    // Clear content and remove draft from localStorage
    setContent('')
    localStorage.removeItem(STORAGE_KEYS.DRAFT)
  }
 
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setError(null)
  }
 
  const handlePromptClick = (prompt: string) => {
    setContent(prev => prev ? prev.trim() + ' ' + prompt : prompt + ' ')
    textareaRef.current?.focus()
    setError(null)
  }
 
  const minLen = CHARACTER_LIMITS.JOURNAL_MIN_LENGTH
  const maxLen = CHARACTER_LIMITS.JOURNAL_MAX_LENGTH
  const charColor = charCount < minLen ? '#fb7185' : charCount > (maxLen - 50) ? '#fbbf24' : '#2dd4bf'
 
  const prompts = [
    'What challenged me today in my preparation?',
    'What am I most anxious about right now?',
    'What small win can I celebrate today?',
    'How am I balancing study and rest?',
  ]
 
  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>Today's Journal</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Reflect on your {examType} preparation journey
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded-lg select-none" style={{
          background: 'rgba(99,119,255,0.1)',
          color: charColor
        }}>
          {charCount}/{maxLen}
        </span>
      </div>
 
      {/* Writing prompts */}
      <div className="flex flex-wrap gap-2">
        {prompts.map(p => (
          <button
            key={p}
            onClick={() => handlePromptClick(p)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: 'rgba(99,119,255,0.08)',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(99,119,255,0.15)'
            }}
            type="button"
          >
            {p}
          </button>
        ))}
      </div>
 
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          placeholder={`Start writing about your day, your feelings, your progress (minimum ${minLen} characters)…`}
          rows={8}
          maxLength={maxLen}
          className="input-field resize-none w-full"
          aria-label="Journal entry input"
          aria-describedby={error ? 'journal-error-inline' : undefined}
          aria-invalid={!!error}
        />
      </div>
 
      {error && (
        <p id="journal-error-inline" className="text-sm animate-fade-in font-medium" style={{ color: '#fb7185' }}>
          {error}
        </p>
      )}
 
      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(99,119,255,0.1)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min((charCount / maxLen) * 100, 100)}%`,
            background: `linear-gradient(90deg, ${charColor}, #6377ff)`
          }}
        />
      </div>
 
      <button
        onClick={handleSave}
        disabled={isDisabled}
        className="btn-primary w-full relative z-10 font-medium py-2.5"
        aria-label="Save journal entry"
        type="button"
      >
        {saving ? 'Saving…' : '💾 Save Journal Entry'}
      </button>
    </div>
  )
}
