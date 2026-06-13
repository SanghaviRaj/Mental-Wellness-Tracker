import { useState, useCallback } from 'react'
import type { MoodLog, JournalEntry, InsightResult, ExamType } from '../types'
import { analyzeJournals } from '../utils/ai'
import { insightStorage } from '../utils/storage'
 
export function useInsights(examType: ExamType, studentName: string) {
  const [insight, setInsight] = useState<InsightResult | null>(() => insightStorage.get())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
 
  const generateReport = useCallback(async (journals: JournalEntry[], moods: MoodLog[]) => {
    if (journals.length < 3) {
      setError('At least 3 journal entries are required to generate insights.')
      return
    }
 
    setLoading(true)
    setError(null)
 
    try {
      const result = await analyzeJournals(journals, moods, examType, studentName)
      setInsight(result)
      insightStorage.save(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI analysis failed. Please check your API key in Settings.')
    } finally {
      setLoading(false)
    }
  }, [examType, studentName])
 
  return {
    insight,
    loading,
    error,
    generateReport,
  }
}
