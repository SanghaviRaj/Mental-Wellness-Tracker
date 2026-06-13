import type { ExamType, InsightResult, JournalEntry, MoodLog } from '../types'
import { STORAGE_KEYS, AI_CONFIG, RATE_LIMITS } from '../constants'
 
const getKey = (): string => {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  if (!key || !key.startsWith('sk-ant-')) {
    throw new Error('Invalid API key configuration.')
  }
  return key
}
 
function checkRateLimit(): void {
  const now = Date.now()
  const windowStart = now - RATE_LIMITS.AI_WINDOW_MS
  const raw = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT) ?? '[]'
  
  try {
    const calls: number[] = (JSON.parse(raw) as number[]).filter((t: number) => t > windowStart)
    if (calls.length >= RATE_LIMITS.AI_MAX_CALLS_PER_HOUR) {
      throw new Error(`You have reached the AI usage limit (${RATE_LIMITS.AI_MAX_CALLS_PER_HOUR}/hour). Please wait a bit.`)
    }
    localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify([...calls, now]))
  } catch (e) {
    if (e instanceof Error && e.message.includes('usage limit')) {
      throw e
    }
    // Reset rate limit storage if parsing fails
    localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify([now]))
  }
}
 
function buildSystemPrompt(examType: ExamType, studentName: string): string {
  return `You are Antigravity, a warm and empathetic mental wellness companion built specifically for ${studentName}, who is preparing for ${examType}.
 
Your role:
- Provide emotional support, coping strategies, and motivational encouragement
- Analyse stress triggers and emotional patterns from journals and mood data
- Suggest hyper-personalized mindfulness exercises relevant to exam pressure
- Never diagnose mental health conditions or replace professional help
- If a student expresses thoughts of self-harm or crisis, respond with care and ALWAYS recommend speaking to a trusted adult, counsellor, or calling iCall India: 9152987821
 
Tone: Warm, peer-like, never clinical. Use simple language. Acknowledge their specific exam (${examType}) challenges. Keep responses concise and actionable.`
}
 
export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  examType: ExamType,
  studentName: string,
  onChunk: (text: string) => void,
  onDone: () => void,
): Promise<void> {
  checkRateLimit()
 
  const res = await fetch(AI_CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getKey(),
      'anthropic-version': AI_CONFIG.ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: AI_CONFIG.MODEL_NAME,
      max_tokens: 1024,
      stream: true,
      system: buildSystemPrompt(examType, studentName),
      messages,
    }),
  })
 
  if (!res.ok) {
    throw new Error(`AI service error: ${res.status}`)
  }
 
  const body = res.body
  if (!body) {
    throw new Error('Response body is null.')
  }
 
  const reader = body.getReader()
  const decoder = new TextDecoder()
 
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      onDone()
      break
    }
    const decoded = decoder.decode(value)
    const lines = decoded.split('\n').filter((l: string) => l.startsWith('data: '))
    for (const line of lines) {
      try {
        const json = JSON.parse(line.slice(6)) as {
          type: string
          delta?: { text?: string }
        }
        if (json.type === 'content_block_delta') {
          onChunk(json.delta?.text ?? '')
        }
      } catch {
        /* skip malformed chunks */
      }
    }
  }
}
 
export async function analyzeJournals(
  journals: JournalEntry[],
  moods: MoodLog[],
  examType: ExamType,
  studentName: string,
): Promise<InsightResult> {
  checkRateLimit()
 
  const journalText = journals.map(
    (j: JournalEntry, i: number) => `Entry ${i + 1} (${j.timestamp.slice(0, 10)}): ${j.content}`
  ).join('\n\n')
 
  const moodSummary = moods.map(
    (m: MoodLog) => `${m.timestamp.slice(0, 10)}: mood=${m.mood}/5, stress=${m.stressLevel}/10`
  ).join('\n')
 
  const prompt = `Analyse these journal entries and mood logs for ${studentName} (preparing for ${examType}).
 
JOURNAL ENTRIES:
${journalText}
 
MOOD LOGS:
${moodSummary}
 
Respond ONLY with a valid JSON object in this exact shape:
{
  "summary": "2-sentence overall wellness summary",
  "triggers": ["trigger1", "trigger2", "trigger3"],
  "patterns": ["pattern1", "pattern2"],
  "burnoutRisk": "low" | "moderate" | "high",
  "copingStrategies": [
    {
      "title": "Strategy name",
      "description": "Clear, actionable description",
      "duration": "X minutes",
      "type": "breathing" | "mindfulness" | "study" | "motivation"
    }
  ]
}
Return 3 coping strategies. No extra text, no markdown fences.`
 
  const res = await fetch(AI_CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getKey(),
      'anthropic-version': AI_CONFIG.ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: AI_CONFIG.MODEL_NAME,
      max_tokens: 1024,
      system: buildSystemPrompt(examType, studentName),
      messages: [{ role: 'user', content: prompt }],
    }),
  })
 
  if (!res.ok) {
    throw new Error(`Analysis failed: ${res.status}`)
  }
  
  const data = await res.json() as {
    content?: { text?: string }[]
  }
  
  const raw = data.content?.[0]?.text
  if (!raw) {
    throw new Error('AI returned an empty response.')
  }
 
  try {
    return JSON.parse(raw) as InsightResult
  } catch {
    throw new Error('AI returned unexpected format. Please try again.')
  }
}
