# Project Context Brief — LLM Benchmark Dashboard

## Summary

A functional benchmark aggregation dashboard exists and is already beyond prototype stage. Core architecture, scoring logic, UI hardening, and selective live/mock rollout are in place. Remaining work is concentrated in export verification, testing, and deployment.

## Confirmed current state

- App stack: Next.js 15, TypeScript, Tailwind CSS, Prisma, SQLite
- 12 benchmark adapters implemented (11 live-capable, 1 retired)
- All live adapters use `fetchWithRetry` with exponential backoff and per-request timeout
- 181 tests across 6 suites — all passing
- Dashboard computes a weighted overall top 3 from normalized per-benchmark scores
- Refresh pipeline tolerates individual adapter failure
- Export routes exist for PDF and PNG using Playwright

## Benchmark roster

1. Artificial Analysis Intelligence Index
2. LM Arena Text
3. SWE-bench Verified
4. Aider Polyglot
5. LiveBench
6. Hugging Face Open LLM
7. Arena Text to Image
8. Arena Text to Video
9. Arena Image to Video
10. GPQA Diamond
11. Humanity's Last Exam
12. MMMLU

## Non-negotiable project rules

- Per-benchmark normalization only
- Weighted overall ranking only after normalization
- HF Open LLM excluded from overall weighted score
- Full model/version names must be preserved
- Source limitations must remain explicit
- Seed/mock fallbacks stay in place until proven replaceable
- Adapter failures must not crash refresh

## Remaining work

### Phase 8 — Deployment [NOT STARTED]
- health check endpoint (`/api/health`)
- Vercel or Docker deployment option
- scheduled refresh support (cron endpoint)

### Improvements
- last-known-good data fallback on fetch failure
- historical score tracking and trend visualization
- model comparison view

## Known limitations

- LiveBench HF dataset may lag behind livebench.ai (falls back to seed)
- HF Open LLM benchmark was retired 2025-03-13 (kept for archival)
- AA API free tier limited to 1,000 requests/day
- No auth and no scheduled refresh in current state

## Latest report snapshot

Generated report shows an active end-to-end export/report flow and a current weighted overall top 3 of:
1. Gemini 3 Pro
2. Claude Opus 4.6 Thinking
3. Claude Opus 4.6
