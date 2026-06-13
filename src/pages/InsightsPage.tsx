import { useState, useCallback, useEffect } from 'react'
import type { MoodLog, JournalEntry, InsightResult, UserProfile } from '../types'
import InsightCard from '../components/InsightCard'
import { analyzeJournals } from '../utils/ai'
import { insightStorage } from '../utils/storage'
 
// Interactive box breathing exercise
function BoxBreathing() {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2'>('idle')
  const [count, setCount] = useState(0)
  const [cycles, setCycles] = useState(0)
  const MAX_CYCLES = 4
 
  const PHASES: { key: typeof phase; label: string; duration: number; color: string }[] = [
    { key: 'inhale', label: 'Inhale',      duration: 4, color: '#6377ff' },
    { key: 'hold1',  label: 'Hold',        duration: 4, color: '#a855f7' },
    { key: 'exhale', label: 'Exhale',      duration: 4, color: '#2dd4bf' },
    { key: 'hold2',  label: 'Hold',        duration: 4, color: '#fbbf24' },
  ]
 
  useEffect(() => {
    if (phase === 'idle') return
    const current = PHASES.find(p => p.key === phase)!
    if (count < current.duration) {
      const t = setTimeout(() => setCount(c => c + 1), 1000)
      return () => clearTimeout(t)
    }
    const idx = PHASES.findIndex(p => p.key === phase)
    const next = PHASES[(idx + 1) % PHASES.length]
    if (idx === PHASES.length - 1) {
      const newCycles = cycles + 1
      setCycles(newCycles)
      if (newCycles >= MAX_CYCLES) { setPhase('idle'); setCycles(0); setCount(0); return }
    }
    setPhase(next.key)
    setCount(0)
  }, [phase, count, cycles])
 
  const start = () => { setPhase('inhale'); setCount(0); setCycles(0) }
  const stop  = () => { setPhase('idle'); setCount(0); setCycles(0) }
 
  const current = PHASES.find(p => p.key === phase)
  const progress = phase !== 'idle' && current ? (count / current.duration) * 100 : 0
 
  return (
    <div className="card text-center space-y-4">
      <div>
        <h3 className="font-semibold" style={{ fontFamily: 'Outfit,sans-serif' }}>Box Breathing</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          4-4-4-4 pattern · {MAX_CYCLES} cycles · ~1.5 minutes
        </p>
      </div>
 
      {/* Breathing circle */}
      <div className="relative flex items-center justify-center mx-auto"
        style={{ width: 160, height: 160 }}>
        {/* Outer ring */}
        <svg width="160" height="160" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(99,119,255,0.1)" strokeWidth="6" />
          {phase !== 'idle' && current && (
            <circle
              cx="80" cy="80" r="70" fill="none"
              stroke={current.color}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          )}
        </svg>
        {/* Inner blob */}
        <div
          className="rounded-full flex flex-col items-center justify-center transition-all duration-1000"
          style={{
            width: phase === 'inhale' ? 110 : phase === 'exhale' ? 80 : 95,
            height: phase === 'inhale' ? 110 : phase === 'exhale' ? 80 : 95,
            background: phase !== 'idle' && current
              ? `radial-gradient(circle, ${current.color}33, ${current.color}11)`
              : 'rgba(99,119,255,0.08)',
            border: `2px solid ${phase !== 'idle' && current ? current.color + '44' : 'rgba(99,119,255,0.15)'}`,
          }}
        >
          {phase === 'idle' ? (
            <span className="text-3xl select-none">🌬️</span>
          ) : (
            <>
              <p className="text-2xl font-bold">{current!.duration - count}</p>
              <p className="text-xs font-medium capitalize" style={{ color: current!.color }}>{current!.label}</p>
            </>
          )}
        </div>
      </div>
 
      {/* Cycle indicator */}
      {phase !== 'idle' && (
        <div className="flex justify-center gap-1.5" aria-label={`Cycle ${cycles + 1} of ${MAX_CYCLES}`}>
          {Array.from({ length: MAX_CYCLES }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all"
              style={{ background: i < cycles ? '#2dd4bf' : i === cycles ? '#6377ff' : 'rgba(99,119,255,0.2)' }} />
          ))}
        </div>
      )}
 
      <button
        onClick={phase === 'idle' ? start : stop}
        className={phase === 'idle' ? 'btn-primary relative z-10' : 'btn-secondary'}
        aria-label={phase === 'idle' ? 'Start box breathing exercise' : 'Stop exercise'}
        type="button"
      >
        {phase === 'idle' ? '▶ Start Exercise' : '⏹ Stop'}
      </button>
 
      {phase === 'idle' && cycles > 0 && (
        <p className="text-sm animate-fade-in" style={{ color: '#2dd4bf' }}>
          ✓ Well done! {MAX_CYCLES} cycles complete.
        </p>
      )}
    </div>
  )
}
 
