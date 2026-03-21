# Benchmark Adapter Specification

All benchmark adapters must conform to the same behavioral and type contract.

## Target interface

```ts
export interface BenchmarkAdapter {
  key: BenchmarkKey;
  displayName: string;
  sourceUrl: string;
  includedInOverall: boolean;
  fetchTopResults(limit?: number): Promise<BenchmarkResult[]>;
}
```

## Required output fields
Each returned `BenchmarkResult` must include:
- `id` — unique identifier (`benchmarkKey:modelName:rank`)
- `benchmarkKey` — one of the 12 registered keys
- `fetchedAt` — ISO timestamp of when data was fetched
- `modelName` — full model name with version (e.g., "Claude Opus 4.6 Thinking", "GPT-5.4 High")
- `provider` — organization name if known
- `rank` — position in leaderboard (null if unavailable)
- `rawScore` — numeric score from source
- `rawScoreText` — human-readable score string (e.g., "1502 ELO", "88%")
- `normalizedScore` — 0-100 normalized score (computed by pipeline)
- `confidenceText` — uncertainty or metadata (e.g., "±6 · 11,801 votes", "$29.08 cost")
- `category` — one of: general, coding, community_preference, text_to_image, text_to_video, image_to_video, reasoning, multilingual, agentic, open_only
- `sourceUrl` — link to the benchmark source
- `includedInOverall` — whether this benchmark contributes to overall ranking
- `dataSource` — "live" or "mock" (set automatically by BaseAdapter)

## Data modes

Adapters operate in one of three modes:

| Mode | Description | When used |
|---|---|---|
| **Mock** | Synthetic placeholder data from `mock-data.ts` | `USE_MOCK_DATA="true"` (default) |
| **Live** | Fetches structured data (JSON, YAML, API) on each refresh | `USE_MOCK_DATA="false"` + per-adapter flag |
| **Seed** | Returns real scores from latest manual scrape | Live flag enabled but no structured API exists |

## Adapter registry (12 adapters)

### Text / General

| Adapter | Key | Category | Source | Data Mode | Weight |
|---|---|---|---|---|---|
| Artificial Analysis | `artificial_analysis` | general | Official API (v2) + seed fallback | Live (needs API key) | 15% |
| LM Arena Text | `arena_text` | community_preference | LMArena catalog JSON + seed fallback | Live | 12% |
| LiveBench | `livebench` | general | Seed (JS SPA, official repo exists) | Seed | 10% |
| HF Open LLM | `hf_open_llm` | open_only | HF datasets-server API | Live (⚠️ retired 2025-03-13) | 0% |

### Coding

| Adapter | Key | Category | Source | Data Mode | Weight |
|---|---|---|---|---|---|
| SWE-bench Verified | `swe_bench_verified` | coding | GitHub JSON | Live | 10% |
| Aider Polyglot | `aider_polyglot` | coding | GitHub YAML | Live | 5% |

### Multimodal (Arena)

| Adapter | Key | Category | Source | Data Mode | Weight |
|---|---|---|---|---|---|
| Arena Text to Image | `arena_text_to_image` | text_to_image | LMArena catalog JSON + seed fallback | Live | 8% |
| Arena Text to Video | `arena_text_to_video` | text_to_video | Seed (real ELO, no public JSON) | Seed | 8% |
| Arena Image to Video | `arena_image_to_video` | image_to_video | Seed (real ELO, no public JSON) | Seed | 7% |

### Reasoning & Knowledge

| Adapter | Key | Category | Source | Data Mode | Weight |
|---|---|---|---|---|---|
| GPQA Diamond | `gpqa_diamond` | reasoning | AA API (evaluations.gpqa) + seed fallback | Live (needs API key) | 10% |
| Humanity's Last Exam | `humanitys_last_exam` | general | Scale Labs leaderboard + seed fallback | Live (HTML parse) | 10% |
| MMMLU | `mmmlu` | multilingual | Seed (no strong public endpoint) | Seed | 5% |

## Live data sources

| Adapter | Endpoint | Format |
|---|---|---|
| Artificial Analysis | `artificialanalysis.ai/api/v2/data/llms/models` | JSON API (auth required) |
| Arena Text | `raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-text.json` | JSON |
| Arena Text to Image | `raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-image.json` | JSON |
| GPQA Diamond | `artificialanalysis.ai/api/v2/data/llms/models` (evaluations.gpqa) | JSON API (auth required) |
| Humanity's Last Exam | `labs.scale.com/leaderboard/humanitys_last_exam` | HTML parse |
| SWE-bench | `raw.githubusercontent.com/swe-bench/swe-bench.github.io/master/data/leaderboards.json` | JSON |
| Aider | `raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/polyglot_leaderboard.yml` | YAML |
| HF Open LLM | `datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard/contents` | JSON API |

## API keys

| Key | Used by | Notes |
|---|---|---|
| `ARTIFICIAL_ANALYSIS_API_KEY` | Artificial Analysis, GPQA Diamond | Falls back to seed without key |

## Adapter responsibilities
1. Fetch the most current accessible source data.
2. Preserve original score or rank semantics.
3. Use full model names with versions (e.g., "GPT-5.4 High", not "GPT-5").
4. Avoid silently coercing missing data into zero.
5. Return a clean, typed array.
6. Throw meaningful errors when parsing fails.
7. Deduplicate entries when sources have multiple runs per model (e.g., Aider keeps best `pass_rate_2`).
8. Always retain seed data as fallback — never remove seed when adding live.

## Selective rollout pattern

Each adapter has a per-adapter environment flag:
```
USE_LIVE_<ADAPTER_NAME>="true"
```

The `shouldUseMock()` method checks:
1. If `USE_MOCK_DATA` is not `"false"` → use mock
2. If per-adapter flag is not `"true"` → use mock
3. Otherwise → call `fetchLive()`

The `BaseAdapter.fetchTopResults()` automatically tags all results with `dataSource: "live" | "mock"`.

## Error handling
- Adapter failures must not crash the entire refresh.
- Every adapter should expose enough context in errors to debug parse drift.
- On failure, the refresh pipeline records the error and continues to the next adapter.
- The refresh returns `status: "partial"` when some adapters fail.

## Parsing policy
- Prefer structured data endpoints (JSON, YAML, API).
- If scraping HTML, keep selectors minimal and resilient.
- For React SPAs with no API, use seed data with real scores.
- Store raw source snapshots via `BenchmarkSnapshot` model.
- Do not depend on brittle cosmetic class names.

## Adding a new adapter

1. Add key to `BenchmarkKey` in `lib/types.ts`
2. Add category to `BenchmarkCategory` if needed
3. Create adapter file in `lib/adapters/` extending `BaseAdapter`
4. Register in `lib/adapters/index.ts`
5. Add weight, name, and category in `lib/weights.ts`
6. Add category color in `components/benchmark-card.tsx`
7. Add bucket in `getDashboardData()` in `lib/refresh.ts`
8. Add `USE_LIVE_*` flag in `.env.example`
