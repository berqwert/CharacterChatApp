"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const tabs = [
  { href: '/chat', label: 'Chats' },
  { href: '/characters', label: 'Karakterler' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="container-safe flex items-stretch justify-around text-sm">
        {tabs.map((t) => {
          const active = pathname === t.href
          return (
            <Link key={t.href} href={t.href} className={`flex-1 p-3 text-center ${active ? 'text-brand' : 'text-white/70'}`}>
              <motion.span whileTap={{ scale: 0.96 }} transition={{ duration: 0.06 }}>
                {t.label}
              </motion.span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


