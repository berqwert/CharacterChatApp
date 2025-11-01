import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { characterId, systemPrompt, history } = body ?? {}

    // Validation
    if (!characterId || !systemPrompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: characterId, systemPrompt' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Minimal stub. Replace with Groq API call using process.env.GROQ_API_KEY.
    // systemPrompt will be used as system message when integrating Groq.
    // Note: GROQ_API_KEY is optional for now (stub mode). When implementing Groq, validate it exists.
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      // Stub mode - continue without Groq
    }
    const lastUser = Array.isArray(history)
      ? [...history].reverse().find((m) => m.role === 'user')?.content
      : undefined

    const reply = lastUser
      ? `I'm thinking about ${lastUser.slice(0, 80)}... Interesting topic!`
      : `Hello! How can I help you?`

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API route error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
