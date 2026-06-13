import { useState, useCallback } from 'react'
import type { JournalEntry, ExamType } from '../types'
import { journalStorage, generateId } from '../utils/storage'
import { sanitizeText, validateJournalContent } from '../utils/sanitize'
 
export function useJournalEntries() {
  const [journals, setJournals] = useState<JournalEntry[]>(() => journalStorage.getAll())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
 
  const addJournal = useCallback((content: string, examType: ExamType) => {
    setError(null)
    const err = validateJournalContent(content)
    if (err) {
      setError(err)
      return
    }
 
    try {
      setSaving(true)
      const sanitized = sanitizeText(content)
      const entry: JournalEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        content: sanitized,
        examType,
      }
      journalStorage.save(entry)
      setJournals(journalStorage.getAll())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving journal entry.')
    } finally {
      setSaving(false)
    }
  }, [])
 
  const refreshJournals = useCallback(() => {
    setJournals(journalStorage.getAll())
  }, [])
 
  return { journals, saving, error, addJournal, refreshJournals }
}
