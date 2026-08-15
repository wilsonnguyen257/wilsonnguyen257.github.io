/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // System-first stack (San Francisco on Apple devices) with Be Vietnam Pro
        // as the web fallback so Vietnamese diacritics always render correctly.
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Be Vietnam Pro"',
          '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif',
        ],
        // Kept available for anyone who wants an editorial moment, but no
        // longer the default for headings — the new look is sans throughout.
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        // Primary accent — a single, precise blue used for links, primary
        // actions and focus states (kept the `brand` key so it cascades
        // through every existing usage across the app).
        brand: {
          50: '#f0f7ff',
          100: '#dcedff',
          200: '#b9daff',
          300: '#8ac1ff',
          400: '#529eff',
          500: '#1f7cf5',
          600: '#0071e3',
          700: '#0058b3',
          800: '#00427f',
          900: '#012c54',
        },
        // Secondary accent — reserved for a small number of deliberate
        // moments (the Give/donate call-to-action, live/urgent badges).
        accent: {
          50: '#fff1f0',
          100: '#ffe1de',
          200: '#ffc3bd',
          300: '#ff9d92',
          400: '#ff6f61',
          500: '#ff3b30',
          600: '#e0271d',
          700: '#b81f17',
          800: '#8f1810',
          900: '#6b120c',
        },
        // Apple's own neutral "off-white" — used for alternating section
        // backgrounds and the footer instead of colored gradients.
        surface: '#f5f5f7',
      },
    },
  },
  plugins: [],
}