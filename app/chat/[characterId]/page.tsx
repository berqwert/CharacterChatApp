"use client"

import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Message = { id: string; role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm0', role: 'assistant', content: `Ben ${characterId}. Sohbete hazır mısın?` },
  ])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const user: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    setMessages((m) => [...m, user])
    setInput('')

    // Call minimal API stub (could be replaced with Groq streaming later)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, history: [...messages, user] }),
      })
      const data = await res.json()
      const bot: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.reply }
      setMessages((m) => [...m, bot])
    } catch {
      const errMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: 'Bir şeyler ters gitti. Tekrar dener misin?' }
      setMessages((m) => [...m, errMsg])
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={m.role === 'user' ? 'text-right' : 'text-left'}
            >
              <span
                className={
                  'inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm ' +
                  (m.role === 'user' ? 'bg-brand text-brand-foreground' : 'bg-white/10')
                }
              >
                {m.content}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={onSend} className="sticky bottom-16 z-10 w-full bg-black/60 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesaj yaz..."
            className="flex-1 rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground disabled:opacity-50"
            disabled={!input.trim()}
          >
            Gönder
          </button>
        </div>
      </form>
    </div>
  )
}
