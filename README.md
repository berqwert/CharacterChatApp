# CharacterChatApp

Minimal, mobile-first Character.AI tarzı sohbet uygulaması. Next.js (App Router), Tailwind CSS, Framer Motion ve Supabase ile geliştirilmiştir. Groq API entegrasyonu ile gerçek zamanlı AI sohbeti sağlar.

**Not:** Bu proje geliştirilirken Cursor AI ve ChatGPT desteği kullanılmıştır.

## Teknolojiler
- React + Next.js (App Router)
- Tailwind CSS
- Framer Motion (animasyonlar)
- Supabase (Authentication)
- Groq API (LLM)
- next-intl (Internationalization)

## Kurulum
```bash
git clone https://github.com/berqwert/CharacterChatApp.git
cd CharacterChatApp
npm install
npm run dev
```

## Ortam Değişkenleri
`env.example` dosyasını `.env.local` olarak kopyalayın ve doldurun:
- `GROQ_API_KEY`: [Groq Console](https://console.groq.com/docs/overview)'dan alın
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase projenizden alın
- Google Auth ayarları için `env.example` dosyasındaki notlara bakın

## Komutlar
- `dev`: Geliştirme sunucusu
- `build`: Üretim derlemesi
- `start`: Üretim sunucusu

## Sayfa Yapısı

- `/` → Ana sayfa (giriş yapma ve karakter seçme)
- `/chat` → Sohbet listesi (aktif konuşmalar)
- `/chat/[characterId]` → Karakter sohbet ekranı
- `/characters` → Karakter seçim sayfası

## Özellikler

- Google Sign-in ile kimlik doğrulama (Supabase Auth)
- 5 farklı karakter ile sohbet
- Groq API ile gerçek zamanlı AI yanıtları
- Mesaj geçmişi (localStorage)
- Çoklu dil desteği (Türkçe/İngilizce)
- Responsive tasarım (mobile-first)
- Smooth animasyonlar (Framer Motion)

## Sorun Giderme
- TypeScript: "Cannot find type definition file for 'node'"
  ```bash
  npm i -D @types/node
  ```
- JSX: "JSX element implicitly has type 'any'"
  - `next-env.d.ts` dosyasının mevcut olması gerekir (repo’da var). Yoksa ekleyin ve IDE’yi yeniden başlatın.

## Live Demo
🌐 **[https://character-chat-app-navy.vercel.app](https://character-chat-app-navy.vercel.app)**

## Deploy (Vercel)
1) Repo: `https://github.com/berqwert/CharacterChatApp`
2) Vercel'de yeni proje → GitHub repo'yu bağla
3) Environment: `GROQ_API_KEY`, (isteğe bağlı) Supabase değişkenleri
4) Build: Varsayılan Next.js ayarları
