import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a2a5e',
        secondary: '#f5c842',
        accent: '#f09a3e',
      },
      fontFamily: {
        sora: 'var(--font-sora)',
        lora: 'var(--font-lora)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
