# Orbitory — The Universe of Business

Product management intelligence platform. Orbitory organizes startups, established businesses, failed companies, and acquired companies into an explorable universe so product managers can decode decisions, study metrics, and learn from real business stories.

**Working brand:** `Orbitory` (Orbit + Story) — treat as a working name until domain, trademark, and existing-product availability are checked.

**Tagline:** Explore Businesses. Decode Decisions. Think Like a PM.

---

## What it is

A functional, extensible web application — not a landing page or static mockup. It provides:

- **Universe** (`/`) — an interactive cosmic map of businesses organized as galaxies (industries), solar systems (niches/markets), and planets (companies), with pan/zoom, search, filters, and a conventional directory alternative.
- **Explore** (`/explore`) — a searchable, filterable company directory.
- **Company dossiers** (`/companies/[slug]`) — structured, tabbed company stories: overview, origin story/timeline, products, business model, strategy, decisions, failures, metrics, and sources.
- **PM Metrics Lab** (`/metrics`) — a metric library with definitions and formulas, plus a working calculator for conversion rate, retention rate, churn rate, CAC, and MRR.
- **Compare** (`/compare`) — side-by-side company comparison.
- **Reports** (`/reports`) — downloadable, source-cited PDF company intelligence and PM metrics reports.
- **Playbook / Saved Research / Research workspace** — stubbed pages for lessons, collections, and research editing (full editing workflow specified for a later phase).

## Core product principle

Company story → Market and customer problem → Product strategy → Business model → Execution → Results → Failures and trade-offs → PM metrics → Lessons.

Data quality is a core requirement: every factual claim carries an evidence status (Verified / Reported / Estimated / Interpretation / Illustrative / Unknown) and links to its source. No metrics are fabricated; missing data is communicated honestly.

---

## Technology stack

- Next.js 15 (App Router), React 19, TypeScript (strict)
- PostgreSQL 17 + Prisma ORM (migrations committed)
- Tailwind CSS + Radix UI primitives
- `pdfkit` for server-side PDF generation
- `recharts` available for charts (currently used minimally)
- Vitest for unit tests
- `tsx` runtime; `bcryptjs` for auth

## Repository structure

```
orbitory/
  prisma/
    schema.prisma     Data model (companies, industries, niches, metrics,
                      sources, claims, decisions, collections, reports, users)
    migrations/       Applied SQL migrations
    seed.ts           Curated seed dataset (idempotent)
  src/
    app/              Next.js App Router pages + API route handlers
    components/ui.tsx Radix-based design-system primitives
    lib/
      env.ts          Zod-validated environment config
      prisma.ts       Prisma client singleton
      utils.ts        cn() helper
      errors.ts       AppError helpers
      schemas.ts      Zod request schemas
      metrics.ts      Pure metric formula engine (tested)
      pdf.ts          PDF report generation
    server/           auth, session, http, authorization
  tests/
    metrics.test.ts   Unit tests for metric formulas
  scripts/
    db.mjs            Embedded PostgreSQL lifecycle (dev only)
  server.ts           Custom Next.js + HTTP server
```

## Seed dataset

Ten curated companies across industries and outcomes, honestly labeled:

Zerodha, Groww, Stripe, Shopify, Airbnb, Netflix, Slack, Nokia, WeWork, Quibi.

Zerodha is the deeply researched example (products, timeline, strategic decisions, evidence-labeled claims, illustrative metrics clearly marked). Others are partial dossiers — an honest, well-structured partial record is preferred over a fabricated comprehensive one.

Demo account: `pm@orbitory.demo` / `DemoPass123!` (seeded; all seeded accounts share this password in dev).

---

## Getting started

### Prerequisites

- Node.js 22+ and npm
- No Docker required: the repo includes an embedded PostgreSQL helper for local development (`scripts/db.mjs`).

### Local quick start (Windows PowerShell)

