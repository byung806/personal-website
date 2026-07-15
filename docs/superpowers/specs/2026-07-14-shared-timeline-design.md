# Shared Timeline — Design

## What this is

A clone of the Couple Joy timeline UI (screenshot-matched: date-badge feed, photo memory
cards, milestone rows, bottom tab bar), self-hosted at `/memories` inside the existing
`personal-website` Next.js app, with no entry limit and posts from both Bryan and Adela.

## Why it's built inside `personal-website` rather than a new app

The repo already runs a deployed Next.js 14 App Router site on Vercel with its own Postgres
database (via Prisma) powering a guestbook and a "planets" feature (`app/api/guestbook`,
`prisma/schema.prisma`). Reusing that infrastructure means no new service to provision, no
Firebase billing card, and one deploy pipeline instead of two.

## Architecture

- New route: `app/memories/` (page + client feed component), following the same structure
  and conventions as the existing `app/p/guestbook` / `app/api/guestbook` routes.
- New API routes: `app/api/memories/`, using the existing `lib/prisma` client.
- Photos: uploaded to Vercel Blob (`@vercel/blob`, new dependency), only the returned URL is
  stored in Postgres — no image bytes in the DB.
- No Firebase anywhere in this build. The original spec's Firebase (Firestore + Storage) plan
  is superseded by reusing the existing Postgres/Prisma stack.
- Realtime: no live push (no Firestore `onSnapshot`, no websockets/SSE). The feed refetches on
  mount and on window focus/visibility change. Sufficient for two people posting occasionally;
  simpler than maintaining a persistent connection on Vercel serverless functions.
- Auth: none for v1. No shared passcode gate. Anyone with the direct URL can view and post.
  Mitigated by discoverability controls below, not by access control.
- Discoverability: `/memories` gets a `noindex` meta tag and is not linked from the site's nav
  or header. It's reachable only by direct URL.

## Data model

Prisma models added to the existing `prisma/schema.prisma`, alongside `GuestbookEntry` and
`Planet`:

```prisma
enum MemoryType {
  photo
  milestone
}

enum Author {
  bryan
  adela
}

model Memory {
  id        String     @id @default(cuid())
  author    Author
  type      MemoryType
  title     String
  body      String?    @db.Text
  date      DateTime
  emoji     String?
  createdAt DateTime   @default(now()) @map("created_at")
  photos    Photo[]
  comments  Comment[]

  @@map("memories")
}

model Photo {
  id       String @id @default(cuid())
  memoryId String @map("memory_id")
  memory   Memory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  url      String
  order    Int    @default(0)

  @@map("photos")
}

model Comment {
  id        String   @id @default(cuid())
  memoryId  String   @map("memory_id")
  memory    Memory   @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  author    Author
  body      String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  @@map("comments")
}
```

Notes:
- `location` (from the original spec) is dropped for v1 — the map view was called out as
  optional/stubbable and nothing else depends on it. Can be added later without breaking
  existing rows (nullable field, additive migration).
- Comment and photo counts shown on card badges are computed via Prisma `_count` at query
  time, not stored, so they can't drift out of sync with the actual rows.
- "days ago" on milestone rows is computed client-side from `date` to "now" at render time —
  not stored, since it changes daily.

## Components

`app/memories/`:
- `page.tsx` — server component; sets `noindex` metadata; renders the client shell.
- `memories-view.tsx` — client component; owns feed state; refetches on mount + window focus.
- `components/timeline-header.tsx` — pin icon (stub, no map view in v1), "Timeline" title,
  "+" button.
- `components/bottom-tab-bar.tsx` — 5 icons; heart rendered active/filled; other 4 are no-ops.
- `components/date-badge.tsx` — shared left-column month/day/year badge used by both entry
  types.
- `components/photo-card.tsx` — photo entry: image, comment/photo-count pill badges, title
  with trailing emoji, description.
- `components/milestone-row.tsx` — slim entry: emoji + label, right-aligned computed
  "days ago".
- `components/add-memory-sheet.tsx` — bottom sheet/modal: photo/milestone toggle, date picker,
  title + emoji picker, description (photo type only), photo upload (multi, drag/drop or tap),
  identity picker (Bryan / Adela — no persistence, one tap per submission), save button.
- `components/comment-thread.tsx` — expand a photo card to view/add comments.

`app/api/memories/`:
- `GET /api/memories` — list all memories, newest first, with photos and comment counts
  included.
- `POST /api/memories` — create a memory (photo or milestone type), validated similarly to
  `app/api/guestbook/route.ts` (required fields, length limits).
