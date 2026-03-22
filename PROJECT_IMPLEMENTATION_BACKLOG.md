# Project Implementation Backlog — LLM Benchmark Dashboard

Last updated: 2026-03-22

## Completed ✅

### Export hardening
- [x] `/export/report` renders all 12 benchmark tables with full feature parity
- [x] Print CSS with page breaks, table formatting
- [x] PNG viewport tuned for 12 tables (4400px)
- [x] Timestamped export filenames

### Test coverage
- [x] 181 tests across 6 suites — all passing
- [x] Normalization tests (7), ranking tests (8), weights tests (8)
- [x] Contract tests for all 12 adapters (139 tests)
- [x] Environment validation tests (4)
- [x] fetchWithRetry tests (7)

### Runtime resilience
- [x] `fetchWithRetry` with exponential backoff (3 attempts, 1s/2s/4s)
- [x] Per-request timeout (10–15s via AbortController)
- [x] Retries on 429/5xx/network errors, bail on 4xx
- [x] All 9 live-fetching adapters wired

### LiveBench live data
- [x] HuggingFace parquet integration (`livebench/model_judgment`)
- [x] Category-balanced aggregation matching official methodology
- [x] `hyparquet` zero-dep parquet reader

### Model card URLs
- [x] Top 3 cards link to official model cards (dashboard + export)

## Remaining

### Priority 1 — Deployment
1. Add health check endpoint (`/api/health`)
2. Add Vercel config or Dockerfile
3. Add scheduled refresh support (cron endpoint)
4. Document deployment steps

### Priority 2 — Data resilience
1. Add last-known-good data fallback (serve stale data on fetch failure)

### Deferred
- Historical trend visualization
- Model comparison view
- Refresh route integration test (requires running server)
- Export route smoke test (requires Playwright)
