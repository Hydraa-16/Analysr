/** @type {import('tailwindcss').Config} */
// Every color here matches the locked design system exactly.
// Do not add new colors here without updating the project design spec first —
// this file is the single source of truth Tailwind pulls from across all components.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5F5F3',
        surface: '#FFFFFF',
        border: '#E8E8E6',
        accent: '#0ABFA3',
        'flag-high': '#E84D4D',
        'flag-borderline': '#F5A623',
        'flag-normal': '#27AE8F',
        'text-primary': '#111110',
        'text-secondary': '#6B7A8D',
        'nav-bg': '#111110',
        'headline-muted': '#AAAAAA'
      },
      borderRadius: {
        card: '12px'
      },
      fontSize: {
        label: ['11px', { letterSpacing: '0.08em' }]
      },
      // Typeface system (brief specifies weight/role but not exact faces):
      // display = Fraunces, for the two-tone headline editorial weight contrast.
      // body = Hanken Grotesk, clean sans-serif per spec.
      // mono = IBM Plex Mono, used sparingly for section-label pills and the
      // live activity ticker — ties into the "data becoming legible" motif.
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      // Animation utilities for the signature blur-to-sharp reveal, staggered
      // fade-up cards, and the live activity marquee. Reduced-motion handling
      // lives in tokens.css.
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        marquee: 'marquee 32s linear infinite'
      }
    }
  },
  plugins: []
}