'use client'

import { useLocale } from './i18n-client'
import enMessages from '@/messages/en.json'
import trMessages from '@/messages/tr.json'

type Messages = typeof enMessages

export function useTranslation() {
  const { locale } = useLocale()
  const messages: Messages = locale === 'tr' ? trMessages : enMessages

  function t(key: string, params?: Record<string, string | number>) {
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return key
    }
    
    if (typeof value !== 'string') return key
    
    // Replace params
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() ?? match
      })
    }
    
    return value
  }

  return { t, locale }
}

