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
        // Brand colors
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
        // Dark mode colors
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      backgroundColor: {
        dark: {
          primary: '#0f172a', // slate-900
          secondary: '#1e293b', // slate-800
          accent: '#334155', // slate-700
        },
      },
      textColor: {
        dark: {
          primary: '#f8fafc', // slate-50
          secondary: '#e2e8f0', // slate-200
          muted: '#94a3b8', // slate-400
        },
      },
      borderColor: {
        dark: {
          DEFAULT: '#334155', // slate-700
          light: '#475569', // slate-600
        },
      },
    },
  },
  plugins: [],
}