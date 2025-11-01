"use client"
import { Session, User } from '@supabase/supabase-js'
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { useTranslation } from '@/lib/useTranslation'

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
  const { t } = useTranslation()

  useEffect(() => {
    // Check for OAuth callback in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const error = hashParams.get('error')
    const errorDescription = hashParams.get('error_description')
    
    if (error) {
      alert(t('Auth.signInError', { message: errorDescription || error }))
      window.history.replaceState(null, '', window.location.pathname)
    }
    
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })
    
    // Listen for auth state changes (including OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(sess)
        // Clean up URL hash after successful auth
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
      } else if (sess) {
        setSession(sess)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  async function signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      
      if (error) {
        alert(t('Auth.signInError', { message: error.message }))
      }
    } catch {
      alert(t('Auth.signInErrorOccurred'))
    }
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
