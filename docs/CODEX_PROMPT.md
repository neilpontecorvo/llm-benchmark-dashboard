# Codex Execution Prompt

Use this prompt as the working instruction set when handing the repository to Codex.

---

You are implementing the `llm-benchmark-dashboard` repository.

## Mission
Build a production-quality MVP that fetches the latest LLM benchmark results, shows the top 10 results per benchmark, computes an explainable overall top 3, supports manual refresh, and exports the dashboard as PDF and PNG.

## Repository constraints
- Keep TypeScript strict.
- Keep changes incremental and reviewable.
- Preserve mock mode until live adapters are confirmed working.
- Do not silently change benchmark inclusion policy or weights.
- Do not remove existing starter files unless they are replaced with a strictly better version.

## Priority order
1. Verify baseline app boots successfully.
2. Implement shared data contracts and utilities.
3. Replace mock adapters with live adapters one by one.
4. Harden refresh pipeline for partial failures.
5. Finish export flow.
6. Add tests and fixtures.
7. Prepare deployment notes.

## Benchmark policy
Per-benchmark display:
- Artificial Analysis
- LM Arena Text
- SWE-bench Verified
- Aider Polyglot
- LiveBench
- Hugging Face Open LLM

Default overall ranking includes only:
- Artificial Analysis
- LM Arena Text
- LiveBench
- SWE-bench Verified
- Aider Polyglot

Default weights:
- Artificial Analysis: 30
- LM Arena Text: 25
- LiveBench: 20
- SWE-bench Verified: 15
- Aider Polyglot: 10
- Hugging Face Open LLM: excluded from default overall ranking

## Required behaviors
- Manual refresh button triggers full pipeline.
- One failed adapter must not break the whole refresh.
- Dashboard must show last refreshed timestamp.
- UI must indicate partial refreshes and stale data.
- Export PDF and PNG must use a dedicated render page.

## Adapter rules
- One adapter file per source.
- Prefer official structured endpoints.
- If parsing HTML, make selectors conservative.
- Preserve raw score, rank, and source URL.
- Add fixture-backed tests for each adapter.

## Deliverables expected from you
- working live adapters
- tests for normalization and ranking
- fixture-based adapter tests
- finished export routes
- README updates reflecting actual state

## Prohibited shortcuts
- Do not average raw scores from different benchmarks.
- Do not hide missing data by coercing to zero.
- Do not embed source-specific parsing inside UI components.
- Do not remove mock mode before the live path is stable.

## Done definition
- app boots locally
- refresh route works
- benchmark cards render real data for implemented sources
- overall top 3 is explainable and reproducible
- PDF export works
- PNG export works
- tests pass for implemented logic

---
