"use client"

import { useLocale } from '@/lib/i18n-client'
import { motion } from 'framer-motion'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setLocale('en')}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          locale === 'en'
            ? 'bg-brand text-brand-foreground'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        EN
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setLocale('tr')}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          locale === 'tr'
            ? 'bg-brand text-brand-foreground'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        TR
      </motion.button>
    </div>
  )
}
