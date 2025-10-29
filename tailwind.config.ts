import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6E59F9',
          foreground: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
} satisfies Config


