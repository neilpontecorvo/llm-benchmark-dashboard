Build and maintain a production-quality web app named "LLM Benchmark Dashboard".

## Current state

The core dashboard is functional with 12 benchmark adapters, a working refresh pipeline, per-adapter live/mock rollout, and UI hardening complete. The app boots, refreshes, and renders real data.

### What is built
- Next.js 15 + TypeScript + Tailwind + Prisma + SQLite
- 12 benchmark adapters (10 live-capable, 1 seed, 1 retired)
- Selective live/mock rollout via per-adapter env flags
- `dataSource` tracking through adapter → DB → UI
- Dashboard with live/mock badges, category pills, weight indicators, score bars
- Refresh pipeline with per-adapter error handling (success/partial/failed)
- Stale data warnings, partial failure banners, loading states
- PDF and PNG export routes via Playwright
- Overall weighted top 3 with 0-100 normalization

## Benchmarks (12 total)

| # | Benchmark | Category | Source | Data Mode | Weight |
|---|---|---|---|---|---|
| 1 | Artificial Analysis Intelligence Index | General | artificialanalysis.ai | Live (needs API key) / Seed | 20% |
| 2 | LM Arena Text | Community Preference | LMArena catalog JSON | Live | 15% |
| 3 | SWE-bench Verified | Coding | GitHub JSON | Live | 13% |
| 4 | LiveBench | General | HF parquet (`livebench/model_judgment`) | Live (HF) / Seed | 13% |
| 5 | GPQA Diamond | Reasoning | AA API v2 | Live (needs API key) / Seed | 13% |
| 6 | Humanity's Last Exam | General | AA API v2 → Scale Labs | Live (API primary) / Seed | 13% |
| 7 | Aider Polyglot | Coding | GitHub YAML | Live | 7% |
| 8 | MMMLU | Multilingual | AA API v2 (`evaluations.mmlu_pro`) | Live (needs API key) / Seed | 6% |
| 9 | Arena Text to Image | Text to Image | LMArena catalog JSON | Live | 0% (visual, excluded) |
| 10 | Arena Text to Video | Text to Video | AA API v2 media | Live (needs API key) / Seed | 0% (visual, excluded) |
| 11 | Arena Image to Video | Image to Video | AA API v2 media | Live (needs API key) / Seed | 0% (visual, excluded) |
| 12 | HF Open LLM | Open-Only | HF datasets-server API | Live (retired) | 0% (excluded) |

## Remaining work — priority order

### Phase 6 — Export hardening
- [ ] Verify PDF/PNG layout with 12 benchmark tables (expanded from 6)
- [ ] Add print CSS refinements for export page
- [ ] Add export filename with timestamp convention
- [ ] Test export with mixed row counts (10 rows vs 5 rows for Vellum)

### Phase 7 — Testing
- [ ] Add fixture-based test for each of the 12 adapters
- [ ] Add normalization unit tests
- [ ] Add overall ranking unit tests
- [ ] Add refresh route integration test
- [ ] Add export route smoke test

### Phase 8 — Deployment
- [ ] Add production database target
- [ ] Add environment validation on startup
- [ ] Add Vercel deployment config or Docker option
- [ ] Add scheduled refresh support (cron or external trigger)

### Ongoing improvements
- [x] ~~Add retry/backoff policy for live fetch failures~~ (done — `lib/fetch-with-retry.ts`)
- [x] ~~Explore LiveBench live data source~~ (done — HF parquet)
- [ ] Add historical score tracking and trend visualization
- [ ] Add model comparison view

## Rules
- Do not average raw scores across benchmarks
- Use per-benchmark normalization to 0-100
- Use weighted overall scoring (weights sum to 1.0)
- Add adapter-level error handling; one failure must not crash the pipeline
- Use full model names with versions (e.g., "Claude Opus 4.6 Thinking", "GPT-5.4 High")
- Preserve seed/mock fallbacks until live paths are confirmed stable
- Use strict TypeScript throughout
- Do not fabricate data to fill source limitations (e.g., Vellum's top-5 limit)
- Do not silently change benchmark weights or inclusion policy

## Key files

```
lib/adapters/          — 12 adapter files + _base.ts + index.ts
lib/types.ts           — BenchmarkKey (12), BenchmarkCategory (10), BenchmarkResult, DataSource
lib/weights.ts         — names, weights, categories, labels
lib/refresh.ts         — runRefresh() + getDashboardData()
lib/scoring/           — normalize.ts, overall-rank.ts
lib/mock-data.ts       — mock data generator with versioned model names
components/            — dashboard-header, benchmark-card, benchmark-table, overall-top3
prisma/schema.prisma   — BenchmarkResult (with dataSource), BenchmarkSnapshot, OverallResult, RefreshRun
.env.example           — all env vars including 12 USE_LIVE_* flags
docs/                  — ADAPTER_SPEC, CODEX_PROMPT, CHECKLIST, IMPLEMENTATION_SEQUENCE, AUDIT
```

## Environment

```env
USE_MOCK_DATA="false"              # Set to "true" for pure mock mode
USE_LIVE_SWE_BENCH="true"         # Live adapters
USE_LIVE_AIDER="true"
USE_LIVE_HF_OPEN_LLM="true"
USE_LIVE_ARENA_TEXT="true"         # Seed adapters (real data, no live API)
USE_LIVE_ARENA_TEXT_TO_IMAGE="true"
USE_LIVE_ARENA_TEXT_TO_VIDEO="true"
USE_LIVE_ARENA_IMAGE_TO_VIDEO="true"
USE_LIVE_GPQA_DIAMOND="true"
USE_LIVE_HUMANITYS_LAST_EXAM="true"
USE_LIVE_MMMLU="true"
USE_LIVE_LIVEBENCH="true"
USE_LIVE_ARTIFICIAL_ANALYSIS="true"   # AA API v2 with x-api-key
```
