# Constellations — Build Checklist

Tracks what was actually built, in order. Items are checked off as they ship.

## 0. Planning artifacts

- [x] Scope (`docs/scope.md`)
- [x] PRD with user stories + acceptance criteria (`docs/prd.md`)
- [x] Technical spec (`docs/technical-spec.md`)
- [x] This checklist (`docs/build-checklist.md`)

## 1. Workspace setup

- [x] React + Vite frontend artifact at `/`
- [x] Express API artifact at `/api` (provided by template)
- [x] PostgreSQL database provisioned

## 2. Contract

- [x] OpenAPI 3.1 spec written in `lib/api-spec/openapi.yaml`
  - [x] `GET /healthz`
  - [x] `GET /entries` (filters: mood, tag, from, to, search, limit, offset)
  - [x] `POST /entries`
  - [x] `GET /entries/{id}`
  - [x] `PATCH /entries/{id}`
  - [x] `DELETE /entries/{id}`
  - [x] `GET /sky`
  - [x] `GET /entries/calendar`
  - [x] `GET /entries/recent`
  - [x] `GET /insights`
- [x] Codegen run (`pnpm --filter @workspace/api-spec run codegen`)
  - [x] React Query hooks emitted to `lib/api-client-react/src/generated/`
  - [x] Zod schemas emitted to `lib/api-zod/src/generated/`

## 3. Database

- [x] `entries` table defined in `lib/db/src/schema/entries.ts`
- [x] Schema exported from `lib/db/src/schema/index.ts`
- [x] `pnpm --filter @workspace/db run push` against the dev database
- [x] Seed a small set of example entries so the app isn't empty on first load

## 4. Backend routes (Express)

- [x] `entries` router with full CRUD and Zod validation
- [x] `GET /sky` — deterministic star positions from entry id
- [x] `GET /entries/calendar?year=&month=`
- [x] `GET /entries/recent?limit=`
- [x] `GET /insights` — totals, streaks, mood + tag aggregates, per-month bars
- [x] Central error handler (Zod → 400, others → 500)

## 5. Frontend (delegated to design subagent)

- [x] App shell with routing under `BASE_URL`
- [x] Sky home view (`/`) — stars rendered from `/sky`
- [x] New entry page (`/new`)
- [x] Entry detail page (`/entries/:id`) with edit + delete
- [x] Journal list page (`/journal`) with mood / tag / date / search filters
- [x] Calendar page (`/calendar`) with month navigation
- [x] Insights page (`/insights`) with charts and aggregates
- [x] Empty states for every view
- [x] Toast feedback for create / update / delete
- [x] Responsive on laptop + phone widths

## 6. Polish + handoff

- [x] Workflow restarts cleanly
- [x] App opens at `/` with no console errors
- [x] Suggest deploy
