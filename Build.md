# AI Agent Prompt — Git Repository Visualizer

## Role

You are a senior full-stack engineer and UI/UX designer. Build a complete, production-ready **Git Repository Visualizer** web application from scratch. Follow every instruction precisely. Do not skip sections. Do not use placeholder content anywhere.

---

## Tech Stack — Non-Negotiable

- **Framework:** Next.js 15 (App Router, Server Components where applicable)
- **Language:** TypeScript (strict mode — `"strict": true` in tsconfig)
- **Styling:** Tailwind CSS v4+ (use CSS-first config via `@theme` in globals.css, NOT tailwind.config.js)
- **State Management:** Zustand (with typed slices, one store per domain)
- **Validation:** Zod (validate all GitHub API responses and all form inputs)
- **Runtime & Tooling:** Bun for everything — `bun dev`, `bun run build`, `bun run lint`, `bun test`
- **Charts:** D3.js (file tree, commit heatmap), Recharts (contributor chart, language donut)
- **Auth:** NextAuth.js v5 with GitHub OAuth provider
- **Icons:** Lucide React only

---

## Design System — Follow Strictly

### Color Palette (Editorial Style)

Define these in Tailwind v4 `@theme` block inside `globals.css`:

```css
@theme {
	--color-ink: #0d0d0d;
	--color-paper: #f5f0e8;
	--color-accent: #ff4d00;
	--color-accent-muted: #ff4d0020;
	--color-surface: #1a1a1a;
	--color-surface-light: #efefef;
	--color-muted: #6b6b6b;
	--color-border: #e0dad0;
	--color-border-dark: #2a2a2a;

	--font-display: "Playfair Display", serif;
	--font-body: "Inter", sans-serif;
	--font-mono: "JetBrains Mono", monospace;
}
```

- **Light mode:** `paper` background, `ink` text
- **Dark mode:** `#0D0D0D` background, `#F5F0E8` text
- Accent color `#FF4D00` (burnt orange) used for CTAs, hover states, active indicators, and highlights

### Typography

- Display headings: `font-display` (Playfair Display) — large, editorial, serif
- Body: `font-body` (Inter)
- Code/mono: `font-mono` (JetBrains Mono)
- Use variable font sizes: hero headings at `clamp(3rem, 8vw, 7rem)`

### Dark/Light Mode

- Use `next-themes` with `attribute="class"`
- Wrap app in `<ThemeProvider>` in root layout
- Transition: On theme toggle, animate the entire page with:

```css
html.transitioning * {
	transition:
		background-color 400ms ease,
		color 400ms ease,
		border-color 400ms ease !important;
}
```

- Add/remove `.transitioning` class via JS before/after `setTheme()` call
- Toggle button: animated sun/moon icon swap using Framer Motion `AnimatePresence`

### Micro Interactions (Implement All)

- Buttons: `scale(0.97)` on press, subtle shadow lift on hover using Tailwind `transition-all`
- Links: underline draws in from left on hover (`scaleX` transform)
- Cards: `translateY(-4px)` + shadow increase on hover
- Input focus: border color transitions to accent with a glow ring
- Page transitions: fade + slight upward slide using Framer Motion `motion.div` wrapping page content
- Navbar pill: subtle bounce animation on mount using Framer Motion spring
- Chart nodes/bars: animate in on mount (D3 transitions, Recharts `animationBegin`)
- Loading skeleton: shimmer animation for all data-fetching states

---

## Application Pages & Routes

### 1. Landing Page `/`

Full marketing landing page. Every section below is mandatory.

#### Section 1 — Hero

- Full viewport height
- Large editorial serif heading: _"See Your Codebase. Really See It."_
- Subtext in Inter, muted color, max 2 lines
- Two CTAs: "Analyze a Repo" (accent filled button) and "View Demo" (ghost button)
- Background: subtle grid pattern using CSS `background-image: linear-gradient` — editorial paper texture in light, dark charcoal grid in dark
- Floating decorative elements: abstract blurred circles in accent color at low opacity

#### Section 2 — How It Works

- 3-step horizontal flow with large numbered circles (editorial style)
- Steps: "Paste a GitHub URL" → "We fetch & process" → "Explore visual insights"
- Animated connector line between steps using Framer Motion `motion.div` with `scaleX` on scroll

#### Section 3 — Features Showcase

- 4 feature cards in a 2x2 grid
- Features: File Tree Visualization, Commit Heatmap, Contributor Stats, Language Breakdown
- Each card: large number/icon top-left, title in display font, short description, bottom-right arrow icon
- Cards have hover lift effect

