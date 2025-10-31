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
    // Check for OAuth callback in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const error = hashParams.get('error')
    const errorDescription = hashParams.get('error_description')
    
    if (error) {
      console.error('OAuth callback error:', error, errorDescription)
      alert(`Giriş hatası: ${errorDescription || error}`)
      // Clean URL
      window.history.replaceState(null, '', window.location.pathname)
    }
    
    // Initial session check
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        console.error('Session error:', sessionError)
      } else {
        console.log('Initial session:', data.session?.user?.email ?? 'no session')
        setSession(data.session ?? null)
      }
    })
    
    // Listen for auth state changes (including OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log('Auth state changed:', event, sess?.user?.email ?? 'no user')
      
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
        console.error('OAuth error:', error)
        alert(`Giriş hatası: ${error.message}`)
      } else {
        console.log('OAuth redirect started:', data.url)
      }
    } catch (err) {
      console.error('Sign in error:', err)
      alert('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.')
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
