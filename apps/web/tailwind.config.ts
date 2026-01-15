import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background & Neutrals
        bg: {
          page: '#09090B', // zinc-950
          card: '#18181B', // zinc-900
          elevated: '#27272A', // zinc-800
          input: '#18181B', // zinc-900
        },
        border: {
          subtle: '#27272A', // zinc-800
          active: '#3F3F46', // zinc-700
        },
        text: {
          primary: '#FAFAFA', // zinc-50
          secondary: '#A1A1AA', // zinc-400
          tertiary: '#52525B', // zinc-600
        },
        // Primary (Brand & CTA)
        primary: {
          main: '#6366F1', // indigo-500
          hover: '#4F46E5', // indigo-600
          text: '#FFFFFF',
          soft: '#312E81', // indigo-900 at 20% opacity
        },
        // Semantic Status
        status: {
          success: {
            bg: '#064E3B', // emerald-900
            text: '#34D399', // emerald-400
          },
          warning: {
            bg: '#78350F', // amber-900
            text: '#FBBF24', // amber-400
          },
          error: {
            bg: '#7F1D1D', // red-900
            text: '#F87171', // red-400
          },
          info: {
            bg: '#1E3A8A', // blue-900
            text: '#60A5FA', // blue-400
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'heading-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'heading-md': ['18px', { lineHeight: '28px', fontWeight: '500' }],
        'heading-sm': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
    },
  },
  plugins: [
    // Custom utilities
    function ({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.safe-top': {
          'padding-top': 'calc(env(safe-area-inset-top) + 16px)',
        },
        '.safe-bottom': {
          'padding-bottom': 'calc(env(safe-area-inset-bottom) + 16px)',
        },
        '.pb-safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      });
    },
  ],
};
export default config;
