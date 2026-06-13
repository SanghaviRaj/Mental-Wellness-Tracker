import { LayoutDashboard, BookOpen, Smile, MessageSquare, Sparkles } from 'lucide-react'
import type { Page } from '../types'
 
const NAV_ITEMS: { page: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'journal',   label: 'Journal',   icon: BookOpen },
  { page: 'mood',      label: 'Mood',      icon: Smile },
  { page: 'chat',      label: 'Chat',      icon: MessageSquare },
  { page: 'insights',  label: 'Insights',  icon: Sparkles },
]
 
interface NavBarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  variant: 'sidebar' | 'bottom'
}
 
export default function NavBar({ currentPage, onNavigate, variant }: NavBarProps) {
  if (variant === 'sidebar') {
    return (
      <>
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`nav-item w-full text-left flex items-center gap-3 ${currentPage === page ? 'active' : ''}`}
            aria-current={currentPage === page ? 'page' : undefined}
            aria-label={label}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </>
    )
  }
 
  // Bottom bar for mobile
  return (
    <div className="flex justify-around items-center w-full">
      {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
        const isActive = currentPage === page
        return (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className="flex flex-col items-center gap-1 py-1 rounded-xl transition-all"
            style={isActive ? { color: '#6377ff' } : { color: 'var(--text-secondary)' }}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
