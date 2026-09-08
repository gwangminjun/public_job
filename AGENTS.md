# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router project using TypeScript, React 19, Tailwind CSS 4, Supabase, Zustand, and TanStack React Query. Application routes live in `src/app`, including API handlers under `src/app/api`. Shared UI and feature components live in `src/components`, grouped by domain such as `jobs`, `cards`, `pokemon-kr`, `grandma`, `layout`, and `ui`. Reusable hooks are in `src/hooks`, client stores in `src/store`, and shared utilities/types in `src/lib`. Static assets, service worker files, and Leaflet marker images are in `public`. Database migrations are tracked in `supabase/migrations`.

## Build, Test, and Development Commands

- `npm run dev`: starts the local Next.js development server.
- `npm run build`: creates a production build and validates TypeScript/Next.js output.
- `npm run start`: serves the production build locally.
- `npm run lint`: runs ESLint with Next.js Core Web Vitals and TypeScript rules.
- `npm run perf:audit`: builds the app, runs mobile and desktop Lighthouse audits, and summarizes results from `scripts/lighthouse-summary.mjs`.

Run `npm install` after dependency changes and commit `package-lock.json` with `package.json`.

## Coding Style & Naming Conventions

Use TypeScript and keep `strict` compatibility. Prefer the configured `@/*` path alias for imports from `src`. Components use PascalCase filenames such as `JobCard.tsx`; hooks use `useX.ts`; stores use descriptive camelCase names such as `bookmarkStore.ts`. Route files follow Next.js conventions: `page.tsx`, `layout.tsx`, and `route.ts`. Keep domain-specific code near its feature folder and avoid mixing server-only utilities with client components.

## Testing Guidelines

No dedicated unit test script is currently configured. Before submitting changes, run `npm run lint` and `npm run build`. For UI, routing, PWA, or performance-sensitive changes, also run `npm run perf:audit` when practical. If adding tests later, place them near the feature they cover and use clear names like `JobCard.test.tsx`.

## Commit & Pull Request Guidelines

Recent history uses concise conventional prefixes such as `feat:` and `fix:`, sometimes with Korean descriptions. Keep commits scoped and outcome-focused, for example `fix: KrCardGrid key handling for filters`. Pull requests should include a short summary, verification commands run, linked issues when applicable, and screenshots or screen recordings for visible UI changes.

## Security & Configuration Tips

Keep secrets in `.env.local` and never commit API keys. Supabase schema changes should be added as numbered SQL migrations under `supabase/migrations`. Review API routes that call external services or admin Supabase clients for server-only usage before exposing data to client components.
