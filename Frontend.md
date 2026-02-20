# HireAHuman.ai — Frontend Architecture

## Tech Stack
- React 18+ with TypeScript
- Vite (Rolldown-Vite v7)
- React Router v6 (createBrowserRouter)
- Framer Motion (animations)
- Lucide React (icons)
- Tailwind CSS / clsx / tailwind-merge
- InsForge SDK (`@insforge/sdk`) for auth, database, storage

## Routes
| Path | Component | Purpose |
|------|-----------|---------| 
| `/` | LandingPage | Hero, features, manifesto, stats (real from InsForge) |
| `/browse` | BrowsePage | Talent directory with search/filter by skills, location, experience, employment status, BlueTech |
| `/join` | JoinPage | Google OAuth or email magic link login → redirects to /profile |
| `/blog` | BlogPage | Blog listing page |
| `/blog/:slug` | BlogPostPage | Individual blog post renderer |
| `/introducing-hire-a-human` | → Redirects to `/blog/introducing-hire-a-human` | **SEO brand indexing page** |
| `/hire-humans` | HireHumansPage | Recruiter-facing hiring landing page |
| `/vs/rentahuman` | VsRentAHuman | Competitor comparison page |
| `/profile` | ProfilePage | Engineer profile form: handle, name, bio, location, role, skills (max 15, 3-source selection), years of exp, GitHub, LinkedIn, resume upload (2/month limit), experience history, **projects** (title, description, tech stack, URL), employment status, **job target** (internship / full-time) |
| `/dashboard` | DashboardPage | Candidate dashboard: profile completeness %, avatar upload, employment status toggle, resume status, BlueTech badge, experience timeline, **projects display**, **job target badge**, **monthly profile views count** |
| `/verify` | VerifyCompanyPage | Company verification: login/signup with email+password (real InsForge auth with email verification), company form with work email domain validation (blocks 40+ public domains), domain-website matching, business ID, security deposit. Clean corporate design. |
| `/recruiter-dashboard` | RecruiterDashboard | Company dashboard: professional corporate design, verification status banners, company profile editor with save, talent pool stats, quick links sidebar |
| `/admin` | AdminPage | Admin panel: professional table view, search/filter by status, approve/reject actions, company stats overview |
| `/docs` | DocsPage | Documentation |

---

## SEO Implementation (All 6 Phases)

### Phase 1 — Critical Technical Setup (`index.html`)
| Tag | Value |
|-----|-------|
| `<title>` | `Hire A Human \| Verified Skill-Based Hiring Platform` |
| `<meta name="description">` | `Hire A Human is a skill-based hiring platform that helps companies hire verified engineers without relying on resumes.` |
| `<h1>` (SSR fallback in body) | `Hire A Human – Skill-Based Hiring Without Resumes` |
| `<link rel="canonical">` | `https://hire-a-human.app/` |
| `og:title` | `Hire A Human – Skill-Based Hiring Platform` |
| `og:description` | `Hire verified engineers based on real skills, not resumes.` |
| `og:url` | `https://hire-a-human.app/` |
| `og:type` | `website` |
| `twitter:title` | `Hire A Human – Skill-Based Hiring Platform` |

### Phase 2 — Indexing Infrastructure
- **`public/sitemap.xml`** — Includes all public pages with `lastmod` dates and priority scores:
  - Homepage (priority 1.0)
  - `/join` (candidate), `/verify` (recruiter), `/browse`, `/hire-humans` (all 0.8–0.9)
  - `/blog/introducing-hire-a-human` (priority **0.9** — brand accelerator post)
  - All 5 blog posts
  - `/vs/rentahuman`, `/docs`
- **`public/robots.txt`** — Allows all public pages, explicitly `Disallow`s `/dashboard`, `/recruiter-dashboard`, `/admin`, `/profile`
  - **AI Search Bots explicitly allowed**: `OAI-SearchBot`, `GPTBot`, `ChatGPT-User` (OpenAI), `Claude-SearchBot`, `ClaudeBot`, `Claude-User`, `anthropic-ai` (Anthropic), `PerplexityBot`, `Perplexity-User` (Perplexity), `bingbot` (Microsoft Copilot), `DuckDuckBot`

### Phase 3 — Brand Keyword Density
- Homepage `<h1>` set to exact brand match: `Hire A Human – Skill-Based Hiring Without Resumes`
- Keywords meta includes: `Hire A Human`, `HireAHuman`, `hire a human platform`, `skill-based hiring`
- **Brand intro blog post** at `/blog/introducing-hire-a-human`:
  - Title: `Introducing Hire A Human – A Skill-Based Hiring Platform`
  - Contains **8+ natural mentions** of "Hire A Human" and "HireAHuman"
  - Covers: what the platform is, who it's for, features roadmap
  - Route `/introducing-hire-a-human` redirects → `/blog/introducing-hire-a-human`

