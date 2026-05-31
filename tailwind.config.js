/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ancient Blood Chronicle palette
        blood: {
          50:  '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f28080',
          500: '#e55353',
          600: '#c81e1e',
          700: '#9b1c1c',
          800: '#771d1d',
          900: '#5a1515',
          950: '#3b0a0a',
        },
        parchment: {
          50:  '#fdfaf4',
          100: '#faf3e0',
          200: '#f5e6c0',
          300: '#edd49a',
          400: '#e0bc6e',
          500: '#d4a44a',
          600: '#b8892f',
          700: '#9a6e22',
          800: '#7d5820',
          900: '#67481f',
        },
        copper: {
          400: '#cd7f32',
          500: '#b8722a',
          600: '#a06020',
        },
        charcoal: {
          800: '#1a1a1a',
          850: '#141414',
          900: '#0d0d0d',
          950: '#080808',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-blood': 'pulse-blood 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'seed-expand': 'seed-expand 1.5s ease-out forwards',
        'diffuse':     'diffuse 3s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-blood': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'seed-expand': {
          '0%':   { opacity: '0', transform: 'scale(0.3)' },
          '60%':  { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'diffuse': {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '0.8' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 25%, rgba(197,48,48,0.15) 50%, transparent 75%)',
      },
    },
  },
  plugins: [],
}
