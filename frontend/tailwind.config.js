/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', dark: '#1D4ED8', soft: '#EFF6FF' },
        canvas: '#F8FAFC',
        ink: '#0F172A',
        line: '#E2E8F0',
      },
    },
  },
  plugins: [],
};
