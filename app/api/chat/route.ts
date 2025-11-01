import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(req: NextRequest) {
  // Parse body once at the beginning
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { characterId, systemPrompt, history } = body ?? {}

    // Validation
    if (!characterId || !systemPrompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: characterId, systemPrompt' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const groqApiKey = process.env.GROQ_API_KEY

    // If no Groq API key, use stub mode
    if (!groqApiKey) {
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
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: groqApiKey,
    })

    // Format messages for Groq API
    // Convert history messages to Groq format, ensuring system prompt is included
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ]

    // Add conversation history (skip system messages from history)
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content || '',
          })
        }
      }
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.3-70b-versatile', // Fast and good model
      temperature: 0.7,
      max_tokens: 1024,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API route error:', error)
    
    // If Groq API fails, fallback to stub mode for graceful degradation
    const { history } = body ?? {}
    const lastUser = Array.isArray(history)
      ? [...history].reverse().find((m) => m.role === 'user')?.content
      : undefined

    const fallbackReply = lastUser
      ? `I'm thinking about ${lastUser.slice(0, 80)}... Interesting topic!`
      : `Hello! How can I help you?`

    return new Response(JSON.stringify({ reply: fallbackReply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
