# Vietnamese Catholic Church Website (React + TypeScript + Vite)

A multilingual church website with Vietnamese and English support, reflections and events. Admin can manage content via dashboard. Language preference is persisted in localStorage. Content (events, reflections, gallery) is stored in Firebase with real-time synchronization.

## 🚀 Quick Start

For production deployment and making content available online, see:
- **[📘 DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete Firebase setup guide
- **[🔐 GITHUB_SECRETS.md](./GITHUB_SECRETS.md)** - GitHub Actions deployment setup
- **[📊 VERCEL_ANALYTICS.md](./docs/VERCEL_ANALYTICS.md)** - Getting started with Vercel Web Analytics

For local development, continue reading below.

## Features

- Multilingual UI and content (vi/en) with smart fallback to Vietnamese.
- Reflections list and detail pages with search, author filter, and sorting.
- Events with localized date formatting.
- Admin dashboard for Events, Reflections, and Gallery with bilingual fields.
- Optional auto-translation (mock dictionary) and text formatting utilities.
- Clean, bright UI built with Tailwind CSS.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Context API for language (`src/contexts/LanguageContext.tsx`)
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

Lint and fix issues:
```bash
npm run lint:fix
```

Type check:
```bash
npm run type-check
```

## Code Quality & Standards

This project follows modern TypeScript and React best practices:

- ✅ **TypeScript strict mode** - Full type safety without `any` types
- ✅ **ESLint configured** - Catches common errors and enforces code style
- ✅ **React Hooks rules** - Proper hooks usage enforced
- ✅ **Code splitting** - Lazy loading for optimal bundle sizes
- ✅ **Manual chunks** - React and Firebase separated for better caching
- ✅ **Security audits** - Dependencies regularly checked for vulnerabilities

### Performance Optimizations

- Lazy loading for all routes except the home page
- React vendor bundle separated (~44 KB gzipped)
- Firebase bundle separated (~119 KB gzipped)
- Individual page bundles (0.5-18 KB each)
- Suspense boundaries with loading states

## Project Structure

- `src/contexts/LanguageContext.tsx` — language state, `t()` translator, vi/en resources, default `vi` with localStorage persistence.
- `src/components/Navbar.tsx` — language toggle and navigation.
- `src/pages/Reflections.tsx` — search, author filter, sorting.
- `src/pages/ReflectionDetail.tsx` — bilingual rendering with language fallback.
- `src/pages/AdminReflections.tsx`, `src/pages/AdminEvents.tsx` — bilingual forms, mock auto-translate, formatting helpers.
- `tailwind.config.js` — Tailwind configuration with brand colors.

## Internationalization (i18n)

Content types (Reflections, Events) use bilingual fields:
```ts
type Localized = { vi: string; en?: string };
```
When rendering: use `content[language] || content.vi` to ensure fallback.
Dates format via `toLocaleDateString()` with `vi-VN` or `en-US` based on current language.

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

### Admin Access

- Admin pages (`/admin/*`) are protected and require Firebase Authentication.
- Sign in using Firebase Email/Password authentication through the navbar when signed out.
- If Firebase is not configured, admin features are accessible without authentication (development mode).

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
