"use client"

import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacterById } from '@/lib/characters'
import { useTranslation } from '@/lib/useTranslation'

type Message = { id: string; role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const character = getCharacterById(characterId || '')
  const { t } = useTranslation()
  
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!character) return []
    return []
  })

  function getWelcomeMessage() {
    if (!character) return ''
    const description = t(`Characters.${character.id}.description`)
    return t('ChatPage.welcomeMessage', {
      name: character.name,
      avatar: character.avatar,
      description: description
    })
  }

  useEffect(() => {
    if (character && messages.length === 0) {
      setMessages([
        { 
          id: 'm0', 
          role: 'assistant', 
          content: getWelcomeMessage()
        }
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.id, t])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function resetChat() {
    if (!character) return
    setMessages([
      { 
        id: 'm0', 
        role: 'assistant', 
        content: getWelcomeMessage()
      }
    ])
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const user: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    setMessages((m) => [...m, user])
    setInput('')
    setIsLoading(true)

    if (!character) {
      setIsLoading(false)
      return
    }
    
    // Call minimal API stub (could be replaced with Groq streaming later)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          characterId, 
          systemPrompt: character.systemPrompt,
          history: [...messages, user] 
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      
      if (!data.reply || typeof data.reply !== 'string') {
        throw new Error('Invalid response format')
      }

      const bot: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.reply }
      setMessages((m) => [...m, bot])
    } catch (error) {
      console.error('Chat error:', error)
      const errMsg: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: error instanceof Error ? t('ChatPage.error', { message: error.message }) : t('ChatPage.somethingWentWrong') 
      }
      setMessages((m) => [...m, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  if (!character) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
        <p className="text-white/70">{t('ChatPage.characterNotFound')}</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{character.avatar}</span>
            <div>
              <h3 className="font-semibold">{character.name}</h3>
              <p className="text-xs text-white/60">{t(`Characters.${character.id}.description`)}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={resetChat}
            title={t('ChatPage.resetChatTooltip')}
            className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/20 transition-colors flex items-center gap-1.5"
          >
            <span>↻</span>
            <span className="hidden sm:inline">{t('ChatPage.resetChat')}</span>
          </motion.button>
        </div>
      </div>
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
            placeholder={t('ChatPage.typeMessage')}
            className="flex-1 rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground disabled:opacity-50"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? t('ChatPage.sending') : t('ChatPage.send')}
          </button>
        </div>
      </form>
    </div>
  )
}
