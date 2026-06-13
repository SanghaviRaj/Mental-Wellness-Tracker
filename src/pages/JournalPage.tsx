import { useState, useCallback } from 'react'
import type { JournalEntry, UserProfile } from '../types'
import JournalEditor from '../components/JournalEditor'
import { journalStorage, generateId } from '../utils/storage'
import { format } from 'date-fns'
 
interface JournalPageProps {
  profile: UserProfile
  journals: JournalEntry[]
  onJournalsUpdate: (journals: JournalEntry[]) => void
}
 
export default function JournalPage({ profile, journals, onJournalsUpdate }: JournalPageProps) {
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
 
  const handleSave = useCallback((content: string) => {
    setSaving(true)
    const entry: JournalEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      content,
      examType: profile.examType,
    }
    journalStorage.save(entry)
    onJournalsUpdate(journalStorage.getAll())
    setSaving(false)
  }, [profile.examType, onJournalsUpdate])
 
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>Journal 📖</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Write freely — your thoughts, progress, and feelings during {profile.examType} prep
        </p>
      </div>
 
      {/* Editor */}
      <div className="animate-fade-in-up">
        <JournalEditor
          examType={profile.examType}
          onSave={handleSave}
          saving={saving}
        />
      </div>
 
      {/* Journal history */}
      {journals.length > 0 && (
        <div className="card animate-fade-in-up">
          <h2 className="font-semibold mb-4 text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>
            Past Entries ({journals.length})
          </h2>
          <div className="space-y-3">
            {[...journals].reverse().map(entry => {
              const displayDate = format(new Date(entry.timestamp), 'MMM d, yyyy · h:mm a')
              // Truncate to first 80 characters for the preview
              const previewText = entry.content.length > 80 
                ? entry.content.slice(0, 80) + '...' 
                : entry.content
 
              const isExpanded = expandedId === entry.id
 
              return (
                <div key={entry.id} className="transition-all duration-200">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full text-left p-4 rounded-xl transition-all hover:bg-[rgba(99,119,255,0.06)]"
                    style={{ 
                      background: isExpanded ? 'rgba(99,119,255,0.06)' : 'rgba(99,119,255,0.03)', 
                      border: '1px solid rgba(99,119,255,0.08)' 
                    }}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold select-none" style={{ color: 'var(--text-secondary)' }}>
                          {displayDate}
                        </span>
                        <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--text-primary)' }}>
                          {isExpanded ? entry.content : previewText}
                        </p>
                        {entry.aiInsight && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
                            <span className="text-xs font-medium text-[#a855f7]">AI Insight Available</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-mono select-none px-2 py-0.5 rounded" style={{
                        background: 'rgba(99,119,255,0.1)',
                        color: 'var(--text-secondary)'
                      }}>
                        {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
                      </span>
                    </div>
                  </button>
 
                  {isExpanded && entry.aiInsight && (
                    <div className="mt-2 mx-1 p-4 rounded-xl animate-fade-in"
                      style={{ 
                        background: 'rgba(168,85,247,0.04)', 
                        border: '1px solid rgba(168,85,247,0.12)' 
                      }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">✦</span>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#a855f7]">AI Wellness Insight</p>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {entry.aiInsight}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
