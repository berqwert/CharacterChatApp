"use client"

import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4 text-center">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="text-3xl font-semibold">Character Chat App</h1>
        <p className="mt-2 text-white/70">Basit başlangıç sürümü</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <Link href="/chat" className="rounded-md bg-brand px-4 py-3 font-medium text-brand-foreground">
          <motion.span whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }} transition={{ duration: 0.08, ease: 'easeOut' }}>
            Sohbete Başla
          </motion.span>
        </Link>
        <p className="text-xs text-white/50">
          Not: Google ile giriş sonraki adımda eklenecek. Şimdilik misafir devam girişiyle devam edebilirsiniz.
        </p>
      </motion.div>

      <BottomNav />
    </div>
  )
}


