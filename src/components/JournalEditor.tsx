import { useState, useEffect, useRef } from 'react'
import { sanitizeText, validateJournalContent } from '../utils/sanitize'
 
interface JournalEditorProps {
  examType: string
  onSave: (content: string) => void
  saving?: boolean
}
 
export default function JournalEditor({ examType, onSave, saving = false }: JournalEditorProps) {
  // Load draft from localStorage on mount
  const [content, setContent] = useState(() => localStorage.getItem('ag_journal_draft') ?? '')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef(content)
 
  // Update the ref whenever content changes
  useEffect(() => {
    contentRef.current = content
  }, [content])
 
  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (contentRef.current.trim()) {
        localStorage.setItem('ag_journal_draft', contentRef.current)
      }
    }, 30000)
 
    return () => {
      clearInterval(interval)
    }
  }, [])
 
  const charCount = content.length
  // Submit button disabled until 50+ chars
  const isDisabled = charCount < 50 || charCount > 1000 || saving
 
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
    localStorage.removeItem('ag_journal_draft')
  }
 
  const charColor = charCount < 50 ? '#fb7185' : charCount > 950 ? '#fbbf24' : '#2dd4bf'
 
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
          {charCount}/1000
        </span>
      </div>
 
      {/* Writing prompts */}
      <div className="flex flex-wrap gap-2">
        {prompts.map(p => (
          <button
            key={p}
            onClick={() => {
              setContent(prev => prev ? prev.trim() + ' ' + p : p + ' ')
              textareaRef.current?.focus()
              setError(null)
            }}
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
          onChange={e => {
            setContent(e.target.value)
            setError(null)
          }}
          placeholder="Start writing about your day, your feelings, your progress (minimum 50 characters)…"
          rows={8}
          maxLength={1000}
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
            width: `${Math.min((charCount / 1000) * 100, 100)}%`,
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
