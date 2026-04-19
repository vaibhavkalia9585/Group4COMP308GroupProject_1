/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E3A8A',
          accent: '#DC2626',
        },
        ui: {
          bg: '#F3F4F6',
          surface: '#FFFFFF',
          border: '#E5E7EB',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        paper: {
          DEFAULT: '#F3F4F6',
          dim: '#F9FAFB',
        },
        ink: {
          DEFAULT: '#111827',
          soft: '#1F2937',
          mute: '#6B7280',
          faint: '#9CA3AF',
        },
        rule: {
          DEFAULT: '#E5E7EB',
          soft: '#F9FAFB',
        },
        civic: {
          DEFAULT: '#1E3A8A',
          ink: '#1E40AF',
        },
        flag: {
          DEFAULT: '#DC2626',
          soft: '#FEF2F2',
        },
        moss: {
          DEFAULT: '#6B7280',
          soft: '#F3F4F6',
        },
        sun: {
          DEFAULT: '#3B82F6',
          soft: '#EFF6FF',
        },
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
