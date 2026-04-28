# Constellations

A personal reflection journal where every entry becomes a star in your private night sky. Open the app and you step outside on a clear night — quiet, dark, intimate. Months of journaling fill the sky in. Your year takes shape as a constellation.

Built as a hackathon submission.

---

## What it does

- Write a short daily reflection, tag it, and pick a mood (`radiant`, `calm`, `neutral`, `cloudy`, `stormy`).
- Every entry becomes a twinkling, mood-colored star at a stable position in your sky.
- Hover any star to peek at the entry; click to open and edit it.
- Browse a chronological journal with filters and free-text search.
- See a month-grid calendar that lights up the days you wrote.
- Read insights: total entries, current streak, longest streak, mood distribution, top tags, monthly activity.

## Pages

| Path             | What lives there                                           |
| ---------------- | ---------------------------------------------------------- |
| `/`              | Sky home — the star field of every entry                   |
| `/new`           | Compose a new reflection                                   |
| `/journal`       | Filterable, searchable list of entries                     |
| `/entries/:id`   | Detail view with edit-in-place and delete                  |
| `/calendar`      | Month grid with mood dots                                  |
| `/insights`      | Streaks, mood donut, top tags, monthly bars                |

## Tech

- **Frontend:** React + Vite + TypeScript, Tailwind v4, shadcn/ui, wouter, framer-motion, recharts, date-fns
- **Backend:** Node + Express, served at `/api`
- **Database:** PostgreSQL via Drizzle ORM
- **Contract-first:** OpenAPI spec → Orval codegen → Zod schemas + TanStack Query hooks shared between server and client
- **Monorepo:** pnpm workspaces

## Repository layout

```
artifacts/
  constellations/   # the React + Vite frontend (mounted at /)
  api-server/       # the Express API (mounted at /api)
  mockup-sandbox/   # design sandbox, not part of the product
lib/
  api-spec/         # OpenAPI source of truth (openapi.yaml)
  api-zod/          # generated Zod schemas
  api-client-react/ # generated TanStack Query hooks
  db/               # Drizzle schema, client, migrations
docs/
  scope.md          # hackathon scope
  prd.md            # product requirements
  technical-spec.md # architecture and contracts
  build-checklist.md
```

## Data model

A single `entries` table:

| column       | type           | notes                                       |
| ------------ | -------------- | ------------------------------------------- |
| `id`         | uuid           | primary key                                 |
| `content`    | text           | the reflection                              |
| `mood`       | varchar(16)    | one of the five moods                       |
| `tags`       | text[]         | freeform tags                               |
| `entry_date` | date           | YYYY-MM-DD; the date the entry is *for*     |
| `created_at` | timestamptz    |                                             |
| `updated_at` | timestamptz    |                                             |

## API surface

All routes live under `/api`.

| Method | Path                            | Purpose                                                      |
| ------ | ------------------------------- | ------------------------------------------------------------ |
| GET    | `/healthz`                      | Health check                                                 |
| GET    | `/entries`                      | List with filters: `mood`, `tag`, `from`, `to`, `search`     |
| POST   | `/entries`                      | Create an entry                                              |
| GET    | `/entries/recent?limit=`        | Newest N entries (used by the ambient strip on the sky)      |
| GET    | `/entries/calendar?year=&month=`| Per-day mood summary for one month                           |
| GET    | `/entries/:id`                  | Read one entry                                               |
| PATCH  | `/entries/:id`                  | Update an entry                                              |
| DELETE | `/entries/:id`                  | Delete an entry                                              |
| GET    | `/sky?limit=`                   | All stars with deterministic positions                       |
| GET    | `/insights`                     | Aggregates: streaks, mood counts, top tags, per-month counts |

The more specific `/entries/recent` and `/entries/calendar` are registered before `/entries/:id` so they don't collide.

## How a star gets its place

Star positions are **never stored**. They are computed deterministically from the entry id with FNV-1a in `artifacts/api-server/src/lib/stars.ts`. The same id always lands at the same `(x, y)` and `brightness`, so the sky is stable across reloads but feels random.

## Local development

This project runs as managed workflows in the Replit workspace:

- `artifacts/api-server: API Server` serves `/api`
- `artifacts/constellations: web` serves `/`

There's no root `dev` script — the workflows wire up the right `PORT` and `BASE_PATH` per artifact.

After a schema change:

```bash
pnpm --filter @workspace/db run db:push
```

After an OpenAPI change:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Typecheck the whole repo:

```bash
pnpm run typecheck
```

## Deployment

The app is published through Replit Deployments and served over HTTPS on a `.replit.app` domain. The frontend hits the API through the shared proxy at `/api`, so nothing needs to know about ports or hosts in production.

## Design notes

- One scene, one feeling: a dark sky that still has *color*. Mood colors are warm yellow, teal, cool slate, soft gray, and a deep purple — distinct but never loud.
- The sky page is the showpiece. Stars twinkle on staggered timers, glow with their mood color, and sit on a quiet field of distant ambient dust for depth.
- Supporting screens (compose, detail, calendar, insights) are deliberately understated so the sky stays the hero.
- No emojis anywhere in the UI.

## Hackathon docs

The required write-ups live in `docs/`:

- `scope.md` — what's in and out of scope
- `prd.md` — product requirements
- `technical-spec.md` — architecture, contracts, and key decisions
- `build-checklist.md` — the build plan as a checklist

## License

Private hackathon project.