#### Section 4 — Live Demo Preview

- Static screenshot or animated mockup of the visualizer dashboard
- Framed in a "browser chrome" component (fake address bar, traffic lights)
- Light/dark mode adapts the mockup frame

#### Section 5 — Tech Stack Badge Row

- Horizontal scrolling row of tech badges (Next.js, D3.js, TypeScript, GitHub API, etc.)
- Auto-scrolling marquee animation using CSS `animation: scroll linear infinite`

#### Section 6 — About + Contact (Combined, Full-Width)

- Left half: About section
  - Serif heading: _"Built with obsession."_
  - 2 paragraphs about the project motivation
  - GitHub link button
- Right half: Contact / Connect section
  - Minimal contact form: Name, Email, Message (all Zod-validated)
  - Submit button with loading state
  - Social links: GitHub, Twitter/X, LinkedIn — icon buttons with hover scale
- Full-width dark background section (inverted from page color) to visually separate it
- This is the footer — no separate footer component needed

---

### 2. Floating Bottom Navbar (Global — appears on all pages)

- Fixed at bottom center, `position: fixed; bottom: 24px`
- Pill/capsule shape: `border-radius: 9999px`, backdrop blur, semi-transparent background
- Contains: Logo/Home, Features (anchor), About (anchor), Theme Toggle, "Analyze Repo" CTA button
- Active link indicator: small accent-colored dot below icon
- On mobile: collapses to icon-only; labels hidden
- Mount animation: slides up from bottom with spring easing via Framer Motion
- Box shadow: `0 8px 32px rgba(0,0,0,0.12)` in light, stronger in dark

---

### 3. Visualizer Page `/viz/[owner]/[repo]`

Dynamic route. Fetches data and renders all 4 visualizations.

#### URL Input (on landing `/`)

- Single text input: accepts full GitHub URL (`https://github.com/owner/repo`) or shorthand (`owner/repo`)
- Zod schema validation on input
- On submit: parse owner/repo, navigate to `/viz/[owner]/[repo]`

#### Layout

- Left sidebar (260px): Repo metadata card (name, description, stars, forks, open issues, primary language, last updated)
- Main content: Tab-based navigation for 4 views
- Tabs: "File Tree" | "Commit Activity" | "Contributors" | "Languages"

#### Tab 1 — File Tree (D3 Radial Tree)

- Fetch: `GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1`
- Validate response with Zod schema
- Render as D3 collapsible radial tree
- Nodes colored by file type (`.ts` = blue, `.css` = pink, `.md` = green, etc.)
- Click folder node: collapse/expand children with D3 transition (300ms ease)
- Click file node: show tooltip with filename, size in KB, extension
- Zoom + pan enabled via D3 zoom behavior
- Color legend component bottom-right

#### Tab 2 — Commit Heatmap (D3 Calendar)

- Fetch: `GET /repos/{owner}/{repo}/commits?per_page=100&page={n}` — paginate up to 500 commits
- Validate each commit object with Zod
- Render GitHub-style calendar heatmap using D3
- 52 weeks × 7 days grid
- Color scale: 0 commits = muted, high commits = accent color (`#FF4D00`)
- Hover tooltip: date + number of commits
- Store processed data in Zustand

#### Tab 3 — Contributor Stats (Recharts)

- Fetch: `GET /repos/{owner}/{repo}/stats/contributors`
- Validate with Zod
- Top 10 contributors by total commits
- Horizontal bar chart (Recharts `BarChart`) — bars animate in on mount
- Each bar shows avatar (from GitHub API), username, total additions, deletions, commits
- Color: accent gradient per bar

#### Tab 4 — Language Breakdown (Recharts Donut)

- Fetch: `GET /repos/{owner}/{repo}/languages`
- Validate with Zod
- Recharts `PieChart` with `innerRadius` (donut style)
- Center label: primary language name in display font
- Hover slice: expands with tooltip showing language, bytes, percentage
- Legend below chart with color swatches

---

## GitHub API Layer

Create `/lib/github.ts` with typed fetch functions:

