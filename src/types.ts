export type ExamType = 'NEET' | 'JEE' | 'CUET' | 'CAT' | 'GATE' | 'UPSC' | 'Other'
export type MoodScore = 1 | 2 | 3 | 4 | 5

export interface UserProfile {
  name: string
  examType: ExamType
  examDate?: string       // ISO date string
  createdAt: string
}

export interface MoodLog {
  id: string
  timestamp: string
  mood: MoodScore         // 1 = very low, 5 = great
  stressLevel: number     // 1–10
  examType: ExamType
  note?: string
}

export interface JournalEntry {
  id: string
  timestamp: string
  content: string         // validated: 50–1000 chars
  examType: ExamType
  aiInsight?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface InsightResult {
  summary: string
  triggers: string[]
  patterns: string[]
  burnoutRisk: 'low' | 'moderate' | 'high'
  copingStrategies: CopingStrategy[]
}

export interface CopingStrategy {
  title: string
  description: string
  duration: string
  type: 'breathing' | 'mindfulness' | 'study' | 'motivation'
}

export type Page = 'onboarding' | 'dashboard' | 'journal' | 'mood' | 'chat' | 'insights'
