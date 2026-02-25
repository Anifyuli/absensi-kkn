/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#080a0e',
          900: '#0e1118',
          800: '#161b26',
          700: '#1f2737',
          600: '#2a3547',
        },
        slate: {
          500: '#3d4f68',
          400: '#5a728f',
          300: '#8099b4',
        },
        amber: {
          400: '#f5a623',
          300: '#f7bc5c',
          200: '#fad48f',
        },
        emerald: {
          400: '#34d399',
          300: '#6ee7b7',
        },
        rose: {
          400: '#fb7185',
          300: '#fda4af',
        },
        sky: {
          400: '#38bdf8',
          300: '#7dd3fc',
        },
        violet: {
          400: '#a78bfa',
          300: '#c4b5fd',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.4s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'slide-in': 'slideIn 0.3s ease both',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'count-up': 'countUp 0.5s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 166, 35, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(245, 166, 35, 0.15)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
