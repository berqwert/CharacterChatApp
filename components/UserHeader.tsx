"use client"
import { useSupabaseAuth } from '@/components/SupabaseProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

export function UserHeader() {
  const { user, signOut } = useSupabaseAuth()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  if (!user) return null
  
  return (
    <div ref={ref} className="fixed top-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-end gap-2"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 px-3 py-1.5 shadow-lg hover:bg-black/80 transition-colors"
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
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.button
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
              className="rounded-md bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/30 transition-colors shadow-lg"
            >
              Çıkış Yap
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

