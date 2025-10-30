"use client"
import { Session, User } from '@supabase/supabase-js'
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'

const AuthContext = createContext<{
  session: Session | null
  user: User | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
} | undefined>(undefined)

export function SupabaseProvider({ children }: PropsWithChildren<{}>) {
  const [session, setSession] = useState<Session | null>(null)
  const user = session?.user ?? null
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_ev, sess) => setSession(sess ?? null))
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }
  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useSupabaseAuth must be used within SupabaseProvider')
  return v
}
