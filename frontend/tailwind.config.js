/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper:  { DEFAULT: '#F7F7F5', dim: '#F0EDE6' },
        ink:    { DEFAULT: '#0B1220', soft: '#1F2937', mute: '#4B5563', faint: '#9CA3AF' },
        rule:   { DEFAULT: '#E6E4DF', soft: '#F0EDE6' },
        civic:  { DEFAULT: '#1A3A5C', ink: '#0E2238' },
        flag:   { DEFAULT: '#A3352D', soft: '#F3E4E1' },
        moss:   { DEFAULT: '#2F5D43', soft: '#E2ECE3' },
        sun:    { DEFAULT: '#B8860B', soft: '#F3EAD2' },
      },
      fontFamily: {
        // `serif` aliased to Inter so existing `font-serif` classes keep working
        // without a font swap. Typography is now unified on Inter.
        serif: ['Inter', 'system-ui', 'sans-serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.03em' }],
        'display-lg': ['32px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
        'display-md': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'body-lg':    ['17px', { lineHeight: '26px' }],
        'body':       ['15px', { lineHeight: '22px' }],
        'body-sm':    ['13px', { lineHeight: '20px' }],
        'label':      ['11px', { lineHeight: '14px', letterSpacing: '0.06em' }],
        'mono':       ['12px', { lineHeight: '18px' }],
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
};
