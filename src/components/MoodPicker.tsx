import { useState } from 'react'
import type { MoodScore, ExamType } from '../types'
import { validateMoodInput } from '../utils/sanitize'
 
const MOODS: { score: MoodScore; emoji: string; label: string }[] = [
  { score: 1, emoji: '😞', label: 'Very Low' },
  { score: 2, emoji: '😟', label: 'Low' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😁', label: 'Great' },
]
 
interface MoodPickerProps {
  examType: ExamType
  onSave: (mood: MoodScore, stress: number, note: string) => void
  loading?: boolean
}
 
export default function MoodPicker({ examType, onSave, loading = false }: MoodPickerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodScore | null>(null)
  const [stress, setStress] = useState(5)
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState('')
 
  const handleSave = () => {
    if (!selectedMood) {
      setValidationError('Please select a mood.')
      return
    }
 
    if (!validateMoodInput(selectedMood, stress)) {
      setValidationError('Invalid mood or stress level selection.')
      return
    }
 
    if (note.length > 100) {
      setValidationError('Note must be 100 characters or less.')
      return
    }
 
    setValidationError('')
    onSave(selectedMood, stress, note)
    setSelectedMood(null)
    setStress(5)
    setNote('')
  }
 
  const stressColor = stress <= 3 ? '#2dd4bf' : stress <= 6 ? '#fbbf24' : '#fb7185'
 
  return (
    <div className="card space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold mb-1" style={{ fontFamily: 'Outfit,sans-serif' }}>How are you feeling?</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select the emoji that best matches your current mood</p>
        </div>
        <span className="tag tag-purple text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
          Exam: {examType}
        </span>
      </div>
 
      {/* Mood emoji row */}
      <div className="flex justify-between px-2" role="group" aria-label="Mood selection">
        {MOODS.map(({ score, emoji, label }) => (
          <button
            key={score}
            onClick={() => {
              setSelectedMood(score)
              setValidationError('')
            }}
            className={`mood-emoji ${selectedMood === score ? 'selected' : ''} flex flex-col items-center gap-1`}
            aria-label={`Mood: ${label}`}
            aria-pressed={selectedMood === score}
            type="button"
          >
            <span className="text-3xl">{emoji}</span>
            <span className="text-xs font-medium" style={{
              color: selectedMood === score ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.65rem'
            }}>
              {label}
            </span>
          </button>
        ))}
      </div>
 
      {selectedMood && (
        <div className="animate-fade-in space-y-4">
          {/* Stress level slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Stress Level
              </label>
              <span className="text-lg font-bold" style={{ color: stressColor }}>{stress}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={stress}
              onChange={e => setStress(Number(e.target.value))}
              className="w-full"
              aria-label="Stress level"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={stress}
              style={{
                background: `linear-gradient(to right, ${stressColor} ${(stress - 1) * 11.1}%, rgba(99,119,255,0.2) ${(stress - 1) * 11.1}%)`
              }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Relaxed</span>
              <span>Very stressed</span>
            </div>
          </div>
 
          {/* Optional note */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium block" style={{ color: 'var(--text-secondary)' }}>
                Quick note <span className="opacity-60">(optional)</span>
              </label>
              <span className="text-xs" style={{ color: note.length > 100 ? '#fb7185' : 'var(--text-secondary)' }}>
                {note.length}/100
              </span>
            </div>
            <textarea
              value={note}
              onChange={e => {
                setNote(e.target.value)
                if (e.target.value.length <= 100) setValidationError('')
              }}
              placeholder="What's on your mind right now?"
              maxLength={100}
              rows={2}
              className="input-field resize-none"
              aria-label="Optional mood note"
            />
          </div>
 
          {validationError && (
            <p className="text-xs text-left" style={{ color: '#fb7185' }}>{validationError}</p>
          )}
 
          <button
            onClick={handleSave}
            disabled={loading || note.length > 100}
            className="btn-primary w-full relative z-10"
            aria-label="Save mood log"
            type="button"
          >
            {loading ? 'Saving…' : 'Log Mood ✓'}
          </button>
        </div>
      )}
    </div>
  )
}
