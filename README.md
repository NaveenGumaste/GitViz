# GitViz

GitViz is a Next.js web app that turns any public GitHub repository into an interactive visual dashboard.

Paste a repository URL (like `facebook/react` or `https://github.com/facebook/react`) and explore:

- a radial file tree
- a 52-week commit heatmap
- top contributor activity
- language usage breakdown

## Features

- Editorial-style landing page with dark/light theme support
- GitHub OAuth sign-in (NextAuth v5) for higher API limits
- API proxy routes for GitHub data access
- Validation with Zod for API responses and user input
- Zustand-powered client store for repository data state
- D3 visualizations for file tree and commit heatmap
- Recharts visualizations for contributor and language charts

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript (strict)
- Tailwind CSS v4
- Zustand
- Zod
- D3.js + Recharts
- NextAuth.js v5 (GitHub provider)
- Bun (runtime/package manager)

## Project Structure

- `app/` - routes, layouts, route handlers
- `components/landing/` - landing page sections
- `components/viz/` - dashboard + chart components
- `app/api/github/*` - server-side GitHub API proxy endpoints
- `lib/github.ts` - GitHub client + mapping/validation
- `stores/repoStore.ts` - central repository dashboard state
- `tests/` - test files

## Prerequisites

- Bun `>=1.3`
- Node.js `>=20` (recommended alongside Bun)
- GitHub OAuth app credentials (optional but recommended)

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set these values:

- `AUTH_GITHUB_ID` - GitHub OAuth app client ID
- `AUTH_GITHUB_SECRET` - GitHub OAuth app client secret
- `AUTH_SECRET` - random secret for NextAuth session encryption
- `NEXTAUTH_URL` - app URL (for local dev: `http://localhost:3000`)

If OAuth values are missing, the app can still call public GitHub endpoints, but you will hit stricter rate limits.

## Getting Started

Install dependencies:

```bash
bun install
```

Start development server:

```bash
bun dev
```

Open `http://localhost:3000`.

## Scripts

- `bun dev` - start local dev server
- `bun run build` - create production build
- `bun start` - run production server
- `bun run lint` - run ESLint
- `bun test` - run tests
- `bun run typecheck` - run TypeScript checks

## API Routes

GitHub data routes used by the dashboard:

- `GET /api/github/repo?owner=&repo=`
- `GET /api/github/tree?owner=&repo=&branch=`
- `GET /api/github/commits?owner=&repo=`
- `GET /api/github/contributors?owner=&repo=`
- `GET /api/github/languages?owner=&repo=`

Other routes:

- `GET/POST /api/auth/[...nextauth]`
- `POST /api/contact`

## Testing

Run tests:

```bash
bun test
```

## Build for Production

```bash
bun run build
bun start
```

## Notes

- The app visualizes GitHub repositories through the GitHub REST API.
- For large repositories or high usage, authenticated requests are strongly recommended.
