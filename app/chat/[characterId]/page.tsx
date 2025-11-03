"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacterById } from '@/lib/characters'
import { useTranslation } from '@/lib/useTranslation'
import { BottomNav } from '@/components/BottomNav'
import type { Message, ChatRequest, ChatResponse, ChatErrorResponse } from '@/lib/types'

export default function ChatPage() {
  const params = useParams<{ characterId: string }>()
  const characterId = typeof params.characterId === 'string' ? params.characterId : ''
  const character = getCharacterById(characterId)
  const { t } = useTranslation()
  const router = useRouter()
  const [bottomNavHeight, setBottomNavHeight] = useState(64)
  
  const storageKey = character ? `chat-${character.id}` : null

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
    if (!storageKey || messages.length === 0) return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error)
    }
  }, [messages, storageKey])

  useEffect(() => {
    if (!character) return
    
    const welcomeMsg = getWelcomeMessage()
    
    if (messages.length === 0) {
      setMessages([
        { 
          id: 'm0', 
          role: 'assistant', 
          content: welcomeMsg
        }
      ])
    } else if (messages[0]?.id === 'm0' && messages[0]?.role === 'assistant') {
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
  const lastSendTime = useRef<number>(0)
  
  const MAX_MESSAGE_LENGTH = 2000
  const MIN_TIME_BETWEEN_MESSAGES = 2000

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function resetChat() {
    if (!character || !storageKey) return
    
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
    
    setMessages([
      { 
        id: 'm0', 
        role: 'assistant', 
        content: getWelcomeMessage()
      }
    ])
  }

  async function handleRetry(errorMessageId: string) {
    const errorIndex = messages.findIndex(m => m.id === errorMessageId)
    if (errorIndex === -1 || !messages[errorIndex].retryable) return

    const messagesBeforeError = messages.slice(0, errorIndex)
    const lastUserMessage = messagesBeforeError.reverse().find(m => m.role === 'user')
    if (!lastUserMessage || !character) return

    setMessages(messagesBeforeError)
    setIsLoading(true)

    try {
      const requestBody: ChatRequest = {
        characterId,
        systemPrompt: character.systemPrompt,
        history: messagesBeforeError
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})) as ChatErrorResponse
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      const data = await res.json() as ChatResponse
      
      if (!data.reply || typeof data.reply !== 'string') {
        throw new Error('Invalid response format')
      }

      const bot: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.reply }
      setMessages((m) => [...m, bot])
    } catch (error) {
      console.error('Retry error:', error)
      const errMsg: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: error instanceof Error ? t('ChatPage.error', { message: error.message }) : t('ChatPage.somethingWentWrong'),
        error: true,
        retryable: true
      }
      setMessages((m) => [...m, errMsg])
    } finally {
      setIsLoading(false)
    }
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

    const timeSinceLastMessage = Date.now() - lastSendTime.current
    if (timeSinceLastMessage < MIN_TIME_BETWEEN_MESSAGES) {
      const waitSeconds = Math.ceil((MIN_TIME_BETWEEN_MESSAGES - timeSinceLastMessage) / 1000)
      setInputError(t('ChatPage.pleaseWait', { seconds: waitSeconds }))
      setTimeout(() => setInputError(null), 3000)
      return
    }

    lastSendTime.current = Date.now()
    const user: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    setInputError(null)
    setMessages((m) => [...m, user])
    setInput('')
    setIsLoading(true)

    if (!character) {
      setIsLoading(false)
      return
    }
    
    try {
      const requestBody: ChatRequest = {
        characterId,
        systemPrompt: character.systemPrompt,
        history: [...messages, user]
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})) as ChatErrorResponse
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      const data = await res.json() as ChatResponse
      
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
        content: error instanceof Error ? t('ChatPage.error', { message: error.message }) : t('ChatPage.somethingWentWrong'),
        error: true,
        retryable: true
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

  useEffect(() => {
    const updateBottomNavHeight = () => {
      const nav = document.querySelector('nav.fixed')
      if (nav) {
        const height = nav.getBoundingClientRect().height
        setBottomNavHeight(height)
      }
    }
    
    updateBottomNavHeight()
    window.addEventListener('resize', updateBottomNavHeight)
    // Re-check after a short delay to ensure nav is rendered
    const timeout = setTimeout(updateBottomNavHeight, 100)
    
    return () => {
      window.removeEventListener('resize', updateBottomNavHeight)
      clearTimeout(timeout)
    }
  }, [])

  if (!character) {
    return null
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[100dvh] flex-col w-full overflow-x-hidden">
      <div className="border-b border-white/10 bg-black/40 px-4 py-3 pt-16 sm:pt-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-2xl flex-shrink-0">{character.avatar}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{character.name}</h3>
            <p className="text-xs text-white/60 hidden sm:block truncate">{t(`Characters.${character.id}.description`)}</p>
          </div>
        </div>
      </div>
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4 pb-32">
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
              <div className="inline-flex items-end gap-2 max-w-[80%]">
                <span
                  className={
                    'inline-block rounded-lg px-3 py-2 text-sm ' +
                    (m.role === 'user' 
                      ? 'bg-brand text-brand-foreground' 
                      : m.error 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-white/10')
                  }
                >
                  {m.content}
                </span>
                {m.retryable && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRetry(m.id)}
                    className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-colors flex-shrink-0"
                    title={t('ChatPage.retry')}
                  >
                    <span className="text-sm">↻</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-left"
            >
              <span className="inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm bg-white/10">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '300ms' }}></span>
                </span>
                <span className="ml-2 text-white/60 text-xs">{t('ChatPage.typing')}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={onSend} className="fixed left-0 right-0 z-10 w-full bg-black/60 backdrop-blur" style={{ bottom: `${bottomNavHeight}px` }}>
        <div className="mx-auto flex w-full max-w-2xl items-start gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={resetChat}
            className="rounded-md bg-white/10 px-1 sm:px-2.5 py-1.5 sm:py-2 text-white/70 hover:bg-white/20 hover:text-white transition-all flex-shrink-0 flex items-center gap-0.5 sm:gap-1.5 self-start mt-0"
          >
            <span className="text-sm sm:text-base leading-none">↻</span>
            <span className="text-[10px] sm:text-xs font-medium leading-tight hidden sm:inline">{t('ChatPage.resetChat')}</span>
          </motion.button>
          <div className="flex-1 flex flex-col min-w-0">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setInputError(null) // Clear error when user types
              }}
              placeholder={t('ChatPage.typeMessage')}
              maxLength={MAX_MESSAGE_LENGTH}
              className={`rounded-md border bg-transparent px-2 sm:px-3 py-2 text-xs sm:text-sm outline-none transition-colors w-full min-w-0 ${
                inputError 
                  ? 'border-red-500/50 focus:border-red-500' 
                  : 'border-white/10 focus:border-brand'
              }`}
            />
            <div className="flex items-center justify-between mt-1 px-1 min-h-[16px]">
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
            className="rounded-md bg-brand px-2 sm:px-4 py-2 text-[11px] sm:text-sm font-medium text-brand-foreground disabled:opacity-50 self-start mt-0 flex-shrink-0 whitespace-nowrap"
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
