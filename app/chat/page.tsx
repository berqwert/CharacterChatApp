"use client"

import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { characters } from '@/lib/characters'
import { motion } from 'framer-motion'

export default function ChatListPage() {
  return (
    <div className="px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold">Sohbetler</h2>
      <ul className="space-y-2">
        {characters.map((char, idx) => (
          <motion.li
            key={char.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/chat/${char.id}`}
              className="flex items-center gap-3 rounded-md border border-white/10 p-3 hover:bg-white/5 transition-colors"
            >
              <span className="text-2xl">{char.avatar}</span>
              <div>
                <div className="font-medium">{char.name}</div>
                <div className="text-xs text-white/60">{char.description}</div>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
      <BottomNav />
    </div>
  )
}
