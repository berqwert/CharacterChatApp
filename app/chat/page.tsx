"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { characters, type Character } from '@/lib/characters'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/useTranslation'

type ChatHistory = {
  character: Character
  lastMessage?: string
  messageCount: number
}

export default function ChatListPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load chat history from localStorage
    const history: ChatHistory[] = []
    
    for (const char of characters) {
      const storageKey = `chat-${char.id}`
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const messages = JSON.parse(stored)
          if (Array.isArray(messages) && messages.length > 1) {
            // More than just welcome message
            const lastMsg = messages[messages.length - 1]
            history.push({
              character: char,
              lastMessage: lastMsg?.content?.slice(0, 60),
              messageCount: messages.length
            })
          }
        }
      } catch (error) {
        console.error(`Failed to load chat for ${char.id}:`, error)
      }
    }
    
    setChatHistory(history)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h2 className="mb-4 text-xl font-semibold">{t('ChatListPage.title')}</h2>
        <div className="text-white/60 text-sm">{t('ChatListPage.loading')}</div>
        <BottomNav />
      </div>
    )
  }

  if (chatHistory.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-6xl mb-4"
          >
            💬
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">{t('ChatListPage.noChatsTitle')}</h3>
          <p className="text-white/60 text-sm mb-6">{t('ChatListPage.noChatsDescription')}</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/characters')}
            className="rounded-md bg-brand px-6 py-3 font-medium text-brand-foreground"
          >
            {t('ChatListPage.browseCharacters')}
          </motion.button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold">{t('ChatListPage.title')}</h2>
      <ul className="space-y-2">
        {chatHistory.map((item, idx) => (
          <motion.li
            key={item.character.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/chat/${item.character.id}`}
              className="flex items-center gap-3 rounded-md border border-white/10 p-3 hover:bg-white/5 transition-colors"
            >
              <span className="text-2xl">{item.character.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.character.name}</div>
                {item.lastMessage && (
                  <div className="text-xs text-white/60 truncate mt-0.5">
                    {item.lastMessage}...
                  </div>
                )}
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
      <BottomNav />
    </div>
  )
}