- `POST /api/memories/upload` — accepts a photo file, uploads to Vercel Blob, returns the URL.
- `GET /api/memories/[id]/comments` — list comments for a memory.
- `POST /api/memories/[id]/comments` — add a comment (author + body).

## Styling

Tailwind tokens added to `tailwind.config.ts` alongside the existing theme (not hardcoded hex
values inline), matching the reference screenshot exactly:

| Token | Hex | Use |
|---|---|---|
| `bg` | `#FFFFFF` | Page background |
| `text-primary` | `#1C1C1E` | Titles, day numbers, nav icons |
| `text-secondary` | `#8E8E93` | Month/year labels, description text, inactive icons |
| `accent-blue` | `#2F80ED` | "days ago" numerals, links |
| `milestone-bg` | `#F2F6FB` | Milestone row background |
| `overlay-badge` | `rgba(0,0,0,0.55)` | Comment/photo count pill background on photos |

Type scale: day number 28px/700, month/year 12px/500 (letter-spacing 0.02em), card title
15px/600, card description 14px/400 (line-height 1.4), milestone label 15px/600, "days ago"
numeral 18px bold blue / label 11px gray. System font stack
(`-apple-system, BlinkMacSystemFont, "Inter", sans-serif`).

Layout: mobile-first, max-width 480px centered on desktop; fixed header (~56px); scrollable
feed body; fixed bottom tab bar (~50px + safe-area padding). Full spacing/radius spec as in
the original screenshot description (24px date-badge gap, 16px photo corner radius, 12px
milestone row radius, etc.) — matched pixel-for-pixel during the static UI build phase.

## Build phases

1. Prisma schema migration for `Memory`/`Photo`/`Comment`; `GET`/`POST /api/memories` wired to
   the real DB.
2. Static UI pass — header, bottom tab bar, date badge, photo card, milestone row — built
   against 3–4 seeded rows, pixel-matched to the screenshot.
3. Add-memory sheet: type toggle, form fields, photo upload to Vercel Blob, identity picker,
   save → refetch.
4. Comment thread on photo cards, wired to `/api/memories/[id]/comments`.
5. Delete seed data; confirm `noindex` + no nav link; empty state
   ("Nothing here yet — add the first one.").
6. Polish: spacing/type fidelity check against the screenshot, mobile safe-area handling.

## Explicitly out of scope for v1

- Firebase (superseded by Postgres/Vercel Blob reuse).
- Passcode/auth gate.
- Live realtime push (Firestore `onSnapshot` / websockets / SSE) — refetch-on-focus only.
- Map view of memory locations — icon is a stub, no lat/lng.
- Persisting the "last identity picked" as a default.

## Revision — dark "Our Journal" reference (2026-07-14)

The original light-mode "Timeline" screenshot was replaced by two dark-mode reference
screenshots ("Our Journal" feed + an entry-detail screen). The build was reworked to match
them exactly. Changes from the sections above:

- **Dark mode only.** The `timeline` Tailwind tokens are now a fixed dark palette
  (bg `#000000`, surface `#161618`, surface-2 `#1F1F22`, bubble `#2A2A2D`, text `#F2F2F2`,
  secondary `#8E8E93`). The page is always dark regardless of the site's theme.
- **No bottom tab bar.** Removed entirely per the reference and the "just the memories"
  instruction. `bottom-tab-bar.tsx` deleted.
- **Header title is "Our Journal"** with circular map-stub and "+" buttons.
- **No paywall banner.** The reference's "Unlimited journal / PRO / BUY NOW" upgrade card is
  intentionally dropped — this self-hosted, unlimited version is what replaces it.
- **Entry detail screen** at `/memories/[id]` (new): full-bleed hero photo, back + "⋯"
  buttons, title, `date • location` meta, body, "Created by <avatar> <name>", a tilted
  horizontally-scrolling photo gallery, and two-sided chat comments (Bryan right / Adela left)
  with a bottom comment composer (identity toggle + send). Backed by a new `GET
  /api/memories/[id]` route. Clicking a photo card in the feed navigates here; the old
  click-to-open comment sheet (`comment-thread.tsx`) is deleted and superseded by this screen.
- **`location` field added** to `Memory` (nullable `String`), surfaced in the detail meta line
  and the add-memory form (photo type). This supersedes the earlier "no `location` field" note.
- Comment avatars and the "Created by" avatar are initial-in-a-circle placeholders (B/A), since
  there is no per-user avatar storage.
