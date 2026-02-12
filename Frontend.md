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
| `/profile` | ProfilePage | Engineer profile form: handle, name, bio, location, role, skills (max 15, 3-source selection), years of exp, GitHub, LinkedIn, resume upload (2/month limit), experience history, employment status |
| `/dashboard` | DashboardPage | Candidate dashboard: profile completeness %, avatar upload, employment status toggle, resume status, BlueTech badge, experience timeline |
| `/verify` | VerifyCompanyPage | Company verification: login/signup with email+password (real InsForge auth with email verification), company form with work email domain validation (blocks 40+ public domains), domain-website matching, business ID, security deposit. Clean corporate design. |
| `/recruiter-dashboard` | RecruiterDashboard | Company dashboard: professional corporate design, verification status banners, company profile editor with save, talent pool stats, quick links sidebar |
| `/admin` | AdminPage | Admin panel: professional table view, search/filter by status, approve/reject actions, company stats overview |
| `/docs` | DocsPage | Documentation |

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

## Pending
- [ ] Stripe/Razorpay integration for BlueTech subscriptions and verification deposits
- [ ] MCP server tools for AI-assisted candidate search
- [ ] Individual profile detail page (/engineer/:handle)
- [ ] Interview scheduling
- [ ] Notifications system
