# Codex / Agent Handoff — LLM Benchmark Dashboard

## Objective

Continue hardening and productionizing the existing dashboard without changing scoring policy, benchmark inclusion, or adapter architecture.

## Current state

The repo is operational. Core dashboard behavior, scoring, UI, refresh, and export routes exist. Remaining work is refinement and hardening, not a rewrite.

## Do first

1. Verify export layout with all 12 tables.
2. Add fixture-based adapter tests.
3. Add normalization and ranking unit tests.
4. Add refresh/export smoke coverage.

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
