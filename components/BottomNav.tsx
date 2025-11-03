"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/useTranslation'

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()
  
  const tabs = [
    { href: '/chat', labelKey: 'chats', icon: '💬' },
    { href: '/', labelKey: 'home', icon: '🏠' },
    { href: '/characters', labelKey: 'characters', icon: '👤' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/40 z-50 safe-area-inset-bottom h-[64px]">
      <div className="container-safe flex items-stretch justify-around text-sm">
        {tabs.map((tab) => {
          const active = tab.href === '/' 
            ? pathname === '/' 
            : pathname === tab.href || pathname?.startsWith(tab.href + '/')
          return (
            <Link key={tab.href} href={tab.href} className={`flex-1 p-3 text-center flex flex-col items-center gap-1 ${active ? 'text-brand' : 'text-white/70'}`}>
              <motion.span whileTap={{ scale: 0.96 }} transition={{ duration: 0.06 }} className="flex flex-col items-center gap-1">
                <span className="text-base">{tab.icon}</span>
                <span className="text-xs">{t(`BottomNav.${tab.labelKey}`)}</span>
              </motion.span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
