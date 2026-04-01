# HireAHuman.ai

## The Day AI Started Hiring Humans

HireAHuman is a live, AI-native hiring product where proof of work beats resume claims.

[Live Product](https://hire-a-human.app/) | [Product Hunt](https://www.producthunt.com/products/hireahuman-ai?utm_source=other&utm_medium=social) | [Launch Video](https://youtu.be/KCaputXvK5Y) | [GitHub](https://github.com/Sanskaragrawal2107/HireaHuman)

---

## Demo Snapshot

![HireAHuman Hero](./public/readme/hero.png)

You used to apply for jobs. Now jobs find you.

---

## Showcase

### Talent Discovery In Minutes

![Talent Discovery](./public/readme/discovery.png)

- Recruiters describe the role
- AI filters by real technical fit
- Hiring teams review high-signal candidates first

### Verification Over Vibes

![Talent Verification](./public/readme/verification.png)

- Resume claims are secondary
- Commit history and technical depth are primary
- Human decision remains final

---

## Product Story

Hiring for technical roles is noisy:

- Too many low-signal resumes
- Too little proof of real building ability
- Too much manual screening overhead

HireAHuman changes the sequence:

1. Engineer profile becomes structured technical data
2. Recruiter access is verification-gated
3. AI performs first-pass matching and retrieval
4. Humans make the final hiring call

---

## What Makes This Product Different

- Verification-first recruiter onboarding
- Candidate hiring-state lock to reduce double-booking risk
- Skill and project-based profile graph instead of keyword resume matching
- MCP tool interface for AI-native talent retrieval workflows

---

## Who It Is Built For

### Engineers

- Build once, stay discoverable
- Focus on output, not resume cosmetics

### Hiring Teams

- Replace manual filtering with structured AI-assisted discovery
- Shortlist based on technical signal quality

---

## Launch Links

- Website: https://hire-a-human.app/
- Product Hunt: https://www.producthunt.com/products/hireahuman-ai?utm_source=other&utm_medium=social
- Demo Video: https://youtu.be/KCaputXvK5Y

---

## Build Overview

- Frontend: React + TypeScript + Vite
- Backend platform: InsForge (auth, database, storage)
- AI integration: Python FastMCP server for structured candidate tools

For implementation details:

- [Frontend.md](Frontend.md)
- [Backend.md](Backend.md)
- [AUTH_SETUP.md](AUTH_SETUP.md)
- [mcp_server/INSTRUCTIONS.md](mcp_server/INSTRUCTIONS.md)

---

## Minimal Run Instructions

```bash
npm install
npm run dev
```

Environment variables are listed in [env.example](env.example).

---

## Release

- Launch tag: v1.0.0-launch
- Release notes: [RELEASE_NOTES_v1.0.0-launch.md](RELEASE_NOTES_v1.0.0-launch.md)
