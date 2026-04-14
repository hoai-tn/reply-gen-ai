# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Prettier format all TS/TSX files
npm run typecheck    # Type-check without emitting
```

No test runner is configured yet.

## Architecture

This is a Next.js 16 SaaS application where businesses can create AI-powered forms. When a client submits a form, the system retrieves relevant context from uploaded documents (RAG) and sends an AI-generated response via email.

**Tech stack:**

- Next.js 16 (App Router, Turbopack)
- Supabase (auth + PostgreSQL + vector embeddings)
- shadcn/ui + Tailwind CSS 4 for UI
- React Hook Form + Zod for validation
- Stripe (wired in env, not yet implemented)

## Key Patterns

**Supabase clients — two separate modules:**

- `lib/supabase.ts` — browser client (singleton via Proxy, use in client components)
- `lib/supabase-server.ts` — server/middleware client (use in server components and `proxy.ts`)

Auth logic lives in `services/supabase/auth.ts`. Import through `services/supabase/index.ts`.

**Route protection:** `proxy.ts` (Next.js middleware) redirects authenticated users away from `/auth/*` routes. Protected routes (e.g., `/dashboard`) should be added there.

**Form components:** Custom wrappers live in `components/ui/` — use `Field` + `InputGroup` for form fields with labels, helpers, and character counters.

**Theming:** `ThemeProvider` wraps the app in `app/layout.tsx`. Toggle dark mode with the `d` key (dev convenience).

## Data Model (planned)

| Table | Key fields |
|-------|-----------|
| `businesses` | `id`, `owner_id`, `name`, `slug`, `status`,  |
| `forms` | `id`, `business_id`, `name`, `schema` (JSON field config) |
| `documents` | `id`, `business_id`, `form_id`, `name` |
| `document_chunks` | `content`, `embedding`, `business_id`, `document_id` |
| `submissions` | `id`, `form_id`, `answers` (JSON), `ai_response`, `email` |

Retrieval is scoped by `business_id` (and optionally filtered by `document_id`).

## Code Style

Prettier config (enforced via `npm run format`):

- No semicolons
- Double quotes
- 2-space indent
- Trailing commas (ES5)
- Tailwind class sorting via `prettier-plugin-tailwindcss`

Path alias `@/` maps to repo root.

## Environment Variables

Required in `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
OPENAI_API_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is defined in `configs/server.config.ts` but not yet required — add it when admin-level DB access is needed.
