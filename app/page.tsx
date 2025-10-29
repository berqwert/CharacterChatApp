import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'

export default function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4 text-center">
      <div>
        <h1 className="text-3xl font-semibold">Character Chat App</h1>
        <p className="mt-2 text-white/70">Basit başlangıç sürümü</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/chat"
          className="rounded-md bg-brand px-4 py-3 font-medium text-brand-foreground hover:opacity-90"
        >
          Sohbete Başla
        </Link>
        <p className="text-xs text-white/50">
          Not: Google ile giriş sonraki adımda eklenecek. Şimdilik misafir devam girişiyle devam edebilirsiniz.
        </p>
      </div>

      <BottomNav />
    </div>
  )
}


