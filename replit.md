# Constellations

A personal reflection journal where every entry becomes a star in your private night sky. Built for a hackathon.

## Stack

- React + Vite + Tailwind v4 + shadcn/ui at `/` (artifact: `constellations`)
- Express API at `/api` (artifact: `api-server`)
- PostgreSQL via Drizzle ORM
- OpenAPI-first contract → Orval codegen for Zod schemas + TanStack Query hooks
- wouter for routing, framer-motion for animations, recharts for insights

## Pages

- `/` — Sky home: every entry rendered as a twinkling, mood-colored star at a deterministic position
- `/new` — Compose a new entry (content, mood picker, tags, optional date)
- `/journal` — Filterable, searchable list of entries; supports `?from=&to=` deep links
- `/entries/:id` — Detail view with edit-in-place and delete confirmation
- `/calendar` — Month grid with glowing days and mood dots
- `/insights` — Stats, mood donut chart, top tags, monthly bars

## Data model

Single `entries` table:

- `id` uuid PK
- `content` text
- `mood` varchar — one of `radiant | calm | neutral | cloudy | stormy`
- `tags` text[]
- `entry_date` date (returned as `YYYY-MM-DD` string)
- `created_at`, `updated_at` timestamptz

## Star positioning

Star `(x, y, brightness)` is computed server-side from the entry id with FNV-1a in `artifacts/api-server/src/lib/stars.ts`. Positions are stable across reloads and never stored.

## API surface (`lib/api-spec/openapi.yaml`)

- `GET /api/healthz`
- `GET /api/entries` (mood, tag, from, to, search, limit, offset)
- `POST /api/entries`
- `GET /api/entries/recent?limit=`
- `GET /api/entries/calendar?year=&month=`
- `GET /api/entries/:id`
- `PATCH /api/entries/:id`
- `DELETE /api/entries/:id`
- `GET /api/sky?limit=`
- `GET /api/insights`

Order matters: more specific `/entries/recent` and `/entries/calendar` are registered before `/entries/:id`.

## Important: Zod response parsing was removed

The OpenAPI Zod schemas use `z.coerce.date()` for `format: date` fields, which converts strings into `Date` objects, which then JSON-serialize back to ISO timestamps and break the YYYY-MM-DD contract. Routes therefore parse only **inputs** with Zod and write **outputs** directly with `res.json(...)` after normalizing date columns via `asDateOnly()` / `normalizeEntry()`.

## Hackathon docs

See `docs/`:

- `scope.md`, `prd.md`, `technical-spec.md`, `build-checklist.md`

## Local dev

Workflows are auto-managed:

- `artifacts/api-server: API Server`
- `artifacts/constellations: web`

After schema changes: `pnpm --filter @workspace/db run db:push`.
After OpenAPI changes: `pnpm --filter @workspace/api-spec run codegen`.
