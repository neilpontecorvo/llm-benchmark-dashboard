# Codex / Agent Handoff — LLM Benchmark Dashboard

## Objective

Continue hardening and productionizing the existing dashboard without changing scoring policy, benchmark inclusion, or adapter architecture.

## Current state

The repo is operational with 11 live-capable adapters, retry/backoff on all live fetches, 181 tests across 6 suites, model card URLs on Top 3, and PDF/PNG export with full feature parity. Remaining work is deployment.

## Do first

1. Add health check endpoint (`/api/health`).
2. Add deployment config (Vercel or Docker).
3. Add scheduled refresh support (cron endpoint).
4. Add last-known-good data fallback.

## Preserve

- 12-benchmark structure
- per-adapter live/mock toggle pattern
- `dataSource` flow adapter -> DB -> UI
- per-benchmark normalization
- weighted overall top 3
- HF Open LLM exclusion from weighted score
- strict TypeScript

## Do not do

- Do not average raw scores across benchmarks.
- Do not fabricate missing models for limited sources.
- Do not remove seed/mock fallbacks.
- Do not move parsing logic into components.
- Do not change weights without explicit instruction.

## Verification targets

- `npm run build`
- `npx tsc --noEmit`
- adapter tests
- refresh integration
- export smoke test

## Expected deliverable style

Return:
- files changed
- exact behavior added/fixed
- test/verification result
- remaining risk
