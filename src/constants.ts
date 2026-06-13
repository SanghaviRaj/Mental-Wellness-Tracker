export const STORAGE_KEYS = {
  PROFILE: 'ag_profile',
  MOODS: 'ag_moods',
  JOURNALS: 'ag_journals',
  CHAT: 'ag_chat',
  INSIGHT: 'ag_latest_insight',
  DRAFT: 'ag_journal_draft',
  RATE_LIMIT: 'ag_rate',
  API_KEY: 'ag_api_key',
} as const
 
export const CHARACTER_LIMITS = {
  JOURNAL_MIN_LENGTH: 50,
  JOURNAL_MAX_LENGTH: 1000,
  MOOD_NOTE_MAX_LENGTH: 100,
} as const
 
export const RATE_LIMITS = {
  AI_MAX_CALLS_PER_HOUR: 20,
  AI_WINDOW_MS: 60 * 60 * 1000, // 1 hour in ms
} as const
 
export const AI_CONFIG = {
  API_URL: 'https://api.anthropic.com/v1/messages',
  MODEL_NAME: 'claude-sonnet-4-6',
  ANTHROPIC_VERSION: '2023-06-01',
} as const
 
export const TIMERS = {
  DRAFT_AUTOSAVE_INTERVAL_MS: 30000, // 30 seconds
} as const
 
export const BOX_BREATHING = {
  CYCLE_SECONDS: 4,
  MAX_CYCLES: 4,
} as const
