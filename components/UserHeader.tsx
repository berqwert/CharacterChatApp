"use client"
import { useSupabaseAuth } from '@/components/SupabaseProvider'
import { motion } from 'framer-motion'

export function UserHeader() {
  const { user } = useSupabaseAuth()
  if (!user) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 px-3 py-1.5 shadow-lg"
    >
      {user.user_metadata?.avatar_url && (
        <img
          src={user.user_metadata.avatar_url}
          alt="Avatar"
          className="w-7 h-7 rounded-full border border-white/10"
        />
      )}
      <span className="text-sm text-white/90 font-medium max-w-[120px] truncate">
        {user.user_metadata?.name ?? user.email?.split('@')[0]}
      </span>
    </motion.div>
  )
}

