# HireAHuman.ai — Backend Architecture

## Infrastructure
- **InsForge** — BaaS with PostgreSQL, Auth, Storage, Edge Functions
- **URL**: Set via `VITE_INSFORGE_URL` environment variable
- **Auth**: Google OAuth + Email Magic Link

## Database Tables

### `profiles`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK, matches auth user ID |
| handle | text | — | Unique, NOT NULL |
| display_name | text | — | NOT NULL |
| bio | text | — | nullable |
| role_title | text | — | Current job title |
| location | text | — | City/region |
| skills | text[] | '{}' | Up to 10 skills |
| years_of_experience | integer | 0 | |
| github_url | text | — | |
| linkedin_url | text | — | |
| resume_url | text | — | <del>Removed</del> (Auto-generated) |
| avatar_url | text | — | From storage bucket |
| employment_status | text | 'AVAILABLE' | AVAILABLE or HIRED |
| hired_company_id | uuid | — | FK to companies if hired |
| bluetech_badge | boolean | false | Premium subscription |
| profile_edit_count | integer | 0 | Rolling 30-day counter (Max 2) |
| last_profile_edit | timestamptz | — | |
| preferred_location | text | — | Remote/City preference |
| experience_history | jsonb | '[]' | Array of {company, role, from, to} |
| price_per_15min | numeric | 5.00 | Legacy field |
| is_online | boolean | false | Legacy field |
| created_at | timestamptz | now() | |

**RLS**: Enabled. Public read, owner insert/update, admin full access.
**Indexes**: PK on `id`, UNIQUE on `handle`.

### `companies`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to auth user |
| name | text | Company name |
| email | text | Work email |
| website | text | Company URL |
| linkedin | text | LinkedIn company page |
| business_id | text | CIN/GST/EIN |
| status | text | pending / verified / rejected |
| description | text | |
| tech_stack | text[] | |
| created_at | timestamptz | |

**RLS**: Enabled. Public read (all companies visible for admin panel).

## Storage Buckets
| Bucket | Public | Purpose |
|--------|--------|---------|
| avatars | Yes | Profile photos |
| resumes | Yes | PDF resumes (max 5MB) |

## Authentication Flow
1. User clicks "Initialize Profile" or "Verify Company"
2. Google OAuth or email magic link via InsForge Auth
3. On success → redirect to /profile (engineers) or /verify (recruiters)

## Key Business Rules
- **Resume Lock**: Max 2 resume uploads per rolling 30 days (tracked via `resume_update_count` + `last_resume_update`)
- **Employment State Lock**: Profile shows AVAILABLE or HIRED — no double-booking
- **Recruiter Verification**: Level 3 — work domain + LinkedIn + business ID + ₹1000 deposit (₹900 refundable)
- **BlueTech Badge**: ₹800/month premium subscription for priority ranking

## MCP Server (AI-Native Integration)

Located in `/mcp_server`, this production-grade Python server (FastMCP) exposes structured candidate data to AI agents.

**Tools:**
1. `search_candidates`: Multi-filter search (skills, location, experience, availability).
2. `get_candidate_profile`: Full detailed structured profile.
3. `search_by_skills`: Advanced skill matching with required/preferred scoring.
4. `get_candidate_resume`: Auto-generated structured resume data (JSON).
5. `list_available_candidates`: Browse talent pool.
6. `check_candidate_availability`: Pre-outreach check.
7. `get_platform_stats`: Ecosystem metrics.

**Running:**
```bash
cd mcp_server
# stdio mode (for Claude Desktop/Cursor)
python server.py
# http mode (for remote agents)
python server.py --transport http
```

## Pending Backend Work
- [ ] Edge function for profile edit enforcement (server-side backup to client logic)
- [ ] Stripe/Razorpay webhook for payment verification
- [x] **MCP server for AI-assisted candidate search (Completed)**
- [ ] Employment state lock enforcement via trigger
- [ ] Foreign key from `hired_company_id` to `companies.id`
