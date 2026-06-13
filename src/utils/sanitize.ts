// SECURITY: Strip HTML tags and prompt-injection patterns before any AI call
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')                                          // strip HTML tags
    .replace(/[<>'"]/g, '')                                           // strip dangerous chars
    .replace(/ignore (previous|above|all) instructions?/gi, '')       // prompt injection
    .replace(/you are now|pretend (you are|to be)/gi, '')
    .replace(/system prompt|ignore all|disregard (all|previous)/gi, '')
    .trim()
    .slice(0, 1000)                                                   // hard cap
}

export function validateJournalContent(text: string): string | null {
  if (text.trim().length < 50)   return 'Please write at least 50 characters.'
  if (text.trim().length > 1000) return 'Please keep your entry under 1000 characters.'
  return null // null = valid
}

export function validateMoodInput(mood: number, stress: number): boolean {
  return (
    Number.isInteger(mood) && mood >= 1 && mood <= 5 &&
    Number.isInteger(stress) && stress >= 1 && stress <= 10
  )
}
