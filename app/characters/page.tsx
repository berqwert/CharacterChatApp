"use client"

import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { motion } from 'framer-motion'
import { characters } from '@/lib/characters'
import { useTranslation } from '@/lib/useTranslation'

export default function CharactersPage() {
  const { t } = useTranslation()
  
  return (
    <div className="px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold">{t('CharactersPage.title')}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {characters.map((char, idx) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.2 }}
          >
            <Link
              href={`/chat/${char.id}`}
              className="block rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/20"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="text-3xl">{char.avatar}</span>
                <div>
                  <h3 className="font-semibold">{char.name}</h3>
                  <p className="text-xs text-white/60">{t(`Characters.${char.id}.description`)}</p>
                </div>
              </div>
              <p className="text-xs text-white/70 italic">"{t(`Characters.${char.id}.conversationStyle`)}"</p>
            </Link>
          </motion.div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}

