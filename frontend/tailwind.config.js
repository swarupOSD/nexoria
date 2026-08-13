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
        },
        // Stitch Surface Colors (non-conflicting)
        "surface-container": "#201f1f",
        "surface-bright": "#3a3939",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-high": "#2a2a2a",
        "surface": "#131313",
        "tertiary": "#4edea3",
        "on-surface": "#e5e2e1",
        "on-background": "#e5e2e1",
        "on-tertiary": "#003824",
        "outline": "#958ea0",
        "surface-dim": "#131313",
        "on-surface-variant": "#cbc3d7",
        "outline-variant": "#494454",
        "surface-container-low": "#1c1b1b",
        "surface-variant": "#353534",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Sora', 'Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        // Re-map Stitch fonts to existing families
        "label-caps": ['Inter', 'sans-serif'],
        "body-lg": ['Inter', 'sans-serif'],
        "headline-lg-mobile": ['Sora', 'Outfit', 'sans-serif'],
        "headline-lg": ['Sora', 'Outfit', 'sans-serif'],
        "headline-md": ['Sora', 'Outfit', 'sans-serif'],
        "display-sm": ['Sora', 'Outfit', 'sans-serif'],
        "display-lg": ['Sora', 'Outfit', 'sans-serif'],
        "body-md": ['Inter', 'sans-serif']
      },
      fontSize: {
        "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.15em", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "letterSpacing": "0.03em", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "0.03em", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "0.02em", "fontWeight": "600" }],
        "display-sm": ["48px", { "lineHeight": "56px", "letterSpacing": "0.05em", "fontWeight": "700" }],
        "display-lg": ["72px", { "lineHeight": "80px", "letterSpacing": "0.05em", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      },
      spacing: {
        "gutter": "24px",
        "stitch-sm": "8px",
        "stitch-xl": "48px",
        "stitch-lg": "24px",
        "unit": "4px",
        "stitch-md": "16px",
        "margin-mobile": "16px",
        "margin-desktop": "64px",
        "stitch-xs": "4px",
        "container-max": "1440px"
      },
      boxShadow: {
        'glow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
