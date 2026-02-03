import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        morandi: {
          brown: {
            DEFAULT: '#756a63',
            dark: '#4a433e',
            light: '#a89f99'
          },
          rose: {
            DEFAULT: '#d4a5a5',
            light: '#f7ebeb',
            dark: '#9e6d6d'
          },
          oat: {
            DEFAULT: '#f2f0eb',
            light: '#ffffff',
            dark: '#e6e2da'
          },
          sage: '#9caf88',
          sand: '#c2b2a0'
        }
      },
      boxShadow: {
        'float': '0 4px 20px -2px rgba(117, 106, 99, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
      }
    },
  },
  plugins: [],
} satisfies Config
