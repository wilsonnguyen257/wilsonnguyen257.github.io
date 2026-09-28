/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Be Vietnam Pro carries the apparatus — body, nav, labels, controls.
        // Purpose-built for the Vietnamese market with full diacritic coverage
        // as a first-class concern, not a retrofitted subset.
        sans: [
          '"Be Vietnam Pro"', '-apple-system', 'BlinkMacSystemFont',
          '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif',
        ],
        // Playfair Display carries the voice — display and headline type only,
        // set at 700 only. High-contrast transitional serif, missal/hymnal register.
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        // --- Anê Thành palette v2: Black / Deep Space Blue / Dusty Lavender /
        // Dusty Mauve / Cool Steel. Replaces the earlier Vietnamese Heritage
        // (sơn mài red / temple gold) direction — see DESIGN.md.

        // Primary — Deep Space Blue. Every primary interaction: links,
        // primary buttons, active nav state, focus rings.
        brand: {
          50: '#EFF4F7',
          100: '#D6E3EA',
          200: '#AFC8D5',
          300: '#7FA4BA',
          400: '#4F7B9B',
          500: '#285E80',
          600: '#0D324D',
          700: '#0A2740',
          800: '#071C30',
          900: '#041220',
        },
        // Accent — Dusty Lavender, with Dusty Mauve as its lighter step. One
        // job only: the Give action and liturgical-season highlight badges.
        // Default sits at 400 (Dusty Lavender), hover at 500.
        accent: {
          50: '#FBF7FC',
          100: '#F0E6F2',
          200: '#DCC2E0',
          300: '#A188A6', // Dusty Mauve (given)
          400: '#7F5A83', // Dusty Lavender (given) — the default accent
          500: '#6A4A6E',
          600: '#543A57',
          700: '#3F2C41',
          800: '#2A1E2B',
          900: '#150F16',
        },
        // Cool Steel — page ground. Flat, not a ramp: the ramp work for this
        // coolness lives in the `slate` override below.
        surface: '#F6F7F8',

        // Every neutral in this system is a cool, Cool-Steel-derived tint —
        // remapping Tailwind's own `slate` scale means every existing
        // `text-slate-*` / `bg-slate-*` / `border-slate-*` class in the app
        // inherits the new palette with no class-name changes required.
        // Cool Steel itself sits at 400; Black sits at 900 (ink/on-surface).
        slate: {
          50: '#F6F7F8',
          100: '#ECEDEF',
          200: '#D7D9DC',
          300: '#BCC0C4',
          400: '#9DA2AB',
          500: '#7E838C',
          600: '#61656C',
          700: '#45484D',
          800: '#292B2E',
          900: '#020202',
        },
        // Error — dusty terracotta. Remaps Tailwind's `red` so every existing
        // error/destructive usage (form validation, delete actions) lands in-family.
        red: {
          50: '#FBF2EF',
          100: '#F5DFD8',
          200: '#E7C0B3',
          300: '#D49985',
          400: '#BC7860',
          500: '#9F5C43',
          600: '#874A34',
          700: '#6B3A29',
          800: '#4E2A1E',
          900: '#321A13',
        },
        // Success — dusty sage. Remaps both `green` and `emerald` (the
        // codebase uses both) to one family.
        green: {
          50: '#F1F6F2',
          100: '#DCEADD',
          200: '#B9D4BC',
          300: '#91B896',
          400: '#6C9973',
          500: '#517A57',
          600: '#3F6144',
          700: '#304B34',
          800: '#223524',
          900: '#141F15',
        },
        emerald: {
          50: '#F1F6F2',
          100: '#DCEADD',
          200: '#B9D4BC',
          300: '#91B896',
          400: '#6C9973',
          500: '#517A57',
          600: '#3F6144',
          700: '#304B34',
          800: '#223524',
          900: '#141F15',
        },
      },
      borderRadius: {
        // Hierarchical, per DESIGN.md: sm(lg)=inputs, md(xl)=buttons, lg(2xl)=cards.
        // rounded-full stays Tailwind's default — reserved for avatars, the logo
        // mark, icon roundels, and status/season chips only.
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
