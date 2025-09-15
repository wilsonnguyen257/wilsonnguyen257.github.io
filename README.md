# Vietnamese Catholic Church Website (React + TypeScript + Vite)

A multilingual church website with Vietnamese and English support, reflections and events, and light/dark theme toggle. Admin can manage content via dashboard. Language and theme preferences are persisted in localStorage. Content (events, reflections, gallery) is currently stored in localStorage only — no remote database.

## Features

- Multilingual UI and content (vi/en) with smart fallback to Vietnamese.
- Reflections list and detail pages with search, author filter, and sorting.
- Events with localized date formatting.
- Light/Dark theme toggle via context and Tailwind “class” strategy.
- Admin dashboard for Events, Reflections, and Gallery with bilingual fields.
- Optional auto-translation (mock dictionary) and text formatting utilities.
- Clean, responsive UI built with Tailwind CSS.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS (darkMode: 'class')
- Context API for language (`src/contexts/LanguageContext.tsx`) and theme (`src/contexts/ThemeContext.tsx`)

## Getting Started

Prerequisites:
- Node.js 18+ recommended
- npm

Install dependencies:
```bash
npm install
```

Start dev server:
```bash
npm run dev
```

Build production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

Lint:
```bash
npm run lint
```

## Project Structure

- `src/contexts/LanguageContext.tsx` — language state, `t()` translator, vi/en resources, default `vi` with localStorage persistence.
- `src/contexts/ThemeContext.tsx` — theme state, toggles `dark` class on `document.documentElement`, localStorage persistence.
- `src/components/Navbar.tsx` — language and theme toggles.
- `src/pages/Reflections.tsx` — search, author filter, sorting, dark-mode-friendly inputs.
- `src/pages/ReflectionDetail.tsx` — bilingual rendering with language fallback.
- `src/pages/AdminReflections.tsx`, `src/pages/AdminEvents.tsx` — bilingual forms, mock auto-translate, formatting helpers.
- `tailwind.config.js` — `darkMode: 'class'` enabled.

## Internationalization (i18n)

Content types (Reflections, Events) use bilingual fields:
```ts
type Localized = { vi: string; en?: string };
```
When rendering: use `content[language] || content.vi` to ensure fallback.
Dates format via `toLocaleDateString()` with `vi-VN` or `en-US` based on current language.

## Theme

- Tailwind dark mode is configured using the class strategy.
- `ThemeProvider` stores preference and toggles the `dark` class.
- Components use `dark:` utilities, e.g., inputs in `Reflections.tsx` use `dark:bg-slate-700 dark:text-white` and `dark:placeholder-slate-300`.

## Admin Usage

- Edit content via `AdminReflections` and `AdminEvents` only. Detail pages do not allow editing.
- Each form provides Vietnamese and English fields. Auto-translation can be toggled on/off.
- “Format” buttons clean pasted English text (normalize whitespace/punctuation).

## Data storage (frontend-only)

- Admin edits are stored in the browser's localStorage under keys like `site-data:events`, `site-data:reflections`, and `site-data:gallery`.
- Cross‑tab updates use storage events and BroadcastChannel for immediate UI refresh in the same browser.
- Clearing site data or using a different browser/device resets content to defaults (Events include built‑in defaults).

To make changes visible to everyone and persist across devices, you’ll need to hook up a backend later (Firebase, a small Node server, or any DB) and wire `src/lib/storage.ts` to it.

## Git & GitHub

`.gitignore` already excludes `node_modules/` and `dist/`.

Initial push:
```bash
git init
git add .
git commit -m "Initial commit: Multilingual church site"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/wilsonnguyen257.github.io
git push -u origin main
```

## Troubleshooting

- PowerShell execution policy blocking scripts:
  - Open PowerShell as Administrator and run: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
  - Or run `npm run dev` from a terminal that allows script execution.
- After changing Tailwind config, restart dev server.

## License

MIT
