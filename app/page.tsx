"use client"

import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { motion } from 'framer-motion'
import { useSupabaseAuth } from '@/components/SupabaseProvider'

export default function HomePage() {
  const { user, signInWithGoogle, signOut } = useSupabaseAuth()

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
        {user ? (
          <div className="flex flex-col items-center gap-2 mb-2">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-12 h-12 rounded-full mx-auto border border-white/10 shadow"
              />
            )}
            <span className="text-white/90 text-base font-medium">{user.user_metadata?.name ?? user.email}</span>
          </div>
        ) : null}
        {user ? (
          <button
            onClick={signOut}
            className="rounded-md bg-white/15 px-4 py-2 text-sm font-medium text-white hover:opacity-80 mb-2"
          >
            Çıkış Yap
          </button>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white hover:opacity-80 mb-2 shadow"
          >
            Google ile Giriş Yap
          </button>
        )}
        <Link href="/chat" className="rounded-md bg-brand px-4 py-3 font-medium text-brand-foreground">
          <motion.span whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }} transition={{ duration: 0.08, ease: 'easeOut' }}
            style={!user ? { opacity: 0.5, pointerEvents: 'none' } : {}} 
          >
            Sohbete Başla
          </motion.span>
        </Link>
        <p className="text-xs text-white/50">
          {user
            ? 'Başarıyla giriş yaptın! Sohbete başlayabilirsin.'
            : 'Önce Google ile giriş yapmalısın.'}
        </p>
      </motion.div>

      <BottomNav />
    </div>
  )
}


