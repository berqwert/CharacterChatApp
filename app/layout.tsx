import './globals.css'
import { ReactNode } from 'react'
import { PageFade } from '@/components/PageFade'

export const metadata = {
  title: 'CharacterChatApp',
  description: 'Minimal Character AI style chat – starter',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">
        <PageFade>
          <div className="container-safe flex min-h-screen flex-col">
            <main className="flex-1 pb-16">{children}</main>
          </div>
        </PageFade>
      </body>
    </html>
  )
}


