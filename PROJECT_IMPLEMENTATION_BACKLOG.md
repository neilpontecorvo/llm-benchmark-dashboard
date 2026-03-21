# Project Implementation Backlog — LLM Benchmark Dashboard

## Priority 1 — Export hardening

1. Verify `/export/report` layout renders cleanly with 12 benchmark tables.
2. Confirm page breaks, spacing, header retention, and readability in PDF.
3. Confirm PNG viewport captures the intended full report area.
4. Add print CSS refinements for long table sections.
5. Add deterministic export filename convention with timestamp.
6. Add a smoke test for both export routes.

## Priority 2 — Test coverage

1. Add one fixture-based test per adapter.
2. Add normalization tests covering ties, identical raw scores, and min/max spread.
3. Add overall ranking tests verifying weight application and HF exclusion.
4. Add refresh integration test verifying partial failure handling.
5. Add export smoke test verifying content-type and non-empty output.

## Priority 3 — Runtime resilience

1. Add retry/backoff for live fetches.
2. Keep error context source-specific and debuggable.
3. Avoid retries for seed/mock paths where not meaningful.
4. Preserve partial-success refresh behavior.

## Priority 4 — Deployment

1. Add startup env validation.
2. Add production DB target strategy.
3. Add Vercel config or Dockerfile and runbook.
4. Add scheduled refresh method.

## Deferred

- LiveBench live ingestion
- Arena multimodal live ingestion
- Expanded Vellum data access
- Historical trend visualization
- Model comparison view