### Phase 4 — Structured Data (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Hire A Human",
  "alternateName": "HireAHuman",
  "url": "https://hire-a-human.app/",
  "logo": "https://hire-a-human.app/logo.png",
  "description": "Hire A Human is a skill-based hiring platform..."
}
```
Plus `FAQPage` schema with 2 Q&As targeting brand search queries.

### Phase 5 — Technical Health Checklist
| Check | Status |
|-------|--------|
| No `noindex` tag | ✅ `robots: index, follow` |
| Canonical tag | ✅ Set to `https://hire-a-human.app/` |
| HTTPS | ✅ Deployed via Vercel |
| Mobile responsive | ✅ Tailwind responsive classes throughout |
| Sitemap submitted | ⬜ Submit via Google Search Console |
| DNS verification | ⬜ Verify domain in GSC |

### Phase 6 — External Authority (Manual Actions Required)
- [ ] Post on LinkedIn with link to `https://hire-a-human.app/`
- [ ] Publish Medium article linking back
- [ ] Submit to Product Hunt
- [ ] Add link in GitHub repo README
- [ ] Post on IndieHackers with launch post
- [ ] Add logo image at `https://hire-a-human.app/logo.png`

> ⚠️ **SPA Indexing Note**: This is a Vite React SPA. Google may take 7–21 days to fully index all pages even after all fixes. The `index.html` SSR-fallback content (header, nav, main sections) provides crawlable content for bots before JS executes.

## Key Components
- `Layout.tsx` — Navbar + Footer wrapper with system status pills
- `UiComponents.tsx` — `LiveMetrics` (real counts from InsForge), `EngineerCard` (skills, exp level, location, BlueTech badge, GitHub/resume links, employment status)

## InsForge SDK Usage Pattern
```tsx
import { insforge } from '../lib/insforge';

// Auth (email/password — used for company signup)
const { data } = await insforge.auth.signUp({ email, password, name });
const { data } = await insforge.auth.signInWithPassword({ email, password });
const { data } = await insforge.auth.verifyEmail({ email, otp: code });
await insforge.auth.resendVerificationEmail({ email });

// Auth (OAuth — used for both engineers and companies)
await insforge.auth.signInWithOAuth({ provider: 'google', redirectTo: '...' });
const { data: { user } } = await insforge.auth.getCurrentUser();
await insforge.auth.signOut();

// Database
const { data } = await insforge.database.from('profiles').select('*').eq('id', userId).maybeSingle();
await insforge.database.from('profiles').insert({ ... });
await insforge.database.from('profiles').update({ ... }).eq('id', userId);
const { count } = await insforge.database.from('profiles').select('*', { count: 'exact', head: true });

// Storage
const { data } = await insforge.storage.from('avatars').uploadAuto(file);
```

## Features Implemented
- [x] Engineer profile with skills, experience, GitHub, LinkedIn
- [x] **Comprehensive Skill Selection System (3 sources):**
  - Curated local database: 250+ skills across 15 categories (Languages, Frontend, Backend, Databases, DevOps, Cloud, AI/ML, Mobile, Web3, Testing, Security, Data Engineering, Game Dev, Embedded/IoT, Design/Product)
  - Live Stack Exchange API search: discovers any tech tag from StackOverflow (free, no auth) with real question counts
  - Custom skill input: user can add any skill not in our database or API
- [x] **Profile edit limit** (2 per 30 days, stored in `profile_edit_count` + `last_profile_edit`, 30-day rolling reset)
- [x] **Auto-generated resume** from profile data (name, role, bio, skills, experience, links) with print/PDF support
- [x] No manual resume upload — resume is always auto-generated from structured profile data
- [x] Employment status toggle (AVAILABLE / HIRED)
- [x] BlueTech badge display (subscription UI placeholder)
- [x] Talent directory with dynamic skill filters (extracted from profiles), search, location, experience, availability
- [x] Profile completeness percentage
- [x] Experience history (JSONB)
- [x] **Profile page redirects to Dashboard** if profile already filled (use `/profile?edit=true` to edit)
- [x] Company verification with **real auth** (email/password signup + email verification code)
- [x] Admin approval panel with search, filter tabs, and professional table
- [x] Company pages use **professional corporate design** (white/blue, not terminal/cyber)
- [x] Real-time stats on landing page
- [x] Avatar upload with photo preview
- [x] **Projects section** — candidates can add projects with title, description, tech stack, and URL
- [x] **Job target toggle** — candidates specify if they're looking for internship or full-time positions
- [x] **Monthly profile views** — dashboard shows how many times the candidate's profile was viewed by recruiters/agents this month (from `profile_views` table)

## Pending
- [ ] Stripe/Razorpay integration for BlueTech subscriptions and verification deposits
- [ ] MCP server tools for AI-assisted candidate search
- [ ] Individual profile detail page (/engineer/:handle)
- [ ] Interview scheduling
- [ ] Notifications system
