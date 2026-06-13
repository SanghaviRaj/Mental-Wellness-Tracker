import type { UserProfile, MoodLog, JournalEntry } from '../types'
import type { Page } from '../types'
import MoodChart from '../components/MoodChart'
import { format, differenceInDays } from 'date-fns'
import { insightStorage } from '../utils/storage'
 
const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Each day is a new opportunity to improve yourself.', author: 'Unknown' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Focus on progress, not perfection.', author: 'Unknown' },
  { text: 'Your only limit is your mind.', author: 'Unknown' },
  { text: 'Hard work beats talent when talent doesn\'t work hard.', author: 'Tim Notke' },
]
 
const MOOD_EMOJIS: Record<number, string> = { 1: '😞', 2: '😟', 3: '😐', 4: '🙂', 5: '😁' }
const MOOD_LABELS: Record<number, string> = { 1: 'Very Low', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' }
 
interface DashboardProps {
  profile: UserProfile
  moods: MoodLog[]
  journals: JournalEntry[]
  onNavigate: (page: Page) => void
}
 
interface StatCardProps {
  emoji: string
  label: string
  value: string
  color: string
}
 
interface QuickActionProps {
  emoji: string
  label: string
  onClick: () => void
}
 
export default function Dashboard({ profile, moods, journals, onNavigate }: DashboardProps) {
  const today = new Date()
  const dayOfYear = differenceInDays(today, new Date(today.getFullYear(), 0, 0))
  const quote = QUOTES[dayOfYear % QUOTES.length]
 
  // Last 7 days moods
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const last7Moods = moods.filter(m => new Date(m.timestamp) >= cutoff)
 
  const avgMood = last7Moods.length
    ? (last7Moods.reduce((s, m) => s + m.mood, 0) / last7Moods.length).toFixed(1)
    : null
  const avgStress = last7Moods.length
    ? (last7Moods.reduce((s, m) => s + m.stressLevel, 0) / last7Moods.length).toFixed(1)
    : null
 
  const lastMood = moods[moods.length - 1]
  const lastJournal = journals[journals.length - 1]
 
  const examDays = profile.examDate
    ? differenceInDays(new Date(profile.examDate), today)
    : null
 
  const streakDays = calculateStreak(moods)
  const latestInsight = insightStorage.get()
 
  const handleLogMoodClick = () => {
    onNavigate('mood')
  }
 
  const handleCardChatClick = () => {
    onNavigate('chat')
  }
 
  const handleChatButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onNavigate('chat')
  }
 
  return (
    <div className="space-y-6">
      {/* Header with name + exam badge */}
      <div className="animate-fade-in-up flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>
              Good {getGreeting()}, {profile.name}! 👋
            </h1>
            <span className="tag tag-purple text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
              {profile.examType} Prep
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
 
        {/* Today's mood quick-log shortcut button */}
        <button
          onClick={handleLogMoodClick}
          className="btn-primary flex items-center justify-center gap-2 text-sm font-medium self-start md:self-auto px-4 py-2 relative z-10"
          aria-label="Log today's mood page"
          type="button"
        >
          <span>😊</span> Log today's mood
        </button>
      </div>
 
      {/* How are you feeling? -> links to Chat */}
      <div 
        className="card card-hover animate-fade-in-up p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
        style={{ 
          background: 'linear-gradient(135deg, rgba(99,119,255,0.08), rgba(45,212,191,0.04))',
          border: '1px solid rgba(99,119,255,0.15)'
        }}
        onClick={handleCardChatClick}
        role="link"
        aria-label="How are you feeling? Chat with Antigravity"
      >
        <div className="space-y-1">
          <h3 className="font-semibold text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>How are you feeling today? 🧠</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Feeling exam pressure or just need a mindful break? Open up to Antigravity.
          </p>
        </div>
        <button 
          className="btn-secondary text-xs flex items-center gap-1.5 flex-shrink-0 relative z-10"
          type="button"
          onClick={handleChatButtonClick}
        >
          <span>💬</span> Chat with Antigravity
        </button>
      </div>
 
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
        <StatCard
          emoji="🔥"
          label="Day Streak"
          value={streakDays === 0 ? '—' : `${streakDays}d`}
          color="#fbbf24"
        />
        <StatCard
          emoji="😊"
          label="Avg Mood"
          value={avgMood ? `${avgMood}/5` : '—'}
          color="#6377ff"
        />
        <StatCard
          emoji="⚡"
          label="Avg Stress"
          value={avgStress ? `${avgStress}/10` : '—'}
          color="#fb7185"
        />
        <StatCard
          emoji="📖"
          label="Journals"
          value={String(journals.length)}
          color="#2dd4bf"
        />
      </div>
 
      {/* Exam countdown */}
      {examDays !== null && examDays >= 0 && (
        <div className="card animate-fade-in-up"
          style={{ background: 'linear-gradient(135deg,rgba(99,119,255,0.15),rgba(168,85,247,0.1))', border: '1px solid rgba(99,119,255,0.25)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{profile.examType} Countdown</p>
              <p className="text-3xl font-bold mt-1 gradient-text" style={{ fontFamily: 'Outfit,sans-serif' }}>
                {examDays} days
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(profile.examDate!), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="text-5xl select-none">🎯</div>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,119,255,0.15)' }}>
            <div className="h-full rounded-full"
              style={{
                width: `${Math.max(5, Math.min(100, 100 - (examDays / 365) * 100))}%`,
                background: 'linear-gradient(90deg,#6377ff,#a855f7)'
              }} />
          </div>
        </div>
      )}
 
      {/* Latest AI insight summary card (if exists) */}
      {latestInsight && (
        <div 
          className="card card-hover animate-fade-in-up cursor-pointer"
          style={{ 
            background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(99,119,255,0.04))',
            border: '1px solid rgba(168,85,247,0.15)' 
          }}
          onClick={() => onNavigate('insights')}
          role="link"
          aria-label="Latest AI Insight"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a855f7]">✦ Latest AI Insight</span>
            <span className="tag tag-purple text-[10px] select-none capitalize">Burnout Risk: {latestInsight.burnoutRisk}</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {latestInsight.summary}
          </p>
          <p className="text-xs text-[#a855f7] font-semibold mt-3 flex items-center gap-1">
            View full report & coping strategies <span>→</span>
          </p>
        </div>
      )}
 
      {/* Chart */}
      <div className="card animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ fontFamily: 'Outfit,sans-serif' }}>Mood & Stress Trend (Last 7 Logs)</h2>
          <button onClick={() => onNavigate('mood')} className="text-xs font-medium"
            style={{ color: 'var(--accent-blue)' }} type="button">View all →</button>
        </div>
        <MoodChart moods={moods} />
      </div>
 
      {/* Bottom grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Daily quote */}
        <div className="card card-hover animate-fade-in-up"
          style={{ background: 'linear-gradient(135deg,rgba(45,212,191,0.08),rgba(99,119,255,0.08))' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#2dd4bf' }}>✦ DAILY QUOTE</p>
          <p className="text-sm font-medium leading-relaxed">"{quote.text}"</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>— {quote.author}</p>
        </div>
 
        {/* Quick actions */}
        <div className="card animate-fade-in-up">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>QUICK ACTIONS</p>
          <div className="space-y-2">
            <QuickAction onClick={() => onNavigate('mood')} emoji="😊" label="Log today's mood" />
            <QuickAction onClick={() => onNavigate('journal')} emoji="📖" label="Write in journal" />
            <QuickAction onClick={() => onNavigate('chat')} emoji="💬" label="Talk to Antigravity" />
            <QuickAction onClick={() => onNavigate('insights')} emoji="✨" label="View wellness insights" />
          </div>
        </div>
      </div>
 
      {/* Last mood & journal */}
      {(lastMood || lastJournal) && (
        <div className="grid md:grid-cols-2 gap-4">
          {lastMood && (
            <div className="card card-hover animate-fade-in-up" onClick={() => onNavigate('mood')} style={{ cursor: 'pointer' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>LAST MOOD LOG</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none">{MOOD_EMOJIS[lastMood.mood]}</span>
                <div>
                  <p className="font-semibold text-sm">Mood {MOOD_LABELS[lastMood.mood]} · Stress {lastMood.stressLevel}/10</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {format(new Date(lastMood.timestamp), 'MMM d, h:mm a')}
                  </p>
                  {lastMood.note && (
                    <p className="text-xs mt-1 truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>{lastMood.note}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {lastJournal && (
            <div className="card card-hover animate-fade-in-up" onClick={() => onNavigate('journal')} style={{ cursor: 'pointer' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>LAST JOURNAL ENTRY</p>
              <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{lastJournal.content}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(lastJournal.timestamp), 'MMM d, h:mm a')}
                {lastJournal.aiInsight && <span className="ml-2 tag tag-purple">AI Analyzed</span>}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
 
function StatCard({ emoji, label, value, color }: StatCardProps) {
  return (
    <div className="card card-hover animate-fade-in-up">
      <p className="text-2xl mb-1 select-none">{emoji}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  )
}

function QuickAction({ emoji, label, onClick }: QuickActionProps) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left relative z-10 hover:bg-[rgba(99,119,255,0.1)]"
      style={{ background: 'rgba(99,119,255,0.04)', border: '1px solid transparent' }}
      type="button"
    >
      <span className="text-lg select-none">{emoji}</span>
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-auto text-xs" style={{ color: 'var(--text-secondary)' }}>→</span>
    </button>
  )
}
 
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
 
function calculateStreak(moods: MoodLog[]): number {
  if (!moods.length) return 0
  const dates = [...new Set(moods.map(m => m.timestamp.slice(0, 10)))].sort().reverse()
  let streak = 0
  let current = new Date()
  current.setHours(0, 0, 0, 0)
  for (const d of dates) {
    const date = new Date(d)
    if (differenceInDays(current, date) <= 1) {
      streak++
      current = date
    } else break
  }
  return streak
}
