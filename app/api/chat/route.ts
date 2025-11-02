import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'
import type { ChatRequest, ChatResponse, ChatErrorResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  let body: ChatRequest | null = null
  try {
    body = await req.json() as ChatRequest
  } catch {
    const errorResponse: ChatErrorResponse = { error: 'Invalid request body' }
    return new Response(
      JSON.stringify(errorResponse),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    if (!body) {
      const errorResponse: ChatErrorResponse = { error: 'Request body is required' }
      return new Response(
        JSON.stringify(errorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { characterId, systemPrompt, history } = body

    if (!characterId || !systemPrompt) {
      const errorResponse: ChatErrorResponse = { error: 'Missing required fields: characterId, systemPrompt' }
      return new Response(
        JSON.stringify(errorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const MAX_MESSAGE_LENGTH = 2000
    if (Array.isArray(history)) {
      const lastUserMessage = [...history].reverse().find((m) => m.role === 'user')
      if (lastUserMessage?.content) {
        const messageContent = String(lastUserMessage.content).trim()
        if (messageContent.length === 0) {
          const errorResponse: ChatErrorResponse = { error: 'Message cannot be empty' }
          return new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        if (messageContent.length > MAX_MESSAGE_LENGTH) {
          const errorResponse: ChatErrorResponse = { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` }
          return new Response(
            JSON.stringify(errorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    const groqApiKey = process.env.GROQ_API_KEY

    if (!groqApiKey) {
      console.warn('GROQ_API_KEY not found, using stub mode')
      const lastUser = Array.isArray(history)
        ? [...history].reverse().find((m) => m.role === 'user')?.content
        : undefined

      const reply = lastUser
        ? `I'm thinking about ${lastUser.slice(0, 80)}... Interesting topic!`
        : `Hello! How can I help you?`

      const response: ChatResponse = { reply }
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    })

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ]

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

    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    
    if (!reply || reply === 'Sorry, I could not generate a response.') {
      console.warn('Groq API returned empty or invalid response')
    }

    const response: ChatResponse = { reply }
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('API route error:', error)
    
    const errorMessage = error?.error?.error?.message || error?.message || String(error)
    const errorCode = error?.error?.error?.code || error?.code
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    if (errorCode === 'invalid_api_key' || errorMessage?.includes('Invalid API Key') || errorMessage?.includes('invalid_api_key')) {
      const errorResponse: ChatErrorResponse = {
        error: 'Invalid API key. Please check your GROQ_API_KEY in .env.local',
        reply: '🔑 API Key hatası: Lütfen .env.local dosyasındaki GROQ_API_KEY değerini kontrol edin. Groq Console\'dan yeni bir API key almanız gerekebilir: https://console.groq.com/keys'
      }
      return new Response(
        JSON.stringify(errorResponse),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    if (errorMessage?.includes('API') || errorMessage?.includes('authentication') || errorMessage?.includes('401')) {
      const errorResponse: ChatErrorResponse = {
        error: errorMessage || 'Groq API error',
        reply: `❌ API Hatası: ${errorMessage || 'Bilinmeyen bir hata oluştu. Lütfen API key\'inizi kontrol edin.'}`
      }
      return new Response(
        JSON.stringify(errorResponse),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    console.warn('Groq API failed, using fallback response')
    const lastUser = body && Array.isArray(body.history)
      ? [...body.history].reverse().find((m) => m.role === 'user')?.content
      : undefined

    const fallbackReply = lastUser
      ? `⚠️ API bağlantı hatası: "${lastUser.slice(0, 50)}..." konusu hakkında düşünüyorum. Lütfen API key\'inizi kontrol edin.`
      : `⚠️ API bağlantı hatası. Lütfen server loglarını kontrol edin.`

    const response: ChatResponse = { reply: fallbackReply }
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
