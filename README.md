# Cộng Đoàn Công Giáo Việt Nam Anê Thành

[![Deploy to GitHub Pages](https://github.com/wilsonnguyen257/wilsonnguyen257.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/wilsonnguyen257/wilsonnguyen257.github.io/actions/workflows/deploy.yml)

The bilingual (Vietnamese / English) website for the Anê Thành Vietnamese Catholic Community in Box Hill North, Melbourne. It covers Mass times, events, Gospel reflections, ministries and a photo gallery. Parish volunteers update all of it from a built-in admin dashboard.

**Live site:** https://wilsonnguyen257.github.io

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Firebase setup](#firebase-setup)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Bilingual content.** Every page and content item has Vietnamese and English fields. Missing English text falls back to Vietnamese.
- **This Sunday's Mass.** The homepage shows the upcoming Sunday's Mass and Gospel reflection.
- **Gospel reflections.** Search, filter by author and sort, with generated cover images and author bylines.
- **Events and calendar.** Event pages with a countdown and dates formatted for the selected language.
- **Ministries, gallery, giving and contact pages.**
- **Admin dashboard** (`/admin`). Manage events, reflections, ministries, gallery photos and contact messages. Sign-in is required.

## Tech stack

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript 5.8, React Router 7 |
| Styling | Tailwind CSS 3 |
| Build | Vite 7 |
| Backend | Firebase Auth, Firestore, Storage |
| Testing / linting | Vitest, Testing Library, ESLint 9 |
| Hosting | GitHub Pages (via GitHub Actions), Vercel Analytics & Speed Insights |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (CI builds with Node 20)
- npm (ships with Node)
- A Firebase project. This is optional for local UI work. See [Firebase setup](#firebase-setup).

### Install and run

```bash
# 1. Clone the repository
git clone https://github.com/wilsonnguyen257/wilsonnguyen257.github.io.git
cd wilsonnguyen257.github.io

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open http://localhost:3000. The port is fixed in `vite.config.ts`.

Without Firebase credentials, content falls back to `localStorage` and the admin pages stay open with no sign-in. That's fine for local development.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Check translations, type-check, and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint and auto-fix what it can |
| `npm run type-check` | Run the TypeScript compiler without emitting |
| `npm run check-translations` | Verify Vietnamese and English translation keys match |
| `npx vitest` | Run the test suite |

## Firebase setup

1. Create a Firebase project and enable:
   - **Authentication** with the Email/Password provider
   - **Firestore**
   - **Storage** (for gallery photos)
2. Create a `.env` file in the project root with your Firebase web app config:

   ```bash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. Restart `npm run dev`. The admin routes now require sign-in.
4. Deploy the security rules in this repo:

   ```bash
   npm i -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,storage
   ```

5. In **Firebase Console → Authentication → Settings → Authorized domains**, add your production domain (e.g. `wilsonnguyen257.github.io`).

Content is stored as one Firestore document per dataset, in `site-data/{name}`. The `src/lib/storage.ts` module handles reads, writes and live subscriptions.

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.

For the build to connect to Firebase, add the six `VITE_FIREBASE_*` values above as **repository secrets**: Settings → Secrets and variables → Actions.

`vercel.json` is also included if you want to deploy the same build to Vercel.

## Project structure

```
src/
├── pages/        # Route pages (public pages + Admin*.tsx)
├── components/   # Shared UI, forms, admin and gallery components
├── contexts/     # Language context and translations
├── hooks/        # Custom React hooks
├── lib/          # Firebase client, storage layer, utilities
└── types/        # Shared TypeScript types
public/           # Static assets, icons, manifest
scripts/          # Build-time checks (translations)
docs/             # Architecture diagram, analytics notes
firestore.rules   # Firestore security rules
storage.rules     # Storage security rules
```

## Contributing

1. Create a branch from `main`.
2. Make your change. Add any new UI text to **both** the Vietnamese and English translations.
3. Run `npm run lint` and `npm run build` before opening a pull request. The build fails on missing translations or type errors.
4. Open a pull request with a short description and, for UI changes, a screenshot.

Report bugs or request features through [GitHub Issues](https://github.com/wilsonnguyen257/wilsonnguyen257.github.io/issues).

## License

MIT
