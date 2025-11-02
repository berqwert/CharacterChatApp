"use client"

import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseAuth } from '@/components/SupabaseProvider'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/useTranslation'

export default function HomePage() {
  const { user, signInWithGoogle } = useSupabaseAuth()
  const { t } = useTranslation()
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (user) {
      setShowNotification(true)
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [user])

  return (
    <div className={`flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start gap-8 px-4 pb-20 text-center ${user ? 'pt-24 sm:pt-16' : 'pt-20 sm:pt-12'}`}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="text-3xl font-semibold">{t('HomePage.title')}</h1>
        <p className="mt-2 text-white/70">{t('HomePage.subtitle')}</p>
        <AnimatePresence>
          {showNotification && user && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-3 text-xs text-green-400"
            >
              ✓ {t('HomePage.signedIn', { email: user.email || '' })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        {!user && (
          <button
            onClick={signInWithGoogle}
            className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white hover:opacity-80 mb-2 shadow"
          >
            {t('HomePage.signInWithGoogle')}
          </button>
        )}
        {user ? (
          <Link href="/chat" className="rounded-md bg-brand px-4 py-3 font-medium text-brand-foreground">
            <motion.span whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }} transition={{ duration: 0.08, ease: 'easeOut' }}>
              {t('HomePage.startChatting')}
            </motion.span>
          </Link>
        ) : (
          <div className="rounded-md bg-brand/50 px-4 py-3 font-medium text-brand-foreground opacity-50 cursor-not-allowed">
            {t('HomePage.startChatting')}
          </div>
        )}
        <p className="text-xs text-white/50">
          {user ? t('HomePage.signedInMessage') : t('HomePage.needSignIn')}
        </p>
      </motion.div>

      <BottomNav />
    </div>
  )
}
