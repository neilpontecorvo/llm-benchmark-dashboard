# Implementation Sequence

This file defines the recommended implementation order before and during Codex execution.

## Phase 0 — Baseline verification
1. Install dependencies.
2. Generate Prisma client.
3. Push SQLite schema.
4. Seed mock data.
5. Run the app locally.
6. Confirm dashboard render, refresh route, and export route stubs.

## Phase 1 — Data contracts
1. Lock the shared benchmark result type.
2. Lock benchmark metadata fields:
   - benchmark key
   - benchmark category
   - source URL
   - fetched timestamp
   - includedInOverall flag
3. Lock normalization function signatures.
4. Lock overall scoring inputs and weights.

## Phase 2 — Live adapters
Implement adapters in this order:
1. Artificial Analysis
2. LM Arena Text
3. LiveBench
4. SWE-bench Verified
5. Aider Polyglot
6. Hugging Face Open LLM

### Rules
- Prefer official JSON/data endpoints if available.
- If no structured endpoint exists, parse HTML conservatively.
- Add a fixture for every adapter.
- Store raw source payloads for traceability.
- Preserve mock fallback until the live adapter is stable.

## Phase 3 — Refresh pipeline
1. Add per-adapter execution wrapper.
2. Catch and log adapter failures individually.
3. Mark refresh as:
   - `success`
   - `partial`
   - `failed`
4. Preserve last-known-good data when one source fails.
5. Add stale-data threshold handling in UI.

## Phase 4 — Scoring and ranking
1. Normalize each benchmark to 0–100.
2. Apply default weights.
3. Exclude non-approved cohorts from overall ranking.
4. Apply tie-breakers.
5. Verify that overall top 3 is explainable from stored inputs.

## Phase 5 — UI hardening
1. Add loading state for refresh.
2. Add partial failure banner.
3. Add stale timestamp warning.
4. Add benchmark metadata labels.
5. Add source links and fetch timestamps.

## Phase 6 — Export completion
1. Implement dedicated export render page.
2. Use Playwright to generate PDF.
3. Use Playwright to generate PNG.
4. Validate layout for long benchmark tables.
5. Add export filename convention with timestamp.

## Phase 7 — Testing
Minimum required tests:
- normalization tests
- overall ranking tests
- one fixture-based test per adapter
- refresh route integration test
- export route smoke test

## Phase 8 — Deployment
1. Add production database target.
2. Add environment validation.
3. Add Vercel deployment notes or Docker option.
4. Add scheduled refresh support after manual refresh is stable.

## Do not do yet
- authentication
- user accounts
- personalization
- long-term historical analytics
- automatic benchmark discovery
- speculative weighting changes without explicit policy update
