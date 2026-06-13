import { useState } from 'react'
import type { ExamType, UserProfile } from '../types'
import { profileStorage } from '../utils/storage'

const EXAMS: ExamType[] = ['NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC', 'Other']

const EXAM_DESCRIPTIONS: Record<ExamType, string> = {
  NEET:  'Medical entrance exam',
  JEE:   'Engineering entrance exam',
  CUET:  'Central university entrance',
  CAT:   'MBA entrance exam',
  GATE:  'Graduate engineering aptitude',
  UPSC:  'Civil services exam',
  Other: 'Other competitive exam',
}

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [examType, setExamType] = useState<ExamType | null>(null)
  const [examDate, setExamDate] = useState('')
  const [nameError, setNameError] = useState('')

  const handleStep1 = () => {
    if (!name.trim() || name.trim().length < 2) {
      setNameError('Please enter your name (at least 2 characters)')
      return
    }
    setNameError('')
    setStep(2)
  }

  const handleComplete = () => {
    if (!examType) return
    const profile: UserProfile = {
      name: name.trim(),
      examType,
      examDate: examDate || undefined,
      createdAt: new Date().toISOString(),
    }
    profileStorage.set(profile)
    onComplete(profile)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'var(--bg-primary)' }}>
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4"
            style={{ background: 'linear-gradient(135deg,#6377ff,#a855f7)' }}>✦</div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit,sans-serif' }}>Antigravity</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your mental wellness companion for exam prep
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={step >= s
                  ? { background: 'linear-gradient(135deg,#6377ff,#a855f7)', color: 'white' }
                  : { background: 'rgba(99,119,255,0.1)', color: 'var(--text-secondary)' }}>
                {s}
              </div>
              {s < 2 && <div className="w-8 h-0.5 rounded" style={{ background: step > s ? '#6377ff' : 'rgba(99,119,255,0.2)' }} />}
            </div>
          ))}
        </div>

        <div className="card">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Outfit,sans-serif' }}>Welcome! 👋</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Let's get to know you before we begin your wellness journey.
                </p>
              </div>

              <div>
                <label htmlFor="name-input" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Your name
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError('') }}
                  placeholder="e.g. Priya"
                  maxLength={50}
                  className="input-field"
                  aria-describedby={nameError ? 'name-error' : undefined}
                  aria-invalid={!!nameError}
                  onKeyDown={e => e.key === 'Enter' && handleStep1()}
                  autoFocus
                />
                {nameError && (
                  <p id="name-error" className="text-xs mt-1" style={{ color: '#fb7185' }}>{nameError}</p>
                )}
              </div>

              <button onClick={handleStep1} className="btn-primary w-full relative z-10" aria-label="Continue to step 2">
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Outfit,sans-serif' }}>
                  Hi {name}! 🎯
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Which exam are you preparing for?
                </p>
              </div>

              <div>
                <label htmlFor="exam-select" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Select Exam
                </label>
                <select
                  id="exam-select"
                  value={examType || ''}
                  onChange={e => setExamType(e.target.value as ExamType)}
                  className="input-field w-full"
                  style={{ background: 'rgba(99,119,255,0.06)', color: 'var(--text-primary)', border: '1px solid rgba(99,119,255,0.15)' }}
                  aria-label="Select exam type"
                >
                  <option value="" disabled style={{ background: '#0a0e1a' }}>-- Choose your exam --</option>
                  {EXAMS.map(exam => (
                    <option key={exam} value={exam} style={{ background: '#0a0e1a', color: 'var(--text-primary)' }}>
                      {exam} — {EXAM_DESCRIPTIONS[exam]}
                    </option>
                  ))}
                </select>
              </div>

              {examType && (
                <div className="animate-fade-in">
                  <label htmlFor="exam-date" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Exam date <span className="opacity-60">(optional)</span>
                  </label>
                  <input
                    id="exam-date"
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="input-field"
                    style={{ colorScheme: 'dark' }}
                    aria-label="Exam date"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary" aria-label="Go back">← Back</button>
                <button
                  onClick={handleComplete}
                  disabled={!examType}
                  className="btn-primary flex-1 relative z-10"
                  aria-label="Complete onboarding"
                >
                  Let's Begin ✦
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
          All data stored locally. No account needed.
        </p>
      </div>
    </div>
  )
}
