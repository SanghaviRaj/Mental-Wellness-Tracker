import { CHARACTER_LIMITS } from '../constants'
 
// SECURITY: Strip HTML tags and prompt-injection patterns before any AI call
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')                                          // strip HTML tags
    .replace(/[<>'"]/g, '')                                           // strip dangerous chars
    .replace(/ignore (previous|above|all) instructions?/gi, '')       // prompt injection
    .replace(/you are now|pretend (you are|to be)/gi, '')
    .replace(/system prompt|ignore all|disregard (all|previous)/gi, '')
    .trim()
    .slice(0, CHARACTER_LIMITS.JOURNAL_MAX_LENGTH)                    // hard cap
}
 
export function validateJournalContent(text: string): string | null {
  const min = CHARACTER_LIMITS.JOURNAL_MIN_LENGTH
  const max = CHARACTER_LIMITS.JOURNAL_MAX_LENGTH
 
  if (text.trim().length < min) {
    return `Please write at least ${min} characters.`
  }
  if (text.trim().length > max) {
    return `Please keep your entry under ${max} characters.`
  }
  return null // null = valid
}
 
export function validateMoodInput(mood: number, stress: number): boolean {
  return (
    Number.isInteger(mood) && mood >= 1 && mood <= 5 &&
    Number.isInteger(stress) && stress >= 1 && stress <= 10
  )
}