function LoadingSkeleton() {
  return (
    <div className="card space-y-5 animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
      <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,0.05)]">
        <div className="space-y-2 w-1/2">
          <div className="h-4 bg-[rgba(99,119,255,0.2)] rounded w-3/4" />
          <div className="h-3 bg-[rgba(255,255,255,0.06)] rounded w-1/2" />
        </div>
        <div className="h-8 bg-[rgba(255,255,255,0.06)] rounded-full w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-[rgba(255,255,255,0.06)] rounded w-full" />
        <div className="h-3.5 bg-[rgba(255,255,255,0.06)] rounded w-5/6" />
      </div>
      <div className="space-y-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
        <div className="h-3 bg-[rgba(255,255,255,0.06)] rounded w-1/4" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-[rgba(255,255,255,0.04)] rounded-lg w-16" />
          <div className="h-6 bg-[rgba(255,255,255,0.04)] rounded-lg w-20" />
          <div className="h-6 bg-[rgba(255,255,255,0.04)] rounded-lg w-24" />
        </div>
      </div>
      <div className="space-y-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
        <div className="h-4 bg-[rgba(99,119,255,0.1)] rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-28 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.05)]" />
          <div className="h-28 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.05)]" />
          <div className="h-28 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.05)]" />
        </div>
      </div>
    </div>
  )
}
 
interface InsightsPageProps {
  profile: UserProfile
  moods: MoodLog[]
  journals: JournalEntry[]
}
 
const RISK_STYLES = {
  low: { text: '#2dd4bf', border: 'rgba(45,212,191,0.25)', bg: 'rgba(45,212,191,0.06)' },
  moderate: { text: '#fbbf24', border: 'rgba(251,191,36,0.25)', bg: 'rgba(251,191,36,0.06)' },
  high: { text: '#fb7185', border: 'rgba(251,113,133,0.25)', bg: 'rgba(251,113,133,0.06)' }
}
 
