<div align="center">

# HireAHuman.ai

### The Day AI Started Hiring Humans

**HireAHuman is a live, AI-native hiring platform where proof of work beats resume claims.**

[![Live Product](https://img.shields.io/badge/🚀%20Live%20Product-hire--a--human.app-brightgreen?style=for-the-badge)](https://hire-a-human.app/)
[![Product Hunt](https://img.shields.io/badge/Product%20Hunt-Launch%20Page-orange?style=for-the-badge&logo=producthunt)](https://www.producthunt.com/products/hireahuman-ai?utm_source=other&utm_medium=social)
[![Launch Video](https://img.shields.io/badge/▶%20Demo-Watch%20on%20YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/KCaputXvK5Y)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Sanskaragrawal2107/HireaHuman)

![Version](https://img.shields.io/badge/version-v1.0.0--launch-blue?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20TypeScript%20%2B%20FastMCP-blueviolet?style=flat-square)
![Status](https://img.shields.io/badge/status-live-success?style=flat-square)

</div>

---

![HireAHuman Hero](./public/readme/hero.png)

> You used to apply for jobs. Now jobs find you.

---

## Why This Exists

Technical hiring is broken in a specific way:

- **Too many low-signal resumes** — keywords optimized for ATS, not for actual skill
- **Too little proof of real building ability** — claims without commits
- **Too much manual screening overhead** — recruiters reading PDFs instead of reviewing pull requests

HireAHuman changes the sequence. Engineers build a structured technical profile once. Recruiters discover them through AI-assisted, signal-first retrieval. Humans make the final call.

---

## How It Works

```
Engineer builds structured profile
         ↓
  Commits, projects, skills → structured technical data
         ↓
  Recruiter onboards with verified company identity
         ↓
  AI performs first-pass candidate matching & retrieval
         ↓
  Hiring team reviews high-signal shortlist
         ↓
     Human makes final hire decision
```

---

## Product Showcase

### 🔍 Talent Discovery in Minutes

![Talent Discovery](./public/readme/discovery.png)

- Recruiters describe the role in natural language
- AI filters by real technical fit — not keyword density
- Hiring teams review the highest-signal candidates first
- Candidate hiring-state lock prevents double-booking risk

### ✅ Verification Over Vibes

![Talent Verification](./public/readme/verification.png)

- Resume claims are secondary signals
- Commit history, project depth, and structured skill graph are primary
- Company identity is verification-gated before recruiter access
- Human decision remains final — always

---

## What Makes This Different

| Feature | Traditional Hiring | HireAHuman |
|---|---|---|
| Profile signal | PDF keywords | Structured skill + project graph |
| Recruiter access | Open to anyone | Verification-gated company identity |
| Candidate matching | Manual resume reading | AI-assisted first-pass retrieval |
| Double-booking risk | Unmanaged | Hiring-state lock per candidate |
| AI integration | Bolted on | Native — MCP tool interface |

---

## For Engineers

- Build your profile once — stay discoverable
- Add up to **15 skills** sourced from 250+ curated categories, StackOverflow live tags, or custom input
- Attach **projects** with title, description, tech stack, and URLs
- Auto-generated resume from your structured profile — no manual uploads
- Toggle **employment status** (Available / Hired) to control visibility
- Set **job target** — internship or full-time
- Track **monthly profile views** from recruiters and AI agents
- **BlueTech badge** for verified high-signal profiles

## For Hiring Teams

- Onboard with real **company verification** — email domain validation, business ID, work email checks
- Access a talent pool filtered by skills, location, experience level, and availability
- Replace manual screening with **structured AI-assisted discovery**
- Shortlist based on technical signal quality — not resume cosmetics
- Admin approval layer for company onboarding integrity

---

## MCP Server — AI-Native Talent Retrieval

HireAHuman ships a **Python FastMCP server** that exposes structured candidate tools to any AI agent or LLM workflow.

This means:
- Any AI assistant can query the talent pool using natural-language role descriptions
- Candidate data is returned as structured, tool-callable outputs
- Composable with LangChain, Claude, GPT, or any MCP-compatible agent

See [`mcp_server/INSTRUCTIONS.md`](mcp_server/INSTRUCTIONS.md) for setup.

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite (Rolldown-Vite v7) |
| Routing | React Router v6 |
| Styling | Tailwind CSS + clsx |
| Animations | Framer Motion |
| Icons | Lucide React |

### Backend & Infrastructure
| Layer | Technology |
|---|---|
| Auth | InsForge SDK — Google OAuth + Email Magic Link + Email/Password |
| Database | InsForge (Postgres-backed, JSONB for experience/projects) |
| Storage | InsForge Storage (avatars, assets) |
| AI Layer | Python FastMCP server — structured candidate tools |
| Deployment | Vercel (frontend), MCP server (separate service) |

---

## Project Structure

```
hire-a-human/
├── src/
│   ├── pages/          # LandingPage, BrowsePage, ProfilePage, DashboardPage,
│   │                   # VerifyCompanyPage, RecruiterDashboard, AdminPage, BlogPage
│   ├── components/     # Layout, UiComponents (LiveMetrics, EngineerCard)
│   └── lib/            # insforge.ts SDK client
├── mcp_server/         # Python FastMCP server for AI-native candidate tools
├── public/
│   ├── sitemap.xml     # All public routes with priority scores
│   ├── robots.txt      # AI bots explicitly allowed (GPTBot, ClaudeBot, PerplexityBot)
│   └── readme/         # Product screenshots
├── Frontend.md         # Full frontend architecture reference
├── Backend.md          # Backend and database schema reference
├── AUTH_SETUP.md       # Auth configuration guide
└── RELEASE_NOTES_v1.0.0-launch.md
```

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Sanskaragrawal2107/HireaHuman.git
cd HireaHuman

# Install dependencies
npm install

# Configure environment
cp env.example .env
# Fill in your InsForge credentials (see AUTH_SETUP.md)

# Start development server
npm run dev
```

Environment variables are documented in [`env.example`](env.example).

For the MCP server setup, see [`mcp_server/INSTRUCTIONS.md`](mcp_server/INSTRUCTIONS.md).

---

## Documentation

| Document | Contents |
|---|---|
| [`Frontend.md`](Frontend.md) | React architecture, routes, SEO, components, InsForge SDK patterns |
| [`Backend.md`](Backend.md) | Database schema, edge functions, storage config |
| [`AUTH_SETUP.md`](AUTH_SETUP.md) | Google OAuth, email verification, company auth flows |
| [`mcp_server/INSTRUCTIONS.md`](mcp_server/INSTRUCTIONS.md) | MCP server setup, tools reference, agent integration |
| [`RELEASE_NOTES_v1.0.0-launch.md`](RELEASE_NOTES_v1.0.0-launch.md) | v1.0.0 launch changelog |

---

## Roadmap

- [ ] Stripe / Razorpay — BlueTech subscriptions & verification deposits
- [ ] Individual engineer profile page (`/engineer/:handle`)
- [ ] Interview scheduling workflow
- [ ] Recruiter collaboration and team shortlists
- [ ] Notifications system
- [ ] Expanded MCP tool coverage for multi-step agent hiring workflows

---

## Release

**Current tag:** `v1.0.0-launch`  
See full changelog → [`RELEASE_NOTES_v1.0.0-launch.md`](RELEASE_NOTES_v1.0.0-launch.md)

---

<div align="center">

Built by [Sanskar Agrawal](https://github.com/Sanskaragrawal2107)

[hire-a-human.app](https://hire-a-human.app/) · [Product Hunt](https://www.producthunt.com/products/hireahuman-ai) · [Demo Video](https://youtu.be/KCaputXvK5Y)

</div>