```ts
// All functions must:
// 1. Accept a token parameter (from NextAuth session)
// 2. Return typed, Zod-validated data
// 3. Throw typed errors with descriptive messages
// 4. Handle rate limiting (429) and not-found (404) explicitly

export const getRepoMeta = async (owner: string, repo: string, token?: string) => { ... }
export const getRepoTree = async (owner: string, repo: string, sha: string, token?: string) => { ... }
export const getCommits = async (owner: string, repo: string, token?: string) => { ... }
export const getContributorStats = async (owner: string, repo: string, token?: string) => { ... }
export const getLanguages = async (owner: string, repo: string, token?: string) => { ... }
```

All API calls are made from Next.js Route Handlers (`/app/api/github/`) — never expose the GitHub token to the client.

---

## Zustand Store Structure

```ts
// stores/repoStore.ts
interface RepoStore {
	repoMeta: RepoMeta | null;
	fileTree: TreeNode[] | null;
	commits: Commit[] | null;
	contributors: Contributor[] | null;
	languages: Record<string, number> | null;
	isLoading: Record<string, boolean>;
	errors: Record<string, string | null>;
	activeTab: "tree" | "heatmap" | "contributors" | "languages";
	setActiveTab: (tab: string) => void;
	fetchAll: (owner: string, repo: string) => Promise<void>;
}
```

---

## Zod Schemas

Create `/lib/schemas/github.ts`:

```ts
export const RepoMetaSchema = z.object({ ... })
export const TreeNodeSchema = z.object({ ... })
export const CommitSchema = z.object({ ... })
export const ContributorSchema = z.object({ ... })
export const LanguagesSchema = z.record(z.string(), z.number())
export const RepoInputSchema = z.string().regex(/^(https:\/\/github\.com\/)?[\w.-]+\/[\w.-]+$/, "Invalid GitHub repo URL")
```

---

## Loading & Error States

- Every data-fetching state has a skeleton loader matching the shape of the actual component
- Error state: full-section error card with icon, message, and "Try Again" button
- Rate limit error: special state showing "GitHub rate limit hit — sign in to get 5000 req/hr" with OAuth button

---

## Bun Configuration

`package.json` scripts:

```json
{
	"scripts": {
		"dev": "bun --bun next dev",
		"build": "bun --bun next build",
		"start": "bun --bun next start",
		"lint": "bun --bun next lint",
		"test": "bun test",
		"typecheck": "tsc --noEmit"
	}
}
```

---

## File Structure

```
/app
  /api
    /github
      /repo/route.ts
      /tree/route.ts
      /commits/route.ts
      /contributors/route.ts
      /languages/route.ts
    /auth/[...nextauth]/route.ts
  /viz/[owner]/[repo]/page.tsx
  layout.tsx
  page.tsx              ← Landing page
  globals.css           ← Tailwind v4 @theme config here

/components
  /landing
    Hero.tsx
    HowItWorks.tsx
    Features.tsx
    DemoPreview.tsx
    TechBadges.tsx
    AboutContact.tsx
  /viz
    RepoSidebar.tsx
    TabNav.tsx
    FileTree.tsx
    CommitHeatmap.tsx
    ContributorChart.tsx
    LanguageDonut.tsx
  /ui
    FloatingNavbar.tsx
    ThemeToggle.tsx
    Button.tsx
    Input.tsx
    Card.tsx
    Skeleton.tsx
    Tooltip.tsx
    ErrorState.tsx

/lib
  github.ts
  /schemas
    github.ts

/stores
  repoStore.ts

/hooks
  useRepo.ts
  useThemeTransition.ts
```

---

## Quality Rules

- No `any` types anywhere — use `unknown` with Zod narrowing
- All components typed with explicit props interfaces
- No inline styles — Tailwind classes only
- All images use `next/image`
- All navigation uses `next/link`
- Responsive at 320px, 768px, 1024px, 1440px breakpoints
- Lighthouse score target: 90+ performance, 100 accessibility
- Add `loading="lazy"` on all non-hero images
- Use `Suspense` boundaries around all async components

---

## Start Order

Build in this exact sequence:

1. Project setup (bun create, install all deps)
2. Tailwind v4 theme config in globals.css
3. Zod schemas
4. GitHub API lib functions + Route Handlers
5. Zustand store
6. UI primitives (Button, Input, Card, Skeleton, Tooltip)
7. FloatingNavbar
8. ThemeToggle with transition animation
9. Landing page sections top to bottom
10. Visualizer page layout + sidebar
11. File Tree (D3)
12. Commit Heatmap (D3)
13. Contributor Chart (Recharts)
14. Language Donut (Recharts)
15. Error + loading states for all views
16. Final polish: micro interactions, responsive fixes, page transitions
