/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        // Brand colors (sky blue)
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Accent colors (coral/orange, used sparingly for primary CTAs)
        accent: {
          50: '#fff4ed',
          100: '#ffe4d3',
          200: '#ffc7a6',
          300: '#ffa170',
          400: '#ff7f50',
          500: '#f9603a',
          600: '#e6472a',
          700: '#c23716',
          800: '#9c2f18',
          900: '#7e2a17',
        },
      },
    },
  },
  plugins: [],
}