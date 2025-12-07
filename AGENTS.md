# Repository Guidelines

## Project Structure & Module Organization
- App uses React + TypeScript + Vite with Tailwind.
- Key folders:
  - `src/pages/` (route views), `src/components/` (reusable UI), `src/contexts/` (Theme/Language providers), `src/lib/` (Firebase utilities), `src/types/`.
  - Static assets: `public/`; entry: `index.html`, `src/main.tsx`.
  - GitHub Pages workflow: `.github/workflows/deploy.yml`.
- Import alias: `@` maps to `/src` (e.g., `import X from '@/components/X'`).

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server on `:3000`.
- `npm run build` — type-check then build to `dist/` (base set for static hosting).
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint (TS/React/Hooks rules).
- Install: `npm ci` (CI) or `npm install` (local). Node 18+ recommended.

## Coding Style & Naming Conventions
- TypeScript for all code; 2-space indent; prefer explicit types for public APIs.
- Components/pages: PascalCase files (`Navbar.tsx`, `AdminEvents.tsx`).
- Variables/functions: camelCase; constants UPPER_SNAKE_CASE; contexts `XxxContext.tsx`.
- Tailwind with `dark` class strategy; prefer utility-first styles.
- Lint before pushing: `npm run lint`. No Prettier; follow ESLint-recommended/TS rules in `eslint.config.js`.

## Testing Guidelines
- No test runner configured yet. If adding tests, prefer Vitest + React Testing Library.
- Place tests next to source: `Component.test.tsx` or `lib/foo.test.ts`.
- Aim for component behavior and critical lib coverage; keep tests deterministic.

## Commit & Pull Request Guidelines
- Commits: concise, imperative summary; use scopes when helpful (e.g., `feat(nav): add language toggle`).
- PRs: include description, linked issues, screenshots for UI, and testing notes.
- Require: passing lint, no secrets committed, updated docs when user-facing changes.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and fill `VITE_*` vars for Firebase configuration. Never commit `.env`.
- Firebase security rules (in `firestore.rules` and `storage.rules`) protect admin-only write operations.
- SPA hosting: GitHub Pages workflow handles client-side routing via 404.html fallback.
