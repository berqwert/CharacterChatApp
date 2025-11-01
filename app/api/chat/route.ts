import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { characterId, systemPrompt, history } = body ?? {}

  // Minimal stub. Replace with Groq API call using process.env.GROQ_API_KEY.
  // systemPrompt will be used as system message when integrating Groq.
  const lastUser = Array.isArray(history)
    ? [...history].reverse().find((m) => m.role === 'user')?.content
    : undefined

  const reply = lastUser
    ? `${lastUser.slice(0, 80)} hakkında düşünüyorum... İlginç bir konu!`
    : `Merhaba! Nasıl yardımcı olabilirim?`

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
