'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Locale = 'en' | 'tr'

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
} | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'tr'
    const stored = localStorage.getItem('locale') as Locale | null
    return stored && ['en', 'tr'].includes(stored) ? stored : 'tr'
  })

  useEffect(() => {
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}

