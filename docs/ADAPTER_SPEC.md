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
| Artificial Analysis | `artificial_analysis` | general | Official API (v2) + seed fallback | Live (needs API key) | 20% |
| LM Arena Text | `arena_text` | community_preference | LMArena catalog JSON + seed fallback | Live | 15% |
| LiveBench | `livebench` | general | HF parquet (`livebench/model_judgment`) + seed fallback | Live (HF, no auth) | 13% |
| HF Open LLM | `hf_open_llm` | open_only | HF datasets-server API | Live (⚠️ retired 2025-03-13) | 0% |

### Coding

| Adapter | Key | Category | Source | Data Mode | Weight |
|---|---|---|---|---|---|
| SWE-bench Verified | `swe_bench_verified` | coding | GitHub JSON | Live | 13% |
| Aider Polyglot | `aider_polyglot` | coding | GitHub YAML | Live | 7% |

### Visual Generation (excluded from overall ranking)

| Adapter | Key | Category | Source | Data Mode | Weight |
|---|---|---|---|---|---|
| Arena Text to Image | `arena_text_to_image` | text_to_image | LMArena catalog JSON + seed fallback | Live | 0% |
| Arena Text to Video | `arena_text_to_video` | text_to_video | AA API v2 media endpoint + seed fallback | Live (needs API key) | 0% |
| Arena Image to Video | `arena_image_to_video` | image_to_video | AA API v2 media endpoint + seed fallback | Live (needs API key) | 0% |

### Reasoning & Knowledge

| Adapter | Key | Category | Source | Data Mode | Weight |
|---|---|---|---|---|---|
| GPQA Diamond | `gpqa_diamond` | reasoning | AA API v2 (`evaluations.gpqa`) + seed fallback | Live (needs API key) | 13% |
| Humanity's Last Exam | `humanitys_last_exam` | general | AA API v2 (`evaluations.hle`) → Scale Labs HTML → seed | Live (API primary, HTML fallback) | 13% |
| MMMLU | `mmmlu` | multilingual | AA API v2 (`evaluations.mmlu_pro`) + seed fallback | Live (needs API key) | 6% |

## Live data sources

| Adapter | Endpoint | Format | Auth |
|---|---|---|---|
| Artificial Analysis | `artificialanalysis.ai/api/v2/data/llms/models` | JSON API | `x-api-key` |
| Arena Text | `raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-text.json` | JSON | None |
| Arena Text to Image | `raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-image.json` | JSON | None |
| Arena Text to Video | `artificialanalysis.ai/api/v2/data/media/text-to-video` | JSON API | `x-api-key` |
| Arena Image to Video | `artificialanalysis.ai/api/v2/data/media/image-to-video` | JSON API | `x-api-key` |
| GPQA Diamond | `artificialanalysis.ai/api/v2/data/llms/models` (`evaluations.gpqa`) | JSON API | `x-api-key` |
| Humanity's Last Exam | `artificialanalysis.ai/api/v2/data/llms/models` (`evaluations.hle`) | JSON API | `x-api-key` |
| Humanity's Last Exam (fallback) | `labs.scale.com/leaderboard/humanitys_last_exam` | HTML parse | None |
| MMMLU | `artificialanalysis.ai/api/v2/data/llms/models` (`evaluations.mmlu_pro`) | JSON API | `x-api-key` |
| SWE-bench | `raw.githubusercontent.com/swe-bench/swe-bench.github.io/master/data/leaderboards.json` | JSON | None |
| Aider | `raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/polyglot_leaderboard.yml` | YAML | None |
| LiveBench | `huggingface.co/api/datasets/livebench/model_judgment/parquet/default/leaderboard/0.parquet` | Parquet | None |
| HF Open LLM | `datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard/contents` | JSON API | None |

## API keys

| Key | Used by | Auth Header | Notes |
|---|---|---|---|
| `ARTIFICIAL_ANALYSIS_API_KEY` | AA, GPQA, HLE, MMMLU, Arena T2V, Arena I2V | `x-api-key` | Free tier: 1,000 req/day. Falls back to seed without key |

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

## Retry and timeout policy

All live adapters use `fetchWithRetry()` from `lib/fetch-with-retry.ts`:
- **3 attempts** with exponential backoff (1s → 2s → 4s delay)
- **Per-request timeout**: 10–15s depending on adapter (AA API gets 15s)
- Retries on: 429 (rate limit), 5xx, network errors, timeouts
- Does NOT retry: 4xx (permanent failures like 401/403/404)
- On exhaustion: adapter falls back to seed data

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
