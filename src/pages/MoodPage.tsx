import { useEffect } from 'react'
import type { MoodLog, UserProfile, Page } from '../types'
import type { MoodScore } from '../types'
import MoodPicker from '../components/MoodPicker'
import MoodChart from '../components/MoodChart'
import { useMoodLogs } from '../hooks/useMoodLogs'
import { format } from 'date-fns'
 
const MOOD_EMOJIS: Record<number, string> = { 1: '😞', 2: '😟', 3: '😐', 4: '🙂', 5: '😁' }
const MOOD_LABELS: Record<number, string> = { 1: 'Very Low', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' }
 
interface MoodPageProps {
  profile: UserProfile
  moods: MoodLog[]
  onMoodsUpdate: (moods: MoodLog[]) => void
  onNavigate: (page: Page) => void
}
 
export default function MoodPage({ profile, onMoodsUpdate, onNavigate }: MoodPageProps) {
  const { moods, saving, saved, error, addMood } = useMoodLogs()
 
  // Sync back to global/parent state
  useEffect(() => {
    onMoodsUpdate(moods)
  }, [moods, onMoodsUpdate])
 
  const handleSave = (mood: MoodScore, stress: number, note: string) => {
    addMood(mood, stress, note, profile.examType)
  }
 
  const handleNavigateInsights = () => {
    onNavigate('insights')
  }
 
  const last14 = moods.slice(-14)
  const avgMood7 = moods.slice(-7).reduce((s, m) => s + m.mood, 0) / (moods.slice(-7).length || 1)
  const avgStress7 = moods.slice(-7).reduce((s, m) => s + m.stressLevel, 0) / (moods.slice(-7).length || 1)
 
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>Mood Tracker</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Track your emotional wellbeing throughout your {profile.examType} journey
        </p>
      </div>
 
      {/* Success message */}
      {saved && (
        <div className="p-3 rounded-xl text-sm font-medium text-center animate-fade-in"
          style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', color: '#2dd4bf' }}>
          ✓ Mood logged successfully!
        </div>
      )}
 
      {/* Error message */}
      {error && (
        <div className="p-3 rounded-xl text-sm font-medium text-center animate-fade-in"
          style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185' }}>
          ⚠️ {error}
        </div>
      )}
 
      {/* Link to Insights after 3+ entries */}
      {moods.length >= 3 && (
        <div 
          className="p-4 rounded-xl flex items-center justify-between gap-3 animate-fade-in-up"
          style={{ 
            background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(99,119,255,0.04))', 
            border: '1px solid rgba(168,85,247,0.15)' 
          }}
        >
          <div>
            <h4 className="font-semibold text-sm text-var(--text-primary)">Unlock Weekly Insights 🔮</h4>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              You have logged your mood {moods.length} times. View your customized AI stress reports!
            </p>
          </div>
          <button
            onClick={handleNavigateInsights}
            className="btn-secondary text-xs flex-shrink-0 relative z-10 px-3 py-1.5"
            type="button"
          >
            View Insights →
          </button>
        </div>
      )}
 
      {/* Mood picker */}
      <div className="animate-fade-in-up">
        <MoodPicker examType={profile.examType} onSave={handleSave} loading={saving} />
      </div>
 
      {/* 7-day averages */}
      {moods.length > 0 && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
          <div className="card text-center">
            <p className="text-3xl mb-1 select-none">{MOOD_EMOJIS[Math.round(avgMood7)] ?? '😐'}</p>
            <p className="text-xl font-bold" style={{ color: '#6377ff' }}>{avgMood7.toFixed(1)}/5</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>7-day avg mood</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl mb-1 select-none">⚡</p>
            <p className="text-xl font-bold" style={{ color: '#fb7185' }}>{avgStress7.toFixed(1)}/10</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>7-day avg stress</p>
          </div>
        </div>
      )}
 
      {/* Chart */}
      <div className="card animate-fade-in-up">
        <h2 className="font-semibold mb-4" style={{ fontFamily: 'Outfit,sans-serif' }}>Mood & Stress Trend (Last 7 Logs)</h2>
        <MoodChart moods={last14} />
      </div>
 
      {/* History list */}
      {moods.length > 0 && (
        <div className="card animate-fade-in-up">
          <h2 className="font-semibold mb-4" style={{ fontFamily: 'Outfit,sans-serif' }}>History</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {[...moods].reverse().map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: 'rgba(99,119,255,0.04)', border: '1px solid rgba(99,119,255,0.08)' }}>
                <span className="text-2xl select-none">{MOOD_EMOJIS[m.mood]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{MOOD_LABELS[m.mood]}</span>
                    <span className="tag tag-rose text-[10px]">Stress: {m.stressLevel}/10</span>
                  </div>
                  {m.note && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{m.note}</p>
                  )}
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {format(new Date(m.timestamp), 'MMM d')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
