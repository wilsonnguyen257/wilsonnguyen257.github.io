/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e9edff',
          200: '#cdd6ff',
          300: '#aab8ff',
          400: '#7e8dff',
          500: '#5866ff',
          600: '#3d45db',
          700: '#3036a8',
          800: '#262b82',
          900: '#1f246a',
        },
      },
    },
  },
  plugins: [],
}