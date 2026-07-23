import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#0C0B0F',
          DEFAULT: '#0E081C',
          soft: '#19103A',
        },
        surface: '#19103A',
        brand: {
          DEFAULT: '#8232F0',
          light: '#A66BFF',
          pale: '#D4B8FF',
        },
        accent: '#E879F9',
        bull: '#C4B5FD',
        bear: '#F472B6',
        signal: '#A78BFA',
        ink: { DEFAULT: '#F3EEFF', muted: '#9B8FB8' },
        stroke: '#2D2450',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(130,50,240,0.18), 0 12px 40px rgba(0,0,0,0.5)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 30px rgba(14,8,28,0.55)',
      },
      backgroundImage: {
        'app-gradient':
          'linear-gradient(109deg, #0E081C 4.48%, #0C0B0F 31.88%, #19103A 70.77%, #360083 86.92%, #8232F0 105.08%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-live': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(130,50,240,0.45)' },
          '50%': { boxShadow: '0 0 0 6px rgba(130,50,240,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'fade-in': 'fade-in 0.18s ease-out both',
        'pulse-live': 'pulse-live 2s ease-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
