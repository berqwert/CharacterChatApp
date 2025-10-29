import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'

const demoChats = [
  { id: 'assistant-1', name: 'Luna', last: 'Merhaba! Nasıl yardımcı olabilirim?' },
  { id: 'assistant-2', name: 'Atlas', last: 'Bugünün planını birlikte yapalım.' },
]

export default function ChatListPage() {
  return (
    <div className="px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold">Sohbetler</h2>
      <ul className="space-y-2">
        {demoChats.map((c) => (
          <li key={c.id}>
            <Link
              href={`/chat/${c.id}`}
              className="block rounded-md border border-white/10 p-3 hover:bg-white/5"
            >
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-white/60">{c.last}</div>
            </Link>
          </li>
        ))}
      </ul>
      <BottomNav />
    </div>
  )
}


