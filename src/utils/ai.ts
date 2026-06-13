import type { ExamType, InsightResult, JournalEntry, MoodLog } from '../types'
 
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-6'
 
// SECURITY: Read-only from env, never hardcoded
const getKey = (): string => {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string
  if (!key || !key.startsWith('sk-ant-')) throw new Error('Invalid API key configuration.')
  return key
}
 
// Rate limiting — max 20 AI calls per hour via localStorage counter
function checkRateLimit(): void {
  const now = Date.now()
  const windowStart = now - 60 * 60 * 1000
  const raw = localStorage.getItem('ag_rate') ?? '[]'
  const calls: number[] = JSON.parse(raw).filter((t: number) => t > windowStart)
  if (calls.length >= 20) throw new Error('You have reached the AI usage limit (20/hour). Please wait a bit.')
  localStorage.setItem('ag_rate', JSON.stringify([...calls, now]))
}
 
// Shared system prompt — empathetic, safe, exam-context-aware
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
 
// ── Chat (streaming) ──────────────────────────────────────────────────────────
export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  examType: ExamType,
  studentName: string,
  onChunk: (text: string) => void,
  onDone: () => void,
): Promise<void> {
  checkRateLimit()
 
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      system: buildSystemPrompt(examType, studentName),
      messages,
    }),
  })
 
  if (!res.ok) throw new Error(`AI service error: ${res.status}`)
 
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
 
  while (true) {
    const { done, value } = await reader.read()
    if (done) { onDone(); break }
    const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))
    for (const line of lines) {
      try {
        const json = JSON.parse(line.slice(6))
        if (json.type === 'content_block_delta') onChunk(json.delta.text ?? '')
      } catch { /* skip malformed chunks */ }
    }
  }
}
 
// ── Journal Insight Analysis ──────────────────────────────────────────────────
export async function analyzeJournals(
  journals: JournalEntry[],
  moods: MoodLog[],
  examType: ExamType,
  studentName: string,
): Promise<InsightResult> {
  checkRateLimit()
 
  const journalText = journals.map(
    (j, i) => `Entry ${i + 1} (${j.timestamp.slice(0, 10)}): ${j.content}`
  ).join('\n\n')
 
  const moodSummary = moods.map(
    m => `${m.timestamp.slice(0, 10)}: mood=${m.mood}/5, stress=${m.stressLevel}/10`
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
 
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(examType, studentName),
      messages: [{ role: 'user', content: prompt }],
    }),
  })
 
  if (!res.ok) throw new Error(`Analysis failed: ${res.status}`)
  const data = await res.json()
  const raw = data.content[0].text as string
 
  try {
    return JSON.parse(raw) as InsightResult
  } catch {
    throw new Error('AI returned unexpected format. Please try again.')
  }
}
