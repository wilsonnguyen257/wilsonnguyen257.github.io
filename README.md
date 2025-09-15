# Vietnamese Catholic Church Website (React + TypeScript + Vite)

A multilingual church website with Vietnamese and English support, reflections and events, and light/dark theme toggle. Admin can manage content via dashboard. Language and theme preferences are persisted in localStorage. Content (events, reflections, gallery) can be stored in Firebase (recommended) or falls back to Vercel Blob/localStorage.

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
- Optional Firebase Auth + Firestore backend (`src/lib/firebase.ts` + `src/lib/storage.ts`)

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

## Backend Storage

You have three layers of storage, used in this order:

1) Firebase Firestore (if configured)
2) Vercel Blob via API route (`/api/site-data/[name].ts`)
3) LocalStorage fallback (dev/offline)

`src/lib/storage.ts` abstracts reads/writes/subscriptions. When Firebase is configured, data is stored in a single Firestore document per dataset at collection `site-data/{name}` with shape `{ value: [...] }` and `updatedAt` timestamp.

### Enable Firebase

1) Create a Firebase project and enable:
   - Authentication: Email/Password
   - Firestore Database (in production or test mode)
2) Copy `.env.example` to `.env` and fill values from your Firebase Web App settings:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3) Restart dev server. When configured, admin routes enforce sign-in.
4) Optional: Secure Firestore with rules that allow reads for everyone and restrict writes to authenticated admins, e.g.:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site-data/{doc} {
      allow read: if true;
      allow write: if request.auth != null; // tighten as needed
    }
  }
}
```

You can also use the provided rules files and Firebase CLI:

- Install CLI: `npm i -g firebase-tools`
- Login: `firebase login`
- Initialize (optional): `firebase init` (choose Firestore and Storage, use existing project)
- Deploy rules only:
  - `firebase deploy --only firestore:rules`
  - `firebase deploy --only storage`

The repo contains example rules:
- Firestore: `firestore.rules`
- Storage: `storage.rules` (public read for `gallery/**`, write requires auth)

Finally, in Firebase Authentication → Settings, add your production domain (e.g., `https://<username>.github.io`) to Authorized Domains so sign-in works in production.

### Sign In

- Visit `/login` to sign in with Email/Password (Firebase). Admin pages are wrapped with a protected route that requires auth when Firebase is configured. Without Firebase, the app allows access and stores data locally.

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
