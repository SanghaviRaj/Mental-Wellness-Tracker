import { useState, useEffect } from 'react'
import type { Page, UserProfile, MoodLog, JournalEntry } from './types'
import { profileStorage, moodStorage, journalStorage } from './utils/storage'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import MoodPage from './pages/MoodPage'
import JournalPage from './pages/JournalPage'
import ChatPage from './pages/ChatPage'
import InsightsPage from './pages/InsightsPage'
 
import { STORAGE_KEYS } from './constants'

interface SettingsModalProps {
  onClose: () => void
}

// Settings modal for API key management
function SettingsModal({ onClose }: SettingsModalProps) {
  const [key, setKey] = useState(() => localStorage.getItem(STORAGE_KEYS.API_KEY) ?? '')
  const [saved, setSaved] = useState(false)
 
  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim())
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY)
    }
    setSaved(true)
    setTimeout(() => { 
      setSaved(false)
      onClose() 
    }, 1000)
  }
 
  const handleResetData = () => {
    if (confirm('This will delete all your moods, journals, and chat history. Are you sure?')) {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
      window.location.reload()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      role="dialog" aria-modal="true" aria-label="Settings"
      onClick={handleBackdropClick}
    >
      <div className="card w-full max-w-md animate-fade-in-up space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>⚙️ Settings</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-all"
            style={{ background: 'rgba(99,119,255,0.1)' }}
            aria-label="Close settings">✕</button>
        </div>
 
        <div>
          <label htmlFor="api-key-input" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Anthropic API Key
          </label>
          <input
            id="api-key-input"
            type="password"
            value={key}
            onChange={handleKeyChange}
            placeholder="sk-ant-…"
            className="input-field font-mono text-sm"
            aria-describedby="api-key-desc"
            autoComplete="off"
          />
          <p id="api-key-desc" className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
            Your key is stored only in this browser and never sent anywhere except the Anthropic API.
            Leave blank to use the environment variable if set.
          </p>
        </div>
 
        <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
          ⚠️ Keep your API key private. Don't share this device's storage with others.
        </div>
 
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1 relative z-10">
            {saved ? '✓ Saved!' : 'Save Key'}
          </button>
        </div>
 
        {/* Reset data */}
        <div style={{ borderTop: '1px solid rgba(99,119,255,0.1)', paddingTop: '1rem' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>DANGER ZONE</p>
          <button
            onClick={handleResetData}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(251,113,133,0.1)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.2)' }}
            type="button"
          >
            🗑 Reset all data
          </button>
        </div>
      </div>
    </div>
  )
}
 
export default function App() {
  const [page, setPage] = useState<Page>('onboarding')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [moods, setMoods] = useState<MoodLog[]>([])
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [showSettings, setShowSettings] = useState(false)
 
  // Read initial data on mount
  useEffect(() => {
    const activeProfile = profileStorage.get()
    if (activeProfile) {
      setProfile(activeProfile)
      setMoods(moodStorage.getAll())
      setJournals(journalStorage.getAll())
      setPage('dashboard')
    } else {
      setPage('onboarding')
    }
  }, [])
 
  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p)
    setMoods(moodStorage.getAll())
    setJournals(journalStorage.getAll())
    setPage('dashboard')
  }
 
  // Update state whenever data changes globally
  const handleMoodsUpdate = (newMoods: MoodLog[]) => {
    setMoods(newMoods)
  }
 
  const handleJournalsUpdate = (newJournals: JournalEntry[]) => {
    setJournals(newJournals)
  }
 
  // Hide Layout & NavBar on onboarding page
  if (page === 'onboarding' || !profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }
 
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard profile={profile} moods={moods} journals={journals} onNavigate={setPage} />
      case 'mood':
        return <MoodPage profile={profile} moods={moods} onMoodsUpdate={handleMoodsUpdate} onNavigate={setPage} />
      case 'journal':
        return <JournalPage profile={profile} journals={journals} onJournalsUpdate={handleJournalsUpdate} />
      case 'chat':
        return <ChatPage profile={profile} />
      case 'insights':
        return <InsightsPage profile={profile} moods={moods} journals={journals} />
      default:
        return <Dashboard profile={profile} moods={moods} journals={journals} onNavigate={setPage} />
    }
  }
 
  return (
    <>
      <Layout
        currentPage={page}
        onNavigate={setPage}
        profile={profile}
        onOpenSettings={() => setShowSettings(true)}
      >
        {renderPage()}
      </Layout>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
