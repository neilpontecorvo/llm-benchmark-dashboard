# Implementation Sequence

This file documents the implementation phases, their current status, and remaining work.

## Phase 0 — Baseline verification [COMPLETE]
1. ~~Install dependencies.~~
2. ~~Generate Prisma client.~~
3. ~~Push SQLite schema.~~
4. ~~Seed mock data.~~
5. ~~Run the app locally.~~
6. ~~Confirm dashboard render, refresh route, and export route stubs.~~

## Phase 1 — Data contracts [COMPLETE]
1. ~~Lock the shared benchmark result type.~~ (`BenchmarkResult` with `dataSource` field)
2. ~~Lock benchmark metadata fields:~~
   - 12 benchmark keys
   - 10 benchmark categories (general, coding, reasoning, multilingual, text_to_image, text_to_video, image_to_video, community_preference, agentic, open_only)
   - source URL, fetched timestamp, includedInOverall, dataSource
3. ~~Lock normalization function signatures.~~ (0-100 scale)
4. ~~Lock overall scoring inputs and weights.~~ (12 benchmarks, weights sum to 1.0)

## Phase 2 — Live adapters [COMPLETE]

### Implemented adapters (12 total)

| # | Adapter | Data Source | Status |
|---|---|---|---|
| 1 | Artificial Analysis | AA API v2 + seed fallback | Live (needs API key) |
| 2 | LM Arena Text | LMArena catalog JSON + seed fallback | Live |
| 3 | SWE-bench Verified | GitHub JSON (`leaderboards.json`) | Live |
| 4 | Aider Polyglot | GitHub YAML (`polyglot_leaderboard.yml`) | Live |
| 5 | HF Open LLM | HF datasets-server rows API | Live (⚠️ retired) |
| 6 | LiveBench | Seed (official repo exists for scripted ingestion) | Seed |
| 7 | Arena Text to Image | LMArena catalog JSON + seed fallback | Live |
| 8 | Arena Text to Video | Seed (real ELO, no public JSON) | Seed |
| 9 | Arena Image to Video | Seed (real ELO, no public JSON) | Seed |
| 10 | GPQA Diamond | AA API v2 (evaluations.gpqa) + seed fallback | Live (needs API key) |
| 11 | Humanity's Last Exam | Scale Labs leaderboard + seed fallback | Live (HTML parse) |
| 12 | MMMLU | Seed (no strong official endpoint) | Seed |

### Data source notes (updated 2026-03-21)
- **SWE-bench**: Best source — structured JSON, 180 entries, org extraction from tags.
- **Aider**: YAML on GitHub — 68 unique models, deduplication by best `pass_rate_2`, includes cost metadata.
- **HF Open LLM**: datasets-server rows API — 4,500+ models. ⚠️ Officially retired 2025-03-13. Kept for archival.
- **Arena Text**: Now uses official LMArena catalog JSON. Averages across sub-categories (chinese, coding, creative_writing).
- **Arena Text-to-Image**: Now uses official LMArena catalog JSON ("full" category). 32 models.
- **Arena Text-to-Video / Image-to-Video**: No public JSON found. Seed data retained.
- **Artificial Analysis**: Official API v2 now available. Requires `ARTIFICIAL_ANALYSIS_API_KEY`.
- **GPQA Diamond**: Moved from Vellum top-5 to AA API `evaluations.gpqa`. Requires same API key as AA.
- **Humanity's Last Exam**: Moved from Vellum top-5 to Scale Labs official leaderboard. 43 models. HTML parse with seed fallback.
- **MMMLU**: Still seed-only. No strong official public endpoint found.
- **LiveBench**: Official repo exists with scripted ingestion via HF datasets. Future upgrade path identified.

## Phase 3 — Refresh pipeline [COMPLETE]
1. ~~Add per-adapter execution wrapper.~~
2. ~~Catch and log adapter failures individually.~~
3. ~~Mark refresh as success / partial / failed.~~
4. ~~Store raw source snapshots via BenchmarkSnapshot model.~~
5. ~~Track dataSource (live/mock) per result through DB to UI.~~
6. ~~Add stale-data threshold handling (24 hours).~~

## Phase 4 — Scoring and ranking [COMPLETE]
1. ~~Normalize each benchmark to 0-100.~~
2. ~~Apply weighted scores (12 benchmarks, weights sum to 1.0).~~
3. ~~Exclude HF Open LLM from overall ranking (weight = 0%).~~
4. ~~Compute overall top 3.~~
5. ~~Verify that overall top 3 is explainable from stored inputs.~~

## Phase 5 — UI hardening [COMPLETE]
1. ~~Add loading state for refresh (spinner on button).~~
2. ~~Add live refresh result banner (success/partial/failed).~~
3. ~~Add partial failure banner with per-adapter status pills.~~
4. ~~Add stale timestamp warning (>24 hours).~~
5. ~~Add full failure banner with error summary.~~
6. ~~Add live/mock badge per benchmark card (green dot / grey dot).~~
7. ~~Add category pills with color coding (10 categories).~~
8. ~~Add benchmark weight indicator ("15% of overall score").~~
9. ~~Add normalized score bars with visual fill.~~
10. ~~Add top-3 row highlighting in tables.~~
11. ~~Add source links per card.~~
12. ~~Add truncated model names with tooltip for long names.~~

## Phase 6 — Export completion [COMPLETE]
1. ~~Implement dedicated export render page (`/export/report`).~~
2. ~~PDF export route via Playwright.~~
3. ~~PNG export route via Playwright.~~
4. ~~Add print CSS refinements (page breaks, table formatting, print-safe borders).~~
5. ~~Bump PNG viewport height for 12 tables (2200 → 4400).~~
6. ~~Export filename includes ISO timestamp (already working).~~

## Phase 7 — Testing [COMPLETE]
173 tests passing across 5 suites:
- [x] Normalization tests (7 tests)
- [x] Overall ranking tests (7 tests)
- [x] Weights validation tests (8 tests)
- [x] Contract tests for all 12 adapters (139 tests)
- [x] Environment validation tests (4 tests)
- [ ] Refresh route integration test (deferred — requires running server)
- [ ] Export route smoke test (deferred — requires Playwright)

## Phase 8 — Deployment [NOT STARTED]
1. [ ] Add production database target.
2. [ ] Add environment validation.
3. [ ] Add Vercel deployment config or Docker option.
4. [ ] Add scheduled refresh support (cron or external trigger).

## Remaining improvement targets
- Retry/backoff policy for live fetches
- LiveBench live ingestion via official repo/HF script pipeline
- Arena Text-to-Video / Image-to-Video live JSON (when available)
- Historical score tracking and trend visualization
- Model comparison view
