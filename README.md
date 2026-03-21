# LLM Benchmark Dashboard

Starter pack for a web app that fetches and displays current LLM benchmark leaderboards, computes an explainable overall top 3, and exports the dashboard as PDF or PNG.

## Included
- Next.js 15 + TypeScript scaffold
- Tailwind styling
- Prisma schema for SQLite MVP
- Typed benchmark adapter layer
- Normalization and overall ranking logic
- Refresh API route
- Export API routes for PDF and PNG
- Mock-data mode for local development
- Codex task file

## v1 benchmark set
- Artificial Analysis Intelligence Index
- LM Arena Text
- SWE-bench Verified
- Aider Polyglot
- LiveBench
- Hugging Face Open LLM

## Ranking policy
The app does **not** directly average raw scores from different leaderboards. It normalizes each benchmark independently to a 0-100 scale, then computes an overall weighted score for approved benchmarks only.

Default overall weights:
- Artificial Analysis: 30%
- LM Arena Text: 25%
- LiveBench: 20%
- SWE-bench Verified: 15%
- Aider Polyglot: 10%
- Hugging Face Open LLM: excluded from default overall ranking

## Project structure
```text
app/
components/
lib/
  adapters/
  scoring/
prisma/
scripts/
```

## Setup
```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run export:install
npm run db:seed
npm run dev
```

## Environment
```env
DATABASE_URL="file:./dev.db"
APP_URL="http://localhost:3000"
EXPORT_OUTPUT_DIR="./exports"
USE_MOCK_DATA="true"
```

## Routes
- `GET /api/benchmarks` — current dashboard data
- `POST /api/refresh` — refresh all benchmarks
- `GET /api/export/pdf` — export PDF
- `GET /api/export/png` — export PNG
- `GET /export/report` — export render view

## Current state of adapters
This starter pack ships with mock-backed adapters by default. Live parsing should be implemented per source as the next step.

Recommended live adapter approach:
1. Check for an official JSON/API/data endpoint.
2. If none exists, parse structured HTML conservatively.
3. Log parse drift and preserve last-known-good data.
4. Keep benchmark-specific adapter tests.

## Notes for Codex / ChatGPT
- Use `codex-task.md` as the implementation brief.
- Keep parser logic isolated in `lib/adapters/*`.
- Preserve benchmark metadata so incompatible cohorts are not silently mixed.
- Keep export generation on a dedicated route and render path.

## Known limitations in this starter pack
- Mock data is enabled by default.
- No authentication.
- No scheduler.
- No adapter tests yet.
- No retry/backoff policy yet.
- No OpenAI or other vendor API integration is required for v1.

## Recommended next implementation pass
1. Replace mock fetches with live source parsers.
2. Add per-adapter tests and snapshot fixtures.
3. Add stale-data and partial-refresh UI states.
4. Add deployment config for Vercel or Docker.
5. Add export branding and print CSS refinements.
