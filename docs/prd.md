# Constellations — Product Requirements

## Target user

A single person who wants a daily (or near-daily) reflection habit but bounces off traditional journaling apps because they feel like a chore. They want something that:

- Rewards consistency visually, not numerically.
- Feels personal, quiet, and a little crafted.
- Can be opened in 10 seconds and closed in 30.

## Personas

- **The reflective writer** — wants a quiet space to log a thought every evening.
- **The mood tracker** — cares less about the words, more about seeing patterns over time.
- **The pattern spotter** — comes back to the insights page to see "what was this month like?"

## User stories

### Capturing entries

- **US-1** As a user, I can write a new reflection in under 30 seconds, pick a mood, and save it. *(must)*
- **US-2** As a user, I can attach 0–N tags to an entry by typing them inline (comma or enter to commit). *(must)*
- **US-3** As a user, I can backdate an entry to a specific day if I forgot to log it. *(should)*
- **US-4** As a user, I can edit a previous entry's text, mood, tags, and date. *(must)*
- **US-5** As a user, I can delete an entry I no longer want, with a confirmation step. *(must)*

### Viewing the sky

- **US-6** As a user, I see every entry as a star in a night sky on the home view. *(must)*
- **US-7** As a user, I can hover/tap a star and see a short preview of that entry. *(must)*
- **US-8** As a user, I can click a star and jump to that entry's detail. *(must)*
- **US-9** Star positions are stable: the same entry appears in the same spot every visit. *(must)*
- **US-10** Star color/brightness reflects the entry's mood. *(should)*

### Browsing entries

- **US-11** As a user, I can browse a chronological list of all entries. *(must)*
- **US-12** As a user, I can filter the list by mood, by tag, and by date range. *(should)*
- **US-13** As a user, I can free-text search the content of my entries. *(should)*

### Calendar view

- **US-14** As a user, I can switch to a month calendar that shows which days I journaled. *(must)*
- **US-15** Each day in the calendar shows the dominant mood(s) of that day. *(should)*
- **US-16** I can navigate to the previous and next month. *(must)*
- **US-17** Clicking a day takes me to the entries for that day (filtered list). *(should)*

### Insights

- **US-18** As a user, I can see my total entries, current streak, and longest streak. *(must)*
- **US-19** As a user, I can see my mood distribution. *(must)*
- **US-20** As a user, I can see my top tags. *(must)*
- **US-21** As a user, I can see entries per month over time. *(should)*
- **US-22** As a user, I can see my "dominant mood" so far. *(should)*

## Acceptance criteria

### AC-1 — Create entry

- Given the new-entry view, when I submit non-empty content with a mood, then a star appears in the sky and the entry is in the list.
- Empty content is rejected with a visible message.
- The entry is persisted across full reloads.

### AC-2 — Edit / delete

- Editing an entry updates its data on every view (sky, list, calendar, insights) without a hard reload.
- Deleting an entry removes it from every view and lowers `totalEntries` and any affected streaks.

### AC-3 — Sky stability

- Reloading the home page produces the same star positions for the same entries.
- Adding a new entry only adds a star — existing star positions do not move.

### AC-4 — Streaks

- "Current streak" counts consecutive days ending today (or yesterday — today's missing entry doesn't immediately reset the streak) with at least one entry.
- "Longest streak" never decreases as entries are added.
- Both update immediately after an entry is created or deleted.

### AC-5 — Calendar

- For a given month, every day with at least one entry has a visible marker.
- The calendar correctly handles month boundaries when navigating prev/next.

### AC-6 — Filters

- Filtering by a mood returns only entries with that mood.
- Filtering by a tag returns only entries containing that tag.
- Free-text search is case-insensitive substring match over entry content.
- Filters compose (mood + tag + search can all be active at once).

### AC-7 — Insights correctness

- `totalEntries` equals the count of all entries.
- `daysJournaled` equals the number of distinct entry dates.
- `moodCounts` sums to `totalEntries`.
- `dominantMood` is the mood with the highest count, or null if there are no entries.
- `topTags` is sorted by count descending and excludes empty tags.

### AC-8 — Empty states

- Each view (sky, list, calendar, insights) renders a calm, on-brand empty state when there are no entries, with a clear CTA to write the first one.

## Non-functional requirements

- The app must be deployable from a clean checkout with only a database provisioned.
- No external API keys are required to run the app.
- The frontend must remain responsive on a typical laptop (1280 wide) and on a phone (~390 wide).
- All times displayed are in the user's local timezone.
