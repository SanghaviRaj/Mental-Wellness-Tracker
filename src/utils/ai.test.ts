import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit } from './ai'
import { RATE_LIMITS, STORAGE_KEYS } from '../constants'

// --------------------------------------------------------------------------
// Fake localStorage so tests never touch the real browser storage
// --------------------------------------------------------------------------
const fakeLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

vi.stubGlobal('localStorage', fakeLocalStorage)

// --------------------------------------------------------------------------
// checkRateLimit — exported pure function; no HTTP involved
// --------------------------------------------------------------------------
describe('checkRateLimit', () => {
  beforeEach(() => {
    fakeLocalStorage.clear()
  })

  it('allows the first call with no prior history', () => {
    expect(() => checkRateLimit()).not.toThrow()
  })

  it(`allows up to ${RATE_LIMITS.AI_MAX_CALLS_PER_HOUR} calls per hour`, () => {
    for (let i = 0; i < RATE_LIMITS.AI_MAX_CALLS_PER_HOUR; i++) {
      expect(() => checkRateLimit()).not.toThrow()
    }
  })

  it('throws on the call that exceeds the hourly limit', () => {
    for (let i = 0; i < RATE_LIMITS.AI_MAX_CALLS_PER_HOUR; i++) {
      checkRateLimit()
    }
    expect(() => checkRateLimit()).toThrow(/usage limit/)
  })

  it('resets the window when all timestamps are older than 1 hour', () => {
    // Seed storage with 20 timestamps from 2 hours ago (outside the window)
    const twoHoursAgo = Date.now() - RATE_LIMITS.AI_WINDOW_MS - 1000
    const stale = Array.from({ length: RATE_LIMITS.AI_MAX_CALLS_PER_HOUR }, () => twoHoursAgo)
    fakeLocalStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(stale))

    // Should not throw because stale entries are filtered out
    expect(() => checkRateLimit()).not.toThrow()
  })

  it('resets gracefully if rate-limit storage is corrupted JSON', () => {
    fakeLocalStorage.setItem(STORAGE_KEYS.RATE_LIMIT, 'NOT_VALID_JSON')
    // Corrupted storage should not throw — it resets to [now]
    expect(() => checkRateLimit()).not.toThrow()
    // After reset, only 1 timestamp should be stored
    const stored = JSON.parse(fakeLocalStorage.getItem(STORAGE_KEYS.RATE_LIMIT) ?? '[]') as number[]
    expect(stored).toHaveLength(1)
  })
})

// --------------------------------------------------------------------------
// streamChat / analyzeJournals — mock fetch for HTTP-layer tests
// --------------------------------------------------------------------------
describe('streamChat HTTP errors', () => {
  beforeEach(() => {
    fakeLocalStorage.clear()
    // Provide a valid env key so getKey() does not throw
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'sk-ant-test-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('throws when the API responds with a non-200 status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))

    const { streamChat } = await import('./ai')
    await expect(
      streamChat(
        [{ role: 'user', content: 'hello' }],
        'JEE',
        'Ananya',
        () => {},
        () => {},
      )
    ).rejects.toThrow('429')
  })
})

describe('analyzeJournals HTTP and parse errors', () => {
  beforeEach(() => {
    fakeLocalStorage.clear()
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'sk-ant-test-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('throws when the API responds with a non-200 status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    const { analyzeJournals } = await import('./ai')
    await expect(
      analyzeJournals([], [], 'JEE', 'Ananya')
    ).rejects.toThrow('500')
  })

  it('throws when the AI returns malformed JSON in its text field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: 'NOT JSON' }] }),
    }))

    const { analyzeJournals } = await import('./ai')
    await expect(
      analyzeJournals([], [], 'JEE', 'Ananya')
    ).rejects.toThrow(/unexpected format/)
  })

  it('throws when the AI returns an empty content array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [] }),
    }))

    const { analyzeJournals } = await import('./ai')
    await expect(
      analyzeJournals([], [], 'JEE', 'Ananya')
    ).rejects.toThrow(/empty response/)
  })
})
