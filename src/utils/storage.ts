// Thin typed localStorage wrapper — no DB needed
import type { MoodLog, JournalEntry, ChatMessage, UserProfile, InsightResult } from '../types'
import { STORAGE_KEYS, STORAGE_LIMITS } from '../constants'
 
 
function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
 
function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}
 
export const profileStorage = {
  get: (): UserProfile | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  set: (p: UserProfile): void => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(p))
  },
}
 
export const moodStorage = {
  getAll(): MoodLog[] {
    return read<MoodLog>(STORAGE_KEYS.MOODS)
  },
  getLast7Days(): MoodLog[] {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return this.getAll().filter((m: MoodLog) => new Date(m.timestamp) >= cutoff)
  },
  save(log: MoodLog): void {
    write(STORAGE_KEYS.MOODS, [...this.getAll(), log])
  },
}
 
export const journalStorage = {
  getAll(): JournalEntry[] {
    return read<JournalEntry>(STORAGE_KEYS.JOURNALS)
  },
  getLast7(): JournalEntry[] {
    return this.getAll().slice(-7)
  },
  save(e: JournalEntry): void {
    write(STORAGE_KEYS.JOURNALS, [...this.getAll(), e])
  },
  updateInsight(id: string, insight: string): void {
    write(STORAGE_KEYS.JOURNALS, this.getAll().map((e: JournalEntry) => 
      e.id === id ? { ...e, aiInsight: insight } : e
    ))
  },
}
 
export const chatStorage = {
  getAll(): ChatMessage[] {
    return read<ChatMessage>(STORAGE_KEYS.CHAT)
  },
  save(msgs: ChatMessage[]): void {
    write(STORAGE_KEYS.CHAT, msgs.slice(-STORAGE_LIMITS.CHAT_MAX_MESSAGES))
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT)
  },
}
 
export const insightStorage = {
  get: (): InsightResult | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INSIGHT)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  save: (i: InsightResult): void => {
    localStorage.setItem(STORAGE_KEYS.INSIGHT, JSON.stringify(i))
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.INSIGHT)
  },
}
 
export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
