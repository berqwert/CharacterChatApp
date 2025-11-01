import './globals.css'
import { ReactNode } from 'react'
import { ClientLayout } from './client-layout'

export const metadata = {
  title: 'CharacterChatApp',
  description: 'Minimal Character AI style chat – starter',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
