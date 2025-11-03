'use client'

import { ReactNode } from 'react'
import { PageFade } from '@/components/PageFade'
import { SupabaseProvider } from '@/components/SupabaseProvider'
import { UserHeader } from '@/components/UserHeader'
import { LocaleProvider } from '@/lib/i18n-client'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <SupabaseProvider>
        <LanguageSwitcher />
        <UserHeader />
        <PageFade>
          <div className="container-safe flex min-h-screen flex-col overflow-x-hidden">
            <main className="flex-1 pb-16 w-full overflow-x-hidden">{children}</main>
          </div>
        </PageFade>
      </SupabaseProvider>
    </LocaleProvider>
  )
}

