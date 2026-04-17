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
          green: '#00843D',
          white: '#FFFFFF',
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
    },
  },
  plugins: [],
};

export default config;
