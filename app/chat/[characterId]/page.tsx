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
  const [inputError, setInputError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  
  const MAX_MESSAGE_LENGTH = 2000

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

  function validateInput(text: string): string | null {
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      return t('ChatPage.messageTooShort')
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      return t('ChatPage.messageTooLong', { max: MAX_MESSAGE_LENGTH })
    }
    return null
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    
    const validationError = validateInput(input)
    if (validationError) {
      setInputError(validationError)
      setTimeout(() => setInputError(null), 3000)
      return
    }
    
    if (isLoading) return

    const user: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    setInputError(null)
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

  useEffect(() => {
    if (!character) {
      router.replace('/characters')
    }
  }, [character, router])

  if (!character) {
    return null
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
          <div className="flex-1 flex flex-col">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setInputError(null) // Clear error when user types
              }}
              placeholder={t('ChatPage.typeMessage')}
              maxLength={MAX_MESSAGE_LENGTH}
              className={`rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors ${
                inputError 
                  ? 'border-red-500/50 focus:border-red-500' 
                  : 'border-white/10 focus:border-brand'
              }`}
            />
            <div className="flex items-center justify-between mt-1 px-1">
              {inputError && (
                <span className="text-xs text-red-400">{inputError}</span>
              )}
              <span className={`text-xs ml-auto ${
                input.length > MAX_MESSAGE_LENGTH * 0.9 
                  ? 'text-yellow-400' 
                  : input.length > MAX_MESSAGE_LENGTH * 0.95
                  ? 'text-red-400'
                  : 'text-white/40'
              }`}>
                {input.length > 0 && (
                  t('ChatPage.charactersRemaining', { remaining: Math.max(0, MAX_MESSAGE_LENGTH - input.length) })
                )}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground disabled:opacity-50"
            disabled={!input.trim() || isLoading || input.trim().length > MAX_MESSAGE_LENGTH}
          >
            {isLoading ? t('ChatPage.sending') : t('ChatPage.send')}
          </button>
        </div>
      </form>
      <BottomNav />
    </div>
  )
}
