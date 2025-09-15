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

## Backend Server (Express)

This repo includes a simple Express backend that stores editable data as JSON files in the `data/` folder and exposes a small API consumed by the app.

- Start backend locally: `npm run dev:server` (port 4000)
- Frontend dev server proxies `/api` to `http://localhost:4000`.
- Build production: `npm run build`
- Start production server (serves API and static `dist/`): `npm start` (port 4000)

API routes:
- `GET /api/site-data/events|reflections|gallery` → returns JSON (defaults to [])
- `PUT /api/site-data/{name}` with JSON body → saves to `data/{name}.json`

Note: The Express server provides a single-file JSON storage. For a real database later, keep the same endpoints and change the implementation. 

## Data storage

- Primary: API (`/api/site-data/...`) backed by JSON files in `data/` managed by the Express server.
- Fallback: localStorage is still used if the API is unreachable.

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
