// Thin typed localStorage wrapper — no DB needed
import type { MoodLog, JournalEntry, ChatMessage, UserProfile, InsightResult } from '../types'

const KEYS = {
  PROFILE:  'ag_profile',
  MOODS:    'ag_moods',
  JOURNALS: 'ag_journals',
  CHAT:     'ag_chat',
  INSIGHT:  'ag_latest_insight',
} as const

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') }
  catch { return [] }
}
function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export const profileStorage = {
  get: (): UserProfile | null => {
    try { return JSON.parse(localStorage.getItem(KEYS.PROFILE) ?? 'null') }
    catch { return null }
  },
  set: (p: UserProfile) => localStorage.setItem(KEYS.PROFILE, JSON.stringify(p)),
}

export const moodStorage = {
  getAll(): MoodLog[] { return read<MoodLog>(KEYS.MOODS) },
  getLast7Days(): MoodLog[] {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return this.getAll().filter(m => new Date(m.timestamp) >= cutoff)
  },
  save(log: MoodLog) { write(KEYS.MOODS, [...this.getAll(), log]) },
}

export const journalStorage = {
  getAll(): JournalEntry[] { return read<JournalEntry>(KEYS.JOURNALS) },
  getLast7(): JournalEntry[] { return this.getAll().slice(-7) },
  save(e: JournalEntry) { write(KEYS.JOURNALS, [...this.getAll(), e]) },
  updateInsight(id: string, insight: string) {
    write(KEYS.JOURNALS, this.getAll().map(
      e => e.id === id ? { ...e, aiInsight: insight } : e
    ))
  },
}

export const chatStorage = {
  getAll(): ChatMessage[] { return read<ChatMessage>(KEYS.CHAT) },
  save(msgs: ChatMessage[]) { write(KEYS.CHAT, msgs.slice(-50)) }, // max 50 msgs
  clear() { localStorage.removeItem(KEYS.CHAT) },
}

export const insightStorage = {
  get: (): InsightResult | null => {
    try {
      const raw = localStorage.getItem(KEYS.INSIGHT)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },
  save: (i: InsightResult) => {
    localStorage.setItem(KEYS.INSIGHT, JSON.stringify(i))
  },
  clear: () => localStorage.removeItem(KEYS.INSIGHT)
}

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
