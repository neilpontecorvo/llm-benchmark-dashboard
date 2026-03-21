# Codex Execution Prompt

Use this prompt as the working instruction set when handing the repository to Codex.

---

You are continuing implementation of the `llm-benchmark-dashboard` repository.

## Current state

The dashboard is functional with 12 benchmark adapters (7 live-capable), a working refresh pipeline, comprehensive UI with theme system, PDF/PNG export with full feature parity, and 173 passing tests. The core architecture is complete — remaining work is resilience hardening and deployment.

### What is built
- 12 benchmark adapters (7 live-capable, 3 seed, 1 mock, 1 retired)
- Refresh pipeline with per-adapter error handling and partial success
- Prisma + SQLite with `dataSource` tracking
- Dashboard UI with category badges, live/mock indicators, weight labels, heat-gradient score bars, strength tags, benchmark descriptions
- Overall Top 3 with scoring methodology explanation and per-model strength tags
- Centralized theme system (`app/theme.css`) with ~80 CSS custom properties
- Stale data warnings and partial failure banners
- PDF and PNG export routes via Playwright with full feature parity
- Selective live/mock rollout via per-adapter env flags
- Environment validation via Next.js instrumentation hook
- 173 tests across 5 suites (normalization, ranking, weights, adapter contracts, env validation)

### What still needs work
- Retry/backoff for live fetches
- Request timeout per adapter
- Last-known-good data fallback on fetch failure
- Deployment config (Vercel or Docker)
- Scheduled refresh support (cron endpoint)
- Health check endpoint

## Repository constraints
- Keep TypeScript strict.
- Keep changes incremental and reviewable.
- Do not silently change benchmark inclusion policy or weights.
- Do not remove mock/seed fallbacks until live adapters are confirmed stable.
- Use full model names with versions everywhere (e.g., "Claude Opus 4.6 Thinking").
- Preserve the centralized theme system — all colors in `app/theme.css`.

## Benchmark set (12 benchmarks)

### Included in overall ranking (weight > 0)
- Artificial Analysis (15%) — general — AA API v2 + seed fallback
- Arena Text (12%) — community preference — LMArena catalog JSON + seed fallback
- LiveBench (10%) — general — seed only
- SWE-bench Verified (10%) — coding — live GitHub JSON
- GPQA Diamond (10%) — reasoning — AA API v2 + seed fallback
- Humanity's Last Exam (10%) — reasoning — Scale Labs HTML parse + seed fallback
- Arena Text to Image (8%) — text to image — LMArena catalog JSON + seed fallback
- Arena Text to Video (8%) — text to video — seed only
- Arena Image to Video (7%) — image to video — seed only
- Aider Polyglot (5%) — coding — live GitHub YAML
- MMMLU (5%) — multilingual — seed only

### Excluded from overall ranking
- Hugging Face Open LLM (0%) — open-only cohort — live but retired 2025-03-13

## Priority order for remaining work
1. Add retry/backoff wrapper for live fetch failures.
2. Add request timeout per adapter.
3. Add last-known-good fallback (serve stale data on failure).
4. Add health check endpoint (`/api/health`).
5. Add deployment config (Vercel or Docker).
6. Add scheduled refresh support.
7. Explore LiveBench live data source (official repo/HF script pipeline).

## Required behaviors
- Manual refresh button triggers full pipeline.
- One failed adapter must not break the whole refresh.
- Dashboard must show last refreshed timestamp.
- UI must indicate partial refreshes and stale data.
- Each benchmark card shows live/mock badge, weight, description, and category.
- Overall Top 3 shows strength tags and scoring methodology.
- Export PDF and PNG must use the dedicated render page with full feature parity.
- All visual styling must use CSS variables from `app/theme.css`.

## Adapter rules
- One adapter file per source.
- Prefer official structured endpoints.
- Use seed data for sources with no API.
- Preserve raw score, rank, source URL, and data source type.
- `dataSource` field flows from adapter through DB to UI.

## Deliverables expected
- [ ] Retry/backoff policy for live fetches
- [ ] Request timeout per adapter
- [ ] Last-known-good data fallback
- [ ] Health check endpoint
- [ ] Deployment configuration
- [ ] Scheduled refresh support

## Prohibited shortcuts
- Do not average raw scores from different benchmarks.
- Do not hide missing data by coercing to zero.
- Do not embed source-specific parsing inside UI components.
- Do not remove seed fallbacks before live paths are stable.
- Do not fabricate data to fill source limitations.
- Do not scatter hex color values — use `app/theme.css` variables.

---
