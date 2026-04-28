# Constellations — Technical Specification

## High-level architecture

A small contract-first monorepo:

```
artifacts/
  constellations/   React + Vite + Tailwind frontend (served at "/")
  api-server/       Express 5 API (served at "/api")
lib/
  api-spec/         OpenAPI 3.1 spec — single source of truth
  api-client-react/ Generated React Query hooks + fetch client
  api-zod/          Generated Zod schemas (used by the server for I/O validation)
  db/               Drizzle ORM schema + Postgres connection
docs/               Hackathon planning artifacts (this folder)
```

The OpenAPI spec is the single source of truth. From it we generate:

- React Query hooks consumed by the frontend.
- Zod schemas consumed by the Express server to validate request bodies, query params, and response shapes.

This means the frontend and backend cannot drift on contract — if a route changes, both halves regenerate from the same file.

## Stack

| Layer        | Choice                                                     | Reason                                                                                 |
| ------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Frontend     | React 18 + Vite + TypeScript + Tailwind + shadcn/ui        | Fast iteration, strong ecosystem, ships static.                                         |
| Routing      | wouter                                                     | Tiny, hooks-based, plays well with the artifact's `BASE_URL`.                          |
| Data fetching| TanStack React Query                                       | Declarative caching, generated hooks via Orval.                                        |
| Animation    | framer-motion                                              | Needed for star twinkles, page transitions, calendar reveals.                          |
| Charts       | recharts                                                   | Used on the Insights page for mood distribution and per-month bars.                    |
| Backend      | Express 5 + pino-http                                      | Already wired in the workspace template.                                               |
| Validation   | Zod (generated from OpenAPI)                               | One contract, no manual zod definitions to keep in sync.                               |
| ORM          | Drizzle                                                    | Lightweight, type-safe, plays well with `drizzle-zod`.                                 |
| DB           | PostgreSQL (Replit-managed)                                | Built-in, no external services needed.                                                  |

## Data model

One table is enough — the app is a single-user reflection log.

```ts
entries (
  id          uuid primary key default gen_random_uuid(),
  content     text       not null,
  mood        varchar(16) not null,            -- radiant | calm | neutral | cloudy | stormy
  tags        text[]     not null default '{}',
  entry_date  date       not null,             -- the day this entry belongs to
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- indexes
create index entries_entry_date_idx  on entries(entry_date);
create index entries_created_at_idx  on entries(created_at);
create index entries_mood_idx        on entries(mood);
```

Notes:

- `entry_date` is separate from `created_at` so users can backdate without losing the actual creation timestamp.
- `tags` is a Postgres `text[]`. We unnest in SQL when computing top tags.
- `mood` is a constrained enum at the API/Zod level, but stored as `varchar` so the schema is easy to evolve without a Postgres enum migration.

## API surface

All routes are mounted under `/api`. Defined in `lib/api-spec/openapi.yaml`; full schema lives there.

### Core CRUD
- `GET    /api/entries` — list with filters (`mood`, `tag`, `from`, `to`, `search`, `limit`, `offset`)
- `POST   /api/entries` — create
- `GET    /api/entries/{id}` — fetch one
- `PATCH  /api/entries/{id}` — update
- `DELETE /api/entries/{id}` — delete

### "Wow" endpoints
- `GET /api/sky` — every entry as a star with deterministic `(x, y)` and `brightness`.
- `GET /api/entries/calendar?year=&month=` — entries grouped by day for a month.
- `GET /api/entries/recent?limit=` — latest N entries (used on the home strip).
- `GET /api/insights` — `totalEntries`, `currentStreak`, `longestStreak`, `daysJournaled`, `moodCounts`, `topTags`, `perMonth`, `dominantMood`.

### Health
- `GET /api/healthz`

### Validation strategy

- Request bodies are parsed against the generated Zod schemas (`createEntryBody`, `updateEntryBody`).
- Query params are parsed against generated Zod schemas (Orval emits e.g. `listEntriesQueryParams`).
- Responses are parsed through Zod before send to guarantee shape contracts.
- A central error handler converts `ZodError` to `400` with a clean `ErrorResponse`.

## Star positioning algorithm

Stars must be **stable** across reloads (US-9 / AC-3). The server derives `(x, y, brightness)` deterministically from the entry id:

```
hash = fnv1a(entry.id)
x = ((hash >>> 0) & 0xffff) / 0xffff           // 0..1
y = ((hash >>> 16) & 0xffff) / 0xffff          // 0..1
brightness = 0.55 + ((hash >>> 8) & 0x7f) / 255  // ~0.55..1.0
```

This avoids storing positions in the DB. Mood is sent alongside so the frontend can color the star.

## Streak computation

Computed in a single SQL pass using a CTE:

1. `SELECT DISTINCT entry_date FROM entries ORDER BY entry_date`.
2. Walk the dates in JS to compute longest run and the run ending at today/yesterday.

This is fine at hackathon scale (thousands of entries, not millions) and avoids a heavier `LAG`/window approach.

## Frontend structure

```
src/
  App.tsx                    # router + providers
  main.tsx
  pages/
    SkyPage.tsx              # "/"
    JournalPage.tsx          # "/journal"
    NewEntryPage.tsx         # "/new"
    EntryDetailPage.tsx      # "/entries/:id"
    CalendarPage.tsx         # "/calendar"
    InsightsPage.tsx         # "/insights"
    not-found.tsx
  components/
    Star.tsx
    SkyCanvas.tsx
    EntryCard.tsx
    EntryEditor.tsx
    MoodPicker.tsx
    TagInput.tsx
    NavBar.tsx
    EmptyState.tsx
    ui/                      # shadcn primitives (already scaffolded)
  lib/
    utils.ts
    mood.ts                  # mood -> color/icon mapping (single source)
    formatDate.ts
```

Routing uses `wouter` with `base={import.meta.env.BASE_URL.replace(/\/$/, "")}` (matches the artifact's preview path).

All API access goes through `@workspace/api-client-react`. No raw `fetch` in components.

## Error handling

- Server: central middleware catches `ZodError` (→ 400) and unknown errors (→ 500 with logged details). 404s come from explicit route checks.
- Client: React Query hooks expose `isError` / `error`. Toasts (sonner) for create/update/delete failures.

## Testing strategy (for the hackathon scope)

Manual end-to-end sweep — for each user story above, run through the flow once on a fresh database and confirm the acceptance criteria. Automated tests are out of scope.

## Deployment

Replit static + node deployment. Frontend builds to a static bundle; API server runs the Node process. Database is the Replit-managed Postgres. No additional secrets required.
