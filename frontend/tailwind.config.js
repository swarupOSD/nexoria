/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          500: 'var(--color-primary)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          500: 'var(--color-secondary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          500: 'var(--color-accent)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
        },
        night: {
          bg: '#0F172A',
          card: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Sora', 'Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px var(--color-primary-alpha)',
        'glow-lg': '0 0 25px var(--color-accent-alpha)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
