import type { Page, UserProfile } from '../types'
import NavBar from './NavBar'
 
interface LayoutProps {
  children: React.ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
  profile: UserProfile | null
  onOpenSettings: () => void
}
 
interface ExamCountdownProps {
  examDate: string
}
 
export default function Layout({ children, currentPage, onNavigate, profile, onOpenSettings }: LayoutProps) {
  return (
    <div className="relative min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
 
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen sticky top-0 z-20 p-4 gap-2"
        style={{ borderRight: '1px solid rgba(99,119,255,0.1)', background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(20px)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 py-3 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg,#6377ff,#a855f7)' }}>
            ✦
          </div>
          <span className="font-bold text-lg gradient-text" style={{ fontFamily: 'Outfit,sans-serif' }}>Antigravity</span>
        </div>
 
        {/* Profile badge */}
        {profile && (
          <div className="glass-lighter rounded-2xl p-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#6377ff,#a855f7)' }}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{profile.name}</p>
                <span className="tag tag-blue text-xs">{profile.examType}</span>
              </div>
            </div>
            {profile.examDate && (
              <ExamCountdown examDate={profile.examDate} />
            )}
          </div>
        )}
 
        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          <NavBar currentPage={currentPage} onNavigate={onNavigate} variant="sidebar" />
        </nav>
 
        {/* Settings */}
        <button onClick={onOpenSettings} className="nav-item w-full" aria-label="Open settings">
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </aside>
 
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{ background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,119,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#6377ff,#a855f7)' }}>✦</div>
            <span className="font-bold gradient-text" style={{ fontFamily: 'Outfit,sans-serif' }}>Antigravity</span>
          </div>
          <button onClick={onOpenSettings} aria-label="Settings" className="p-2 rounded-xl"
            style={{ background: 'rgba(99,119,255,0.1)' }}>⚙️</button>
        </header>
 
        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
 
        {/* Mobile bottom nav */}
        <nav className="md:hidden sticky bottom-0 z-20 px-4 pb-4 pt-2"
          style={{ background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(99,119,255,0.1)' }}>
          <NavBar currentPage={currentPage} onNavigate={onNavigate} variant="bottom" />
        </nav>
      </div>
    </div>
  )
}
 
function ExamCountdown({ examDate }: ExamCountdownProps) {
  const days = Math.ceil((new Date(examDate).getTime() - Date.now()) / 86_400_000)
  if (days < 0) {
    return null
  }
  const color = days <= 30 ? '#fb7185' : days <= 90 ? '#fbbf24' : '#2dd4bf'
  return (
    <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(99,119,255,0.1)' }}>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Exam in</p>
      <p className="text-lg font-bold" style={{ color }}>{days} days</p>
    </div>
  )
}
