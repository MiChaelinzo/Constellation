# Constellations — Scope

## Project description

**Constellations** is a personal reflection journal that turns each daily entry into a glowing star in your own night sky. Over weeks and months, the sky fills out and your year takes shape as a private constellation. The same entries also power a calendar view and an "Insights" page (streaks, dominant moods, recurring tags).

The goal is to make a journaling app that you actually want to open — quiet, beautiful, and a little magical, instead of a list of dated bullet points.

## Why this idea

I picked Constellations for the hackathon because it has a clear, opinionated product surface that is small enough to ship in one sitting but rich enough to be worth showing off. It exercises everything the spec-driven process is meant to test:

- A non-trivial data model (entries, moods, tags).
- Multiple distinct views over the same data (sky, calendar, list, insights).
- Aggregate / "wow" endpoints (streaks, mood distribution, monthly histogram) that benefit from being planned up front instead of bolted on.

## In scope

- Create, read, update, delete reflection entries.
- Each entry has: free-form content, a mood (5 levels), optional tags, and an entry date.
- "Sky" home view — every entry rendered as a star with a deterministic position; entries are clickable.
- Calendar view — month grid, days light up where you journaled.
- List / journal view — chronological list with filters by mood, tag, date range, and free-text search.
- Insights view — total entries, current streak, longest streak, mood distribution, top tags, entries per month, dominant mood.
- Entry detail view with edit and delete.
- Persistence in a real PostgreSQL database (no localStorage-only).
- A polished, animated frontend.

## Explicitly out of scope (for the hackathon build)

- Authentication / multi-user accounts. The app is single-user / local-feeling for now.
- Sharing, export, or import of entries.
- Reminders, notifications, or scheduled jobs.
- AI-generated summaries, sentiment analysis, or recommendations.
- Mobile app (only the web app).
- Internationalization (English only).
- Rich text / image attachments inside entries (plain text only).
- Tag management UI (tags are created inline by typing; no rename/merge/delete-tag screen).

## Success criteria

- All in-scope CRUD flows work end-to-end against a real database.
- The four main views (sky, calendar, journal, insights) all render real data.
- Streaks and mood/tag aggregates are computed correctly from stored entries.
- The app is deployable as-is (no manual setup beyond provisioning the database).
- The `docs/` folder contains scope, PRD, technical spec, and build checklist that match what was actually shipped.
