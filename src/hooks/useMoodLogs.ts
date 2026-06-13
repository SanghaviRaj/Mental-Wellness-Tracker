import { useState, useCallback } from 'react'
import type { MoodLog, MoodScore, ExamType } from '../types'
import { moodStorage, generateId } from '../utils/storage'
import { validateMoodInput } from '../utils/sanitize'
 
export function useMoodLogs() {
  const [moods, setMoods] = useState<MoodLog[]>(() => moodStorage.getAll())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
 
  const addMood = useCallback((mood: MoodScore, stress: number, note: string, examType: ExamType) => {
    setError(null)
    if (!validateMoodInput(mood, stress)) {
      setError('Invalid mood or stress level selection.')
      return
    }
 
    try {
      setSaving(true)
      const log: MoodLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        mood,
        stressLevel: stress,
        examType,
        note: note || undefined,
      }
      moodStorage.save(log)
      setMoods(moodStorage.getAll())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving mood log.')
    } finally {
      setSaving(false)
    }
  }, [])
 
  const refreshMoods = useCallback(() => {
    setMoods(moodStorage.getAll())
  }, [])
 
  return { moods, saving, saved, error, addMood, refreshMoods }
}
