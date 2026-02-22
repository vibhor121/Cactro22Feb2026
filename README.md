# Release Checklist

A full-stack web app for tracking software releases through a predefined 9-step checklist. Status (`planned` / `ongoing` / `done`) is computed automatically from step completion.

**Live demo:** _add your Vercel URL here after deployment_

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend + API | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Neon PostgreSQL (serverless HTTP driver) |
| Deployment | Vercel + Neon (both free tier) |

---

## Features

- Create releases with name, target date, and optional notes
- Track 9 predefined release steps with checkboxes
- Status badge auto-updates: **Planned** → **Ongoing** → **Done**
- Optimistic UI — checkboxes update instantly, revert on failure
- Editable additional notes per release
- Delete releases (with confirmation)
- Responsive two-panel layout (sidebar + detail), mobile-friendly

---

## Database Schema

```sql
-- releases table
CREATE TABLE releases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    release_date    TIMESTAMPTZ NOT NULL,
    additional_info TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- step_states table (one row per release per step; step_index 0-8)
CREATE TABLE step_states (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id  UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    step_index  SMALLINT NOT NULL CHECK (step_index >= 0 AND step_index <= 8),
    is_done     BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (release_id, step_index)
);

CREATE INDEX idx_step_states_release_id ON step_states (release_id);
```

> Status is **never stored** — always computed from step counts.

---

## The 9 Release Steps

| # | Step |
|---|---|
| 1 | Create release branch from main |
| 2 | Update version number and CHANGELOG |
| 3 | Run full test suite and fix all failures |
| 4 | Complete code review and get merge approval |
| 5 | Build and verify release artifacts |
| 6 | Deploy to staging environment |
| 7 | Run smoke tests on staging |
| 8 | Get sign-off from QA and stakeholders |
| 9 | Deploy to production and monitor |

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/releases` | List all releases with computed status |
| `POST` | `/api/releases` | Create release + seed 9 step rows |
| `GET` | `/api/releases/:id` | Full release with all step states |
| `PATCH` | `/api/releases/:id` | Update name, date, or notes |
| `DELETE` | `/api/releases/:id` | Delete release (cascades steps) |
| `PATCH` | `/api/releases/:id/steps` | Toggle step states |
| `GET` | `/api/steps` | Return predefined step definitions |

### Create Release
```bash
curl -X POST http://localhost:3000/api/releases \
  -H 'Content-Type: application/json' \
  -d '{"name":"v2.4.0","release_date":"2026-03-01T00:00:00Z"}'
```

### Toggle Steps
```bash
curl -X PATCH http://localhost:3000/api/releases/<id>/steps \
  -H 'Content-Type: application/json' \
  -d '{"updates":[{"step_index":0,"is_done":true}]}'
```

### Update Notes
```bash
curl -X PATCH http://localhost:3000/api/releases/<id> \
  -H 'Content-Type: application/json' \
  -d '{"additional_info":"Hotfix included"}'
```

---

## Local Development

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) account (free) — or any PostgreSQL instance

### Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd <repo>
   npm install
   ```

2. **Set up the database**

   Option A — Neon (recommended):
   - Sign up at [neon.tech](https://neon.tech) (free, no credit card)
   - Create a new project
   - Open the SQL editor and run `drizzle/migrations/0001_init.sql`
   - Copy the connection string

   Option B — local PostgreSQL:
   ```bash
   psql -U postgres -c "CREATE DATABASE release_checklist;"
   psql -U postgres -d release_checklist -f drizzle/migrations/0001_init.sql
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and paste your DATABASE_URL
   ```

4. **Run development server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Docker (optional)

```bash
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
docker-compose up --build
# Open http://localhost:3000
```

---

## Deployment

### Neon (database — free tier)
1. Create account at [neon.tech](https://neon.tech)
2. Create project → run `drizzle/migrations/0001_init.sql` in SQL editor
3. Copy the connection string

### Vercel (app — free tier)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variable: `DATABASE_URL` = your Neon connection string
4. Deploy — Vercel auto-detects Next.js

Every push to `main` triggers an automatic re-deploy.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Entry point -> <HomePage>
│   ├── globals.css
│   └── api/
│       ├── releases/
│       │   ├── route.ts         # GET (list), POST (create)
│       │   └── [id]/
│       │       ├── route.ts     # GET, PATCH, DELETE
│       │       └── steps/
│       │           └── route.ts # PATCH (toggle steps)
│       └── steps/
│           └── route.ts         # GET predefined steps
├── components/
│   ├── HomePage.tsx             # Top-level client, owns all state
│   ├── ReleaseList.tsx
│   ├── ReleaseListItem.tsx
│   ├── ReleaseDetail.tsx
│   ├── StepChecklist.tsx        # Optimistic toggle logic
│   ├── StepItem.tsx
│   ├── AdditionalInfoEditor.tsx
│   ├── CreateReleaseModal.tsx
│   ├── DeleteReleaseButton.tsx
│   ├── StatusBadge.tsx
│   └── ui/                      # Button, Input, Modal, Spinner
└── lib/
    ├── db.ts               # Neon SQL client (server-only)
    ├── steps.ts            # PREDEFINED_STEPS constant
    ├── types.ts            # Shared TypeScript interfaces
    ├── computeStatus.ts    # Pure fn: counts -> status
    └── cn.ts               # CSS class utility
drizzle/migrations/
└── 0001_init.sql           # Database schema
```