export default function InsightsPage({ profile, moods, journals }: InsightsPageProps) {
  const [insight, setInsight] = useState<InsightResult | null>(() => insightStorage.get())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
 
  const handleAnalyze = useCallback(async () => {
    if (journals.length < 3) return
    setLoading(true)
    setError(null)
 
    try {
      const result = await analyzeJournals(
        journals,
        moods,
        profile.examType,
        profile.name
      )
      setInsight(result)
      insightStorage.save(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI analysis failed. Please check your API key in Settings.')
    } finally {
      setLoading(false)
    }
  }, [moods, journals, profile.examType, profile.name])
 
  const canGenerate = journals.length >= 3
 
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>Insights ✨</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          AI-powered analysis of your wellness patterns during {profile.examType} preparation
        </p>
      </div>
 
      {/* Weekly analysis trigger card */}
      <div className="card animate-fade-in-up"
        style={{ 
          background: 'linear-gradient(135deg,rgba(99,119,255,0.12),rgba(168,85,247,0.08))', 
          border: '1px solid rgba(99,119,255,0.2)' 
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>Weekly Wellness Report</h2>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Analyzes your mood logs and journal entries to identify stressors, behavioral patterns, and burnout risk.
            </p>
            <div className="flex gap-4 mt-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1">📊 {moods.length} mood logs</span>
              <span className="flex items-center gap-1">📖 {journals.length} journal entries</span>
            </div>
          </div>
          <div className="text-4xl flex-shrink-0 select-none">🔬</div>
        </div>
 
        <button
          onClick={handleAnalyze}
          disabled={loading || !canGenerate}
          className="btn-primary mt-4 relative z-10 font-medium px-5"
          aria-label="Generate AI wellness report"
          type="button"
        >
          {loading ? 'Analyzing with Claude…' : '✨ Generate Report'}
        </button>
 
        {!canGenerate && (
          <p className="text-xs mt-2.5 font-medium" style={{ color: '#fb7185' }}>
            ⚠️ Requires at least 3 journal entries to unlock (Current: {journals.length}/3)
          </p>
        )}
      </div>
 
      {/* Error Notification */}
      {error && (
        <div className="card animate-fade-in" style={{ borderColor: 'rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.05)' }}>
          <p className="text-sm font-medium" style={{ color: '#fb7185' }}>⚠️ {error}</p>
        </div>
      )}
 
      {/* Loading Skeleton */}
      {loading && <LoadingSkeleton />}
 
      {/* Renders AI Insight Result */}
      {insight && !loading && (
        <div className="card space-y-6 animate-fade-in-up">
          {/* Header & Burnout Risk Badge */}
          <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <h3 className="font-semibold text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>AI Wellness Analysis</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Generated from your journals & mood logs</p>
            </div>
            
            {/* Burnout risk badge */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--text-secondary)' }}>Burnout Risk</span>
              <span 
                className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{
                  color: RISK_STYLES[insight.burnoutRisk]?.text || 'white',
                  background: RISK_STYLES[insight.burnoutRisk]?.bg || 'rgba(255,255,255,0.05)',
                  border: `1px solid ${RISK_STYLES[insight.burnoutRisk]?.border || 'transparent'}`
                }}
              >
                {insight.burnoutRisk}
              </span>
            </div>
          </div>
 
          {/* Wellness Summary */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">Wellness Summary</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {insight.summary}
            </p>
          </div>
 
          {/* Trigger Tags List & Pattern Summary */}
          <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            {/* Stress Triggers */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">⚡ Identified Stress Triggers</h4>
              <div className="flex flex-wrap gap-2">
                {insight.triggers.map((trigger, idx) => (
                  <span key={idx} className="tag tag-rose text-xs font-semibold px-2.5 py-1">
                    {trigger}
                  </span>
                ))}
                {insight.triggers.length === 0 && (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>No specific triggers identified yet.</span>
                )}
              </div>
            </div>
 
            {/* Thought/Behavioral Patterns */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">🔍 Patterns & Trends</h4>
              <ul className="space-y-1.5 list-disc list-inside">
                {insight.patterns.map((pattern, idx) => (
                  <li key={idx} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {pattern}
                  </li>
                ))}
                {insight.patterns.length === 0 && (
                  <li className="text-xs" style={{ color: 'var(--text-secondary)' }}>No recurring wellness patterns detected.</li>
                )}
              </ul>
            </div>
          </div>
 
          {/* Coping Strategies (renders 3 cards) */}
          <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">🌱 Recommended Coping Strategies</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insight.copingStrategies.map((strategy, idx) => (
                <InsightCard key={idx} strategy={strategy} />
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* Box breathing exercise */}
      <div className="animate-fade-in-up">
        <BoxBreathing />
      </div>
 
      {/* Mindfulness tips */}
      <div className="card animate-fade-in-up">
        <h2 className="font-semibold mb-4" style={{ fontFamily: 'Outfit,sans-serif' }}>🌿 Wellness Tips for {profile.examType}</h2>
        <div className="space-y-3">
          {TIPS.map(tip => (
            <div key={tip.title} className="flex gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(99,119,255,0.04)', border: '1px solid rgba(99,119,255,0.08)' }}>
              <span className="text-xl flex-shrink-0 select-none">{tip.emoji}</span>
              <div>
                <p className="text-sm font-medium">{tip.title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
 
const TIPS = [
  { emoji: '⏰', title: 'Pomodoro Technique', desc: 'Study for 25 minutes, rest for 5. After 4 cycles, take a longer 20-minute break.' },
  { emoji: '😴', title: 'Sleep is Non-Negotiable', desc: '7-8 hours of sleep improves memory consolidation and reduces cortisol levels significantly.' },
  { emoji: '🚶', title: 'Movement Breaks', desc: 'A 10-minute walk between study sessions boosts blood flow to the brain and improves focus.' },
  { emoji: '🥗', title: 'Brain-Friendly Nutrition', desc: 'Eat foods rich in omega-3 (walnuts, flaxseed), avoid heavy meals before study sessions.' },
  { emoji: '📵', title: 'Digital Detox Hours', desc: 'Keep your phone away for at least 1 hour before sleep to improve sleep quality.' },
]
