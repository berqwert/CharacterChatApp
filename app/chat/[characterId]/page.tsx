"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacterById } from '@/lib/characters'
import { useTranslation } from '@/lib/useTranslation'
import { BottomNav } from '@/components/BottomNav'

type Message = { id: string; role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const character = getCharacterById(characterId || '')
  const { t } = useTranslation()
  const router = useRouter()
  
  const storageKey = character ? `chat-${character.id}` : null

  // Load messages from localStorage on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!character || !storageKey) return []
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as Message[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error)
    }
    
    // No stored messages, return welcome message
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

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!storageKey || messages.length === 0) return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error)
    }
  }, [messages, storageKey])

  // Initialize with welcome message if no messages exist
  // Also update welcome message if language changes (first message is welcome message)
  useEffect(() => {
    if (!character) return
    
    const welcomeMsg = getWelcomeMessage()
    
    if (messages.length === 0) {
      // No messages, add welcome message
      setMessages([
        { 
          id: 'm0', 
          role: 'assistant', 
          content: welcomeMsg
        }
      ])
    } else if (messages[0]?.id === 'm0' && messages[0]?.role === 'assistant') {
      // Update welcome message if language changed
      if (messages[0].content !== welcomeMsg) {
        setMessages(prev => [
          { ...prev[0], content: welcomeMsg },
          ...prev.slice(1)
        ])
      }
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
    if (!character || !storageKey) return
    
    // Clear localStorage
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
    
    // Reset to welcome message
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{character.avatar}</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{character.name}</h3>
              <p className="text-xs text-white/60 hidden sm:block truncate">{t(`Characters.${character.id}.description`)}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/')}
            className="rounded-md bg-white/10 px-2.5 py-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors flex items-center justify-center flex-shrink-0 min-w-[36px]"
            title={t('Navigation.backToHome')}
          >
            <span className="text-base">🏠</span>
            <span className="hidden sm:inline text-xs font-medium ml-1.5">{t('Navigation.goHome')}</span>
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
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={resetChat}
            className="rounded-md bg-white/10 px-2.5 py-2 text-white/70 hover:bg-white/20 hover:text-white transition-all flex-shrink-0 flex items-center gap-1.5"
          >
            <span className="text-base leading-none">↻</span>
            <span className="text-xs font-medium leading-tight">{t('ChatPage.resetChat')}</span>
          </motion.button>
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
      <BottomNav />
    </div>
  )
}
