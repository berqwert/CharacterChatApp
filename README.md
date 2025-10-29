# CharacterChatApp

Minimal, mobile-first Character.AI tarzı sohbet uygulaması başlangıç projesi. Next.js (app router), Tailwind, Framer Motion ve Supabase istemci yapılandırma iskeleti içerir. LLM entegrasyonu için Groq API anahtarı bekler (şimdilik stub).

## Teknolojiler
- React + Next.js (App Router)
- Tailwind CSS
- Framer Motion (animasyonlar)
- Radix UI (Avatar primitive — ileride genişletilebilir)
- Supabase JS (istemci oluşturucu — auth/rt ileride)

## Kurulum
```bash
cd "/Users/berkeozbek/Desktop/Projects/CharacterChatApp"
npm i     # veya yarn
npm run dev
```

## Ortam Değişkenleri
`env.example` dosyasını `.env.local` olarak kopyalayın ve doldurun:
```
GROQ_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Komutlar
- `dev`: Geliştirme sunucusu
- `build`: Üretim derlemesi
- `start`: Üretim sunucusu

## Sayfa Yapısı ve Akış
- `/` → Karşılama (şimdilik misafir)
- `/chat` → Sohbet listesi (dummy)
- `/chat/[characterId]` → Sohbet ekranı (stub API ile bot yanıtı)

Kullanıcı akışı: Karşılamadan sohbete geç → mesaj gönder → bot yanıtlar → alt menüden sayfalar arası geçiş.

## Notlar
- Groq entegrasyonu için `app/api/chat/route.ts` içindeki stub, `process.env.GROQ_API_KEY` ile gerçek istek yapacak şekilde güncellenebilir.
- Supabase kimlik doğrulama ve realtime mesajlar için `lib/supabase.ts` hazır; ilerleyen aşamada provider ve server action eklenebilir.

## Sorun Giderme
- TypeScript: "Cannot find type definition file for 'node'"
  ```bash
  npm i -D @types/node
  ```
- JSX: "JSX element implicitly has type 'any'"
  - `next-env.d.ts` dosyasının mevcut olması gerekir (repo’da var). Yoksa ekleyin ve IDE’yi yeniden başlatın.

## Deploy (Vercel)
1) Repo: `https://github.com/berqwert/CharacterChatApp`
2) Vercel’de yeni proje → GitHub repo’yu bağla
3) Environment: `GROQ_API_KEY`, (isteğe bağlı) Supabase değişkenleri
4) Build: Varsayılan Next.js ayarları
