# Benchmark Adapter Specification

All benchmark adapters must conform to the same behavioral and type contract.

## Target interface

```ts
export interface BenchmarkAdapter {
  key: BenchmarkKey;
  fetchTopResults(limit?: number): Promise<BenchmarkResult[]>;
}
```

## Required output fields
Each returned `BenchmarkResult` must include:
- `id`
- `benchmarkKey`
- `fetchedAt`
- `modelName`
- `provider` if known
- `rank` if available
- `rawScore` if available
- `rawScoreText` if useful for display
- `normalizedScore` if normalization is run inside pipeline
- `confidenceText` if source exposes uncertainty or confidence labels
- `category`
- `sourceUrl`
- `includedInOverall`

## Adapter responsibilities
1. Fetch the most current accessible source data.
2. Preserve original score or rank semantics.
3. Avoid silently coercing missing data into zero.
4. Return a clean, typed array.
5. Throw meaningful errors when parsing fails.

## Source-specific rules

### Artificial Analysis
- Treat as composite/general benchmark.
- Preserve the published model score and rank if present.
- Included in overall ranking by default.

### LM Arena Text
- Treat as community-preference benchmark.
- Preserve arena score/ELO if present.
- Included in overall ranking by default, but weighted below composite benchmark sources.

### LiveBench
- Treat as general contamination-resistant benchmark.
- Included in overall ranking by default.

### SWE-bench Verified
- Treat as coding benchmark.
- Included in overall ranking by default.

### Aider Polyglot
- Treat as coding benchmark.
- Included in overall ranking by default.

### Hugging Face Open LLM
- Treat as open-only cohort benchmark.
- Excluded from default overall ranking.
- Still display top 10 in UI.

## Error handling
- Adapter failures must not crash the entire refresh.
- Every adapter should expose enough context in errors to debug parse drift.
- On failure, the refresh pipeline should keep prior successful data if available.

## Parsing policy
- Prefer structured data endpoints.
- If scraping HTML, keep selectors minimal and resilient.
- Do not depend on brittle cosmetic class names if more stable anchors exist.
- Store raw source snapshots when feasible.

## Test requirement
Every adapter must have:
- at least one fixture file
- one parsing test
- one regression test when markup/data format changes

## Anti-patterns
- mixing source ranking logic inside UI components
- averaging raw scores from different sources directly
- excluding failed models silently without logging
- mutating benchmark weights inside adapter code
