"use client"
import { useSupabaseAuth } from '@/components/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CharactersLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth()
  const router = useRouter()
  useEffect(() => {
    if (!user) router.replace('/')
  }, [user, router])
  if (!user) return null
  return <>{children}</>
}

