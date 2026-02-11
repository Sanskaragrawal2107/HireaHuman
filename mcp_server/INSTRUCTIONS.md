
# DateAHuman MCP Server

This is the **Model Context Protocol (MCP)** server for DateAHuman.
It allows AI agents (like Claude, AutoGPT, etc.) to "book" humans by interacting with our database.

## How It Works

1.  **Agents Connect**: Agents connect to this server (via Stdio or SSE).
2.  **Tool Call**: An agent calls `rent_human(topic="venting", duration=15)`.
3.  **Database Insert**: The server inserts a new session into the `sessions` table with `status="pending_escrow"`.
4.  **Escrow**: In a real production environment, this would trigger a Smart Contract or Stripe hold.
5.  **Human Notification**: The human (Heart) sees the request on their dashboard.

## Why 'supabase' library?

We use the `supabase` Python client because **InsForge is built on top of Supabase**.
InsForge provides the infrastructure, but the underlying database protocol is Postgres+Supabase.
Using the official `supabase` library is the most reliable, secure, and performant way to interact with your InsForge backend from Python.

## Deployment

You can deploy this server to any container platform (Railway, Fly.io, AWS).

1.  **Build**: `docker build -t date-a-human-mcp .`
2.  **Run**: `docker run -p 8000:8000 --env-file .env date-a-human-mcp`

## Real Data & Live Updates

-   The **Frontend** (`Landing.tsx`) now connects to InsForge Realtime.
-   When `is_online` status changes in the `profiles` table, the "Hearts Online" counter updates instantly for all visitors.
