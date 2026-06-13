import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMoodLogs } from './useMoodLogs'

// --------------------------------------------------------------------------
// Fake localStorage
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

describe('useMoodLogs', () => {
  beforeEach(() => {
    fakeLocalStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('initialises with an empty moods array when storage is empty', () => {
    const { result } = renderHook(() => useMoodLogs())
    expect(result.current.moods).toHaveLength(0)
  })

  it('addMood() persists a valid mood log and updates the moods list', () => {
    const { result } = renderHook(() => useMoodLogs())

    act(() => {
      result.current.addMood(4, 5, 'Feeling focused', 'JEE')
    })

    expect(result.current.moods).toHaveLength(1)
    expect(result.current.moods[0].mood).toBe(4)
    expect(result.current.moods[0].stressLevel).toBe(5)
    expect(result.current.moods[0].note).toBe('Feeling focused')
    expect(result.current.moods[0].examType).toBe('JEE')
  })

  it('addMood() sets an error for an invalid mood value (out of 1–5 range)', () => {
    const { result } = renderHook(() => useMoodLogs())

    act(() => {
      result.current.addMood(6 as never, 5, '', 'JEE')
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.moods).toHaveLength(0)
  })

  it('addMood() sets an error for an invalid stress value (out of 1–10 range)', () => {
    const { result } = renderHook(() => useMoodLogs())

    act(() => {
      result.current.addMood(3, 11, '', 'NEET')
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.moods).toHaveLength(0)
  })

  it('saved flag becomes true after a successful addMood, then resets after 2.5 s', () => {
    const { result } = renderHook(() => useMoodLogs())

    act(() => {
      result.current.addMood(3, 5, '', 'CAT')
    })

    expect(result.current.saved).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(result.current.saved).toBe(false)
  })

  it('addMood() stores a log without an optional note when note is empty', () => {
    const { result } = renderHook(() => useMoodLogs())

    act(() => {
      result.current.addMood(2, 7, '', 'GATE')
    })

    expect(result.current.moods[0].note).toBeUndefined()
  })

  it('refreshMoods() re-reads from storage and updates the list', () => {
    const { result } = renderHook(() => useMoodLogs())

    // Directly write to storage without going through the hook
    act(() => {
      result.current.addMood(5, 2, 'Great day', 'UPSC')
    })

    // A fresh hook instance should see the data after refresh
    const { result: result2 } = renderHook(() => useMoodLogs())
    expect(result2.current.moods).toHaveLength(1)

    act(() => {
      result2.current.refreshMoods()
    })

    expect(result2.current.moods).toHaveLength(1)
    expect(result2.current.moods[0].mood).toBe(5)
  })
})
