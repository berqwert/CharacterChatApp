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
      console.warn('GROQ_API_KEY not found, using stub mode')
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
    console.log('Calling Groq API with model: llama-3.3-70b-versatile')
    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.3-70b-versatile', // Fast and good model
      temperature: 0.7,
      max_tokens: 1024,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    
    if (!reply || reply === 'Sorry, I could not generate a response.') {
      console.warn('Groq API returned empty or invalid response')
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('API route error:', error)
    
    // Check if it's a Groq API error with invalid API key
    const errorMessage = error?.error?.error?.message || error?.message || String(error)
    const errorCode = error?.error?.error?.code || error?.code
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // If it's an invalid API key error from Groq
    if (errorCode === 'invalid_api_key' || errorMessage?.includes('Invalid API Key') || errorMessage?.includes('invalid_api_key')) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API key. Please check your GROQ_API_KEY in .env.local',
          reply: '🔑 API Key hatası: Lütfen .env.local dosyasındaki GROQ_API_KEY değerini kontrol edin. Groq Console\'dan yeni bir API key almanız gerekebilir: https://console.groq.com/keys'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // If it's any other Groq API error
    if (errorMessage?.includes('API') || errorMessage?.includes('authentication') || errorMessage?.includes('401')) {
      return new Response(
        JSON.stringify({ 
          error: errorMessage || 'Groq API error',
          reply: `❌ API Hatası: ${errorMessage || 'Bilinmeyen bir hata oluştu. Lütfen API key\'inizi kontrol edin.'}`
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // If Groq API fails for other reasons, fallback to stub mode
    console.warn('Groq API failed, using fallback response')
    const { history } = body ?? {}
    const lastUser = Array.isArray(history)
      ? [...history].reverse().find((m) => m.role === 'user')?.content
      : undefined

    const fallbackReply = lastUser
      ? `⚠️ API bağlantı hatası: "${lastUser.slice(0, 50)}..." konusu hakkında düşünüyorum. Lütfen API key\'inizi kontrol edin.`
      : `⚠️ API bağlantı hatası. Lütfen server loglarını kontrol edin.`

    return new Response(JSON.stringify({ reply: fallbackReply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
