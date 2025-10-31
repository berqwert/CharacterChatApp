import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { characterId, history } = body ?? {}

  // Minimal stub. Replace with Groq API call using process.env.GROQ_API_KEY.
  const lastUser = Array.isArray(history)
    ? [...history].reverse().find((m) => m.role === 'user')?.content
    : undefined

  const reply = lastUser
    ? `(${characterId}) Düşündüm: ${lastUser.slice(0, 120)} — harika bir fikir!`
    : `(${characterId}) Merhaba!`

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
