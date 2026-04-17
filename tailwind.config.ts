import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bolivar: {
          yellow: '#FFD700',
          'yellow-light': '#FFF8DC',
          'yellow-hover': '#E6C200',
          green: '#00843D',
          'green-dark': '#006B31',
          'green-light': '#E8F5EE',
          white: '#FFFFFF',
          'gray-50': '#F9FAFB',
          'gray-100': '#F3F4F6',
          'gray-200': '#E5E7EB',
          'gray-300': '#D1D5DB',
          'gray-500': '#6B7280',
          'gray-700': '#374151',
          'gray-900': '#111827',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      screens: {
        mobile: { max: '767px' },
        desktop: '1024px',
      },
      fontSize: {
        'mobile-min': ['14px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'sb': '8px',
        'sb-lg': '12px',
        'sb-xl': '16px',
      },
      boxShadow: {
        'sb-card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'sb-card-hover': '0 4px 12px 0 rgba(0, 132, 61, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'sb-nav': '0 2px 8px 0 rgba(0, 0, 0, 0.12)',
        'sb-button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
