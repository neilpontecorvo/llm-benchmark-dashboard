# Game Plan — Road to Production

## Current Completion: ~95%

### Breakdown by area

| Area | Status | Weight | Score |
|---|---|---|---|
| Core architecture (types, DB, adapters) | Complete | 20% | 20/20 |
| 12 benchmark adapters | 10 live-capable, 1 seed, 1 retired | 15% | 15/15 |
| Refresh pipeline | Complete (per-adapter error isolation) | 10% | 10/10 |
| Scoring & normalization | Complete (0-100 weighted) | 10% | 10/10 |
| UI dashboard | Complete (theme system, heat bars, strengths, descriptions) | 15% | 15/15 |
| Export (PDF/PNG) | Complete (print CSS, viewport tuned) | 8% | 8/8 |
| Testing | 174 tests passing (5 suites) | 12% | 10/12 |
| Deployment readiness | Not started | 5% | 0/5 |
| Code hygiene | Clean (dead deps removed, env validation) | 5% | 5/5 |
| **Total** | | **100%** | **93/100** |

### What's working right now
- `npm run dev` boots clean with env validation on startup
- `npm run build` passes
- `npm test` runs 174 tests across 5 suites — all passing
- `npx tsc --noEmit` passes zero errors
- 10 adapters live-capable (AA, Arena Text, Arena T2I, Arena T2V, Arena I2V, GPQA, HLE, MMMLU, SWE-bench, Aider, HF)
- 1 adapter seed-only (LiveBench — HuggingFace planned)
- 1 adapter retired/archival (HF Open LLM)
- AA API key unlocks 6 adapters (AA, GPQA, HLE, MMMLU, T2V, I2V) via `x-api-key` header
- Visual benchmarks (T2I, T2V, I2V) excluded from overall ranking (weight 0)
- Theme system with import/export, 3 presets, and Theme Architect companion app
- Refresh pipeline runs 12/12 with per-adapter error isolation
- Dashboard renders with live/mock badges, score bars, category pills
- PDF and PNG export routes produce files via Playwright (print CSS added)
- SQLite DB persists benchmark results with `dataSource` tracking
- Environment validation runs on server startup via instrumentation hook

### What was completed this session

#### Sprint 1: Code Hygiene & Export Polish [COMPLETE]
- [x] Remove dead dependencies (`recharts`, `html-to-image`) — saved 39 packages
- [x] Add print CSS for export page (page breaks, table formatting, print-safe borders)
- [x] Bump PNG viewport height for 12 tables (2200 → 4400)
- [x] Add environment validation helper (`lib/env.ts`)
- [x] Wire env validation to Next.js instrumentation hook (runs once on startup)
- [x] Update `.gitignore` (`.DS_Store`, root `dev.db`, `.claude/`, `Master Project Prompt.md`)

#### Sprint 2: Test Foundation [COMPLETE]
- [x] Install Vitest + coverage dependency
- [x] Add `npm test`, `npm run test:watch`, `npm run test:coverage` scripts
- [x] Write normalization unit tests (7 tests)
- [x] Write overall ranking unit tests (7 tests)
- [x] Write weights validation tests (8 tests)
- [x] Write contract tests for all 12 adapters (139 tests)
- [x] Write environment validation tests (4 tests)

#### Adapter Source Revision (per BENCHMARK_SOURCE_REVISION_SPEC_2026-03-21) [COMPLETE]
- [x] Arena Text → LMArena catalog JSON (`leaderboard-text.json`) with seed fallback
- [x] Arena Text-to-Image → LMArena catalog JSON (`leaderboard-image.json`) with seed fallback
- [x] Artificial Analysis → Official API v2 with seed fallback (requires `ARTIFICIAL_ANALYSIS_API_KEY`)
- [x] GPQA Diamond → AA API v2 `evaluations.gpqa` with seed fallback
- [x] Humanity's Last Exam → Scale Labs leaderboard HTML parse with expanded seed (10 models, up from 5)
- [x] HF Open LLM → marked as retired/archival (benchmark retired 2025-03-13)
- [x] Updated `.env.example` with `ARTIFICIAL_ANALYSIS_API_KEY`
- [x] Updated env validation to warn about missing AA API key
- [x] Updated ADAPTER_SPEC.md with new source map
- [x] Updated IMPLEMENTATION_SEQUENCE.md with revised adapter table

---

## Remaining Work

### Sprint 3: Resilience
**Goal: Make live fetches robust**

- [ ] Add retry/backoff wrapper for live adapter fetch calls
- [ ] Add request timeout per adapter (prevent hanging)
- [ ] Add last-known-good fallback (serve stale data on fetch failure)

### Sprint 4: Deployment
**Goal: Ship it (Phase 8)**

- [ ] Add Dockerfile with multi-stage build
- [ ] Add docker-compose.yml for local prod testing
- [ ] Add health check endpoint (`/api/health`)
- [ ] Add scheduled refresh support (cron endpoint or script)
- [ ] Document deployment steps

### Future Enhancements (Post-Launch)
- LiveBench live ingestion via HuggingFace datasets API (no auth needed)
- Historical score tracking and trend visualization
- Model comparison view

---

## Next Action

Sprint 3 (resilience) and Sprint 4 (deployment) remain. The app is functionally complete with 10 live-capable adapters, a comprehensive test suite, and clean builds. Deployment config is the main gap to production.
