import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateId, moodStorage, journalStorage, chatStorage } from './storage'
import type { MoodLog, JournalEntry, ChatMessage } from '../types'

// Mock localStorage
const fakeLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

vi.stubGlobal('localStorage', fakeLocalStorage)

describe('storage utility tests', () => {
  beforeEach(() => {
    fakeLocalStorage.clear()
  })

  describe('generateId', () => {
    it('returns a non-empty string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('returns unique values on consecutive calls', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('moodStorage', () => {
    it('persists a log and getAll() returns it', () => {
      const log: MoodLog = {
        id: '1',
        timestamp: new Date().toISOString(),
        mood: 4,
        stressLevel: 3,
        examType: 'JEE',
        note: 'Feeling good'
      }
      moodStorage.save(log)
      const all = moodStorage.getAll()
      expect(all).toHaveLength(1)
      expect(all[0]).toEqual(log)
    })
  })

  describe('journalStorage', () => {
    it('persists an entry and getAll() returns it', () => {
      const entry: JournalEntry = {
        id: 'journal-1',
        timestamp: new Date().toISOString(),
        content: 'Studied for 8 hours straight today.',
        examType: 'JEE'
      }
      journalStorage.save(entry)
      const all = journalStorage.getAll()
      expect(all).toHaveLength(1)
      expect(all[0]).toEqual(entry)
    })

    it('updateInsight() updates only the matching entry', () => {
      const entry1: JournalEntry = {
        id: 'journal-1',
        timestamp: new Date().toISOString(),
        content: 'Journal number one',
        examType: 'JEE'
      }
      const entry2: JournalEntry = {
        id: 'journal-2',
        timestamp: new Date().toISOString(),
        content: 'Journal number two',
        examType: 'JEE'
      }
      journalStorage.save(entry1)
      journalStorage.save(entry2)

      journalStorage.updateInsight('journal-1', 'You did well.')

      const all = journalStorage.getAll()
      expect(all).toHaveLength(2)

      const updated1 = all.find(e => e.id === 'journal-1')
      const updated2 = all.find(e => e.id === 'journal-2')

      expect(updated1?.aiInsight).toBe('You did well.')
      expect(updated2?.aiInsight).toBeUndefined()
    })
  })

  describe('chatStorage', () => {
    it('trims history to 50 messages', () => {
      const messages: ChatMessage[] = Array.from({ length: 60 }).map((_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message content ${i}`,
        timestamp: new Date().toISOString()
      }))

      chatStorage.save(messages)

      const all = chatStorage.getAll()
      expect(all).toHaveLength(50)
      // Check that it's the last 50 messages (index 10 to 59)
      expect(all[0].id).toBe('msg-10')
      expect(all[49].id).toBe('msg-59')
    })
  })
})