```powershell
npm install
Copy-Item .env.example .env
# .env already points at the embedded PostgreSQL on 127.0.0.1:5432

npm run db:setup     # starts embedded PostgreSQL, applies migrations, seeds data
npm run dev
```

Open <http://localhost:3000>. The embedded cluster lives in `.pgdata/`. Stop the database with `npm run db:stop`.

### With an existing PostgreSQL

```bash
cp .env.example .env
# edit DATABASE_URL
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (`tsx server.ts`) |
| `npm run build` | `prisma generate` + production Next build |
| `npm start` | Production server (`NODE_ENV=production`) |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint (skipped during builds) |
| `npm test` | Vitest unit tests |
| `npm run db:start / db:stop / db:status` | Embedded PostgreSQL lifecycle |
| `npm run db:setup` | Start DB, migrate, seed |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Idempotent seed data |
| `npm run db:studio` | Prisma Studio |

### Environment variables

Copy `.env.example` to `.env` and adjust. `DATABASE_URL` is required. `APP_URL` defaults to `http://localhost:3000`. Never commit `.env`.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `APP_URL` | Public origin for cookies and links |
| `NODE_ENV` | development \| production |
| `SESSION_TTL_DAYS` | Session lifetime (default 30) |

## Database

Migrations are committed under `prisma/migrations/`. Apply with `npm run db:migrate`. The schema is in `prisma/schema.prisma`. Seed data is in `prisma/seed.ts` and is idempotent (clears and recreates research data on each run).

## Tests

Unit tests cover the metric formula engine (`src/lib/metrics.ts`):

```bash
npm test
```

## PDF reports

Reports are generated server-side with `pdfkit` (`src/lib/pdf.ts`) and stored in `storage/reports/`. Download via `/api/reports/download/[[...filename]]`. Report contents reflect the selected company, metrics, sources, and reporting periods from the database — not hardcoded templates.

## Definition of done (MVP status)

- [x] Application starts with documented commands
- [x] Home page presents a universe experience (galaxies, niches, companies)
- [x] Planets link to real company records
- [x] Searchable, filterable company directory (`/explore`)
- [x] Company dossiers with structured information and source links
- [x] Distinguishes documented facts / analysis / estimates / missing data
- [x] PM metric definitions and a working calculator
- [x] Company comparisons use actual stored records
- [x] PDF reports generated and downloaded from database data
- [x] Graceful missing-data handling
- [x] No fabricated metrics or research claims
- [x] Core calculations have automated tests
- [x] Database persistence (PostgreSQL + Prisma)
- [x] Responsive interface (desktop + mobile)
- [x] Production build succeeds
- [x] README documents setup, data limitations, seed data, env vars, status

## Known limitations

- Research-editing workflow (company creation, source attachment, evidence labeling, import/export) is specified but stubbed — the MVP ships with the curated seed dataset and read-only dossier views.
- PM Playbook, Saved Research collections, and full authentication-scoped private collections are stubbed pages; sign-up/sign-in exist but private data scoping is minimal.
- Charts in dossiers/reports are not yet rendered (metrics are shown as labeled values; `recharts` is available for a later phase).
- PDF generation uses `pdfkit`; `iconv-lite` font-subsetting warnings appear in the build but do not affect text output.
- ESLint is skipped during production builds (`ignoreDuringBuilds: true`) due to pre-existing `no-explicit-any` patterns in API routes; typecheck (`tsc --noEmit`) passes clean.
- Company coverage is limited to the 10 curated seed companies; the data model supports expansion.

## Recommended next steps

1. Implement the research-editing workspace (company creation/editing, source attachment, evidence labeling).
2. Add chart rendering to metric dashboards and PDF reports.
3. Flesh out PM Playbook, Saved Research, and authenticated private collections.
4. Expand the seed dataset beyond the 10 companies with source-grounded research.
5. Add data ingestion (validated JSON/CSV import) for scaling coverage.

## License

UNLICENSED — internal build specification. Check domain, trademark, and existing-product availability before adopting the "Orbitory" name.
