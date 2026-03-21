# Codex Readiness Checklist

Use this checklist to verify project state before handing implementation to Codex.

## Repository readiness
- [x] `README.md` is current and matches actual project structure.
- [x] `.env.example` includes every required environment variable (12 adapter flags + API keys).
- [x] `package.json` scripts are valid and minimal (dev, build, test, test:watch, test:coverage).
- [x] Prisma schema matches the data model (includes `dataSource` column).
- [x] Mock mode runs without any external credentials.
- [x] Export routes have a clear dedicated render page with full feature parity.
- [x] Centralized theme system in `app/theme.css` controls all visual styling.

## Product clarity
- [x] Benchmark list is explicitly defined (12 benchmarks).
- [x] Overall ranking policy is documented (weighted 0-100 normalization).
- [x] Excluded benchmarks are tagged and explained (HF Open LLM = 0%).
- [x] Failure handling is defined for partial refreshes.
- [x] Stale data behavior is defined (24-hour threshold).
- [x] Benchmark descriptions are defined for all 12 benchmarks.

## Adapter rules
- [x] One adapter per benchmark source (12 adapter files).
- [x] Every adapter returns the same normalized shape (`BenchmarkResult`).
- [x] Every adapter preserves source URL and fetch timestamp.
- [x] Every adapter can fail without crashing the refresh pipeline.
- [x] `dataSource` field tracks live vs mock through DB to UI.
- [x] 7 adapters are live-capable with seed fallbacks.
- [ ] Last-known-good data policy is documented (not yet implemented).

## Implementation phases completed
- [x] Phase 0: Baseline verification — app boots, refresh works, export stubs exist.
- [x] Phase 1: Data contracts — types, normalization, weights locked.
- [x] Phase 2: Live adapters — 7 live-capable (AA, Arena Text, Arena T2I, GPQA, HLE, SWE-bench, Aider, HF), 3 seed, 1 retired.
- [x] Phase 3: Refresh pipeline — per-adapter error handling, partial success.
- [x] Phase 4: Scoring and ranking — normalization to 0-100, weighted overall top 3.
- [x] Phase 5: UI hardening — badges, score bars, heat gradients, strength tags, descriptions, theme system.
- [x] Phase 6: Export completion — PDF/PNG routes, print CSS, full feature parity with dashboard.
- [x] Phase 7: Testing — 173 tests across 5 suites, all passing.
- [ ] Phase 8: Deployment — no production config yet.

## Acceptance checks
- [x] `npm install` succeeds.
- [x] `npm run db:generate` succeeds.
- [x] `npm run db:push` succeeds.
- [x] `npm run dev` starts cleanly with env validation on startup.
- [x] `POST /api/refresh` returns success (12/12 adapters passing).
- [x] Dashboard renders with live and seed data.
- [x] `npx tsc --noEmit` passes with zero errors.
- [x] `npm run build` completes successfully.
- [x] `npm test` runs 173 tests — all passing.
- [x] PDF and PNG export routes return files (Playwright dependency).
- [x] Adapter contract tests pass (139 tests for all 12 adapters).

## Remaining work for Codex
- [ ] Add retry/backoff wrapper for live fetch failures.
- [ ] Add request timeout per adapter.
- [ ] Add last-known-good data fallback.
- [ ] Add health check endpoint (`/api/health`).
- [ ] Add deployment config (Vercel or Docker).
- [ ] Add scheduled refresh support (cron endpoint).
- [ ] Explore LiveBench live data source (official repo/HF script pipeline).
