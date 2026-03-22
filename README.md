# LLM Benchmark Dashboard

A Next.js dashboard that aggregates 12 LLM benchmark leaderboards, computes a weighted overall top 3, and exports as PDF or PNG. Supports selective live/mock rollout per adapter with a centralized theme system.

## Benchmarks

| Benchmark | Category | Source | Data Mode |
|---|---|---|---|
| Artificial Analysis Intelligence Index | General | [AA API v2](https://artificialanalysis.ai/leaderboards/models) | Live (API, `x-api-key`) / Seed fallback |
| LM Arena Text | Community Preference | [LMArena catalog JSON](https://github.com/lmarena/arena-catalog) | Live (JSON) / Seed fallback |
| SWE-bench Verified | Coding | [GitHub JSON](https://www.swebench.com/) | Live (GitHub JSON) |
| Aider Polyglot | Coding | [GitHub YAML](https://aider.chat/docs/leaderboards/) | Live (GitHub YAML) |
| GPQA Diamond | Reasoning | [AA API v2](https://artificialanalysis.ai) (`evaluations.gpqa`) | Live (API, `x-api-key`) / Seed fallback |
| Humanity's Last Exam | Reasoning | [AA API v2](https://artificialanalysis.ai) (`evaluations.hle`) → [Scale Labs](https://labs.scale.com/leaderboard/humanitys_last_exam) | Live (API primary, HTML fallback) / Seed |
| MMMLU (MMLU-Pro) | Multilingual | [AA API v2](https://artificialanalysis.ai) (`evaluations.mmlu_pro`) | Live (API, `x-api-key`) / Seed fallback |
| LiveBench | General | [HF livebench/model_judgment](https://huggingface.co/datasets/livebench/model_judgment) → [livebench.ai](https://livebench.ai/) | Live (HF parquet) / Seed fallback |
| Hugging Face Open LLM | Open-Only | [huggingface.co](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) | Live (HF API) ⚠️ Retired 2025-03-13 |
| Arena Text to Image | Text to Image | [LMArena catalog JSON](https://github.com/lmarena/arena-catalog) | Live (JSON) / Seed fallback |
| Arena Text to Video | Text to Video | [AA API v2](https://artificialanalysis.ai/api/v2/data/media/text-to-video) | Live (API, `x-api-key`) / Seed fallback |
| Arena Image to Video | Image to Video | [AA API v2](https://artificialanalysis.ai/api/v2/data/media/image-to-video) | Live (API, `x-api-key`) / Seed fallback |

**11 live-capable** · **0 seed-only** · **1 retired/archival**

**Data modes:**
- **Live** — fetches structured data (JSON, YAML, API) on each refresh
- **Seed** — uses real scores from the latest manual capture, returned on refresh
- **Mock** — synthetic placeholder data for local development

## Overall ranking weights

| Benchmark | Weight |
|---|---|
| Artificial Analysis | 20% |
| Arena Text | 15% |
| LiveBench | 13% |
| SWE-bench Verified | 13% |
| GPQA Diamond | 13% |
| Humanity's Last Exam | 13% |
| Aider Polyglot | 7% |
| MMMLU | 6% |
| Arena Text to Image | 0% (visual, excluded) |
| Arena Text to Video | 0% (visual, excluded) |
| Arena Image to Video | 0% (visual, excluded) |
| Hugging Face Open LLM | 0% (retired, excluded) |

Scores are normalized independently to 0-100 per benchmark before weighting. Visual generation benchmarks (T2I, T2V, I2V) are displayed on the dashboard but excluded from the overall ranking to prevent image/video-only models from appearing in the Top 3.

## Tech stack

- Next.js 15, TypeScript, Tailwind CSS
- Prisma + SQLite
- Adapter pattern with per-adapter live/mock toggle
- Centralized CSS variable theme system (`app/theme.css`)
- PDF and PNG export via Playwright headless render
- Vitest test suite (181 tests)
- Exponential backoff with per-request timeout (`lib/fetch-with-retry.ts`)
- Environment validation via Next.js instrumentation hook

## Setup

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run dev
```

Then open http://localhost:3000 and click **Refresh** to populate data.

## Environment variables

```env
DATABASE_URL="file:./dev.db"
APP_URL="http://localhost:3000"
EXPORT_OUTPUT_DIR="./exports"
USE_MOCK_DATA="true"

# API keys for live adapters
ARTIFICIAL_ANALYSIS_API_KEY=""   # Required for AA, GPQA, HLE, MMMLU, T2V, I2V live mode

# Per-adapter live flags (only checked when USE_MOCK_DATA="false")
USE_LIVE_ARTIFICIAL_ANALYSIS="true"
USE_LIVE_ARENA_TEXT="true"
USE_LIVE_SWE_BENCH="true"
USE_LIVE_AIDER="true"
USE_LIVE_HF_OPEN_LLM="true"
USE_LIVE_ARENA_TEXT_TO_IMAGE="true"
USE_LIVE_ARENA_TEXT_TO_VIDEO="true"
USE_LIVE_ARENA_IMAGE_TO_VIDEO="true"
USE_LIVE_GPQA_DIAMOND="true"
USE_LIVE_HUMANITYS_LAST_EXAM="true"
USE_LIVE_MMMLU="true"
USE_LIVE_LIVEBENCH="true"
```

Set `USE_MOCK_DATA="false"` to enable selective live rollout. Each adapter has its own flag.

### API keys

| Key | Adapters | Auth Header | Required? |
|---|---|---|---|
| `ARTIFICIAL_ANALYSIS_API_KEY` | AA, GPQA Diamond, HLE, MMMLU, Arena T2V, Arena I2V | `x-api-key` | Optional — falls back to seed without it. Free tier: 1,000 req/day |

### Live fetch resilience

All live adapters use `fetchWithRetry()` from `lib/fetch-with-retry.ts`:
- **3 attempts** with exponential backoff (1s → 2s → 4s)
- **Per-request timeout**: 10–15s depending on adapter
- Retries on 429 (rate limit), 5xx, network errors, timeouts
- Immediate bail on 4xx (permanent failures like 401/403/404)
- On exhaustion, adapter falls back to seed data

## Testing

```bash
npm test              # Run all 181 tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Test suites (6):**
- Normalization (7 tests) — min-max scaling, rank fallback, edge cases
- Overall ranking (8 tests) — weighted scoring, multi-benchmark aggregation, tie-breaking, visual benchmark exclusion
- Weights validation (8 tests) — sum to 1.0, keys have names/categories/labels
- Adapter contracts (139 tests) — all 12 adapters × shape, dataSource, normalizedScore bounds
- Environment validation (4 tests) — env variable checks
- fetchWithRetry (7 tests) — retry on 5xx/429, bail on 4xx, timeout, backoff, exhaustion

## API routes

| Route | Method | Description |
|---|---|---|
| `/api/benchmarks` | GET | Current dashboard data as JSON |
| `/api/refresh` | POST | Refresh all benchmarks (returns per-adapter status) |
| `/api/export/pdf` | GET | Export dashboard as PDF |
| `/api/export/png` | GET | Export dashboard as PNG |
| `/api/themes` | GET | List available themes |
| `/api/themes` | POST | Upload a new theme CSS file |
| `/api/themes/[name]` | GET | Fetch theme CSS by name |
| `/api/themes/[name]` | DELETE | Delete a theme (except Default Light) |
| `/export/report` | GET | Print-optimized render view |

## Theme system

All visual styling is controlled by CSS custom properties in `app/theme.css` (~80 variables). This single file defines:

- Page and card colors, shadows, radii
- Button styles (primary/secondary)
- Table colors (header, rows, top-3 highlight)
- Score bar heat gradient tiers (5 color bands)
- Rank card colors (gold/silver/bronze)
- Category pill colors (10 categories)
- Banner colors (success/warning/error)
- Badge colors (live/mock)
- Font family and typography

To customize the dashboard appearance, edit `app/theme.css` or use the **Theme Picker** in the dashboard header to import and switch between theme presets. Themes are stored in the `themes/` directory and managed via the `/api/themes` API routes. The companion **Theme Architect** (`LLM Dashboard Theme Architect.html`) provides a visual editor for creating new themes with live preview.

## UI features

- **Overall Top 3** with weighted scores, strength tags, model card links, and scoring methodology explanation
- **Heat-gradient score bars** with 5-tier color scale (indigo → green → yellow → orange → red)
- **Strength tags** on top-3 cards showing which benchmarks each model excels in
- **Live/Mock badge** per benchmark card (green dot = live data, grey = mock)
- **Category pills** with color coding (10 categories)
- **Benchmark descriptions** under each card title
- **Weight indicator** showing each benchmark's contribution to overall ranking
- **Top-3 row highlighting** in each benchmark table
- **Refresh status banners** (success, partial failure, full failure)
- **Stale data warning** when last refresh > 24 hours
- **Per-adapter failure detail** with error summaries
- **PDF and PNG export** with full feature parity (descriptions, strengths, methodology)

## Project structure

```
app/
  theme.css                     # Master theme (CSS custom properties)
  globals.css                   # Imports theme, Tailwind, base styles
  page.tsx                      # Dashboard page (SSR)
  layout.tsx                    # Root layout
  api/
    benchmarks/route.ts         # GET benchmark data
    refresh/route.ts            # POST refresh trigger
    export/pdf/route.ts         # PDF export
    export/png/route.ts         # PNG export
    themes/route.ts             # Theme list and upload
    themes/[name]/route.ts      # Theme fetch and delete
  export/report/page.tsx        # Export render view (inline styles for Playwright)
components/
  dashboard-header.tsx          # Refresh button, status banners, export links
  benchmark-card.tsx            # Per-benchmark card with category/source badges
  benchmark-table.tsx           # Ranked table with heat-gradient score bars
  overall-top3.tsx              # Overall weighted top 3 with strength tags
  theme-picker.tsx              # Theme selection, import, and deletion
lib/
  adapters/
    _base.ts                    # BaseAdapter with mock/live toggle
    index.ts                    # Adapter registry (all 12)
    arena-text.ts               # LM Arena Text (LMArena catalog JSON + seed)
    artificial-analysis.ts      # Artificial Analysis (AA API v2 + seed)
    swebench.ts                 # SWE-bench Verified (live GitHub JSON)
    aider.ts                    # Aider Polyglot (live GitHub YAML)
    livebench.ts                # LiveBench (HF parquet + seed fallback)
    hf-open-llm.ts              # HF Open LLM (live API, retired)
    arena-text-to-image.ts      # Arena T2I (LMArena catalog JSON + seed)
    arena-text-to-video.ts      # Arena T2V (AA API v2 media + seed)
    arena-image-to-video.ts     # Arena I2V (AA API v2 media + seed)
    gpqa-diamond.ts             # GPQA Diamond (AA API v2 evaluations.gpqa + seed)
    humanitys-last-exam.ts      # Humanity's Last Exam (AA API v2 → Scale Labs HTML → seed)
    mmmlu.ts                    # MMMLU (AA API v2 evaluations.mmlu_pro + seed)
  scoring/
    normalize.ts                # 0-100 normalization
    overall-rank.ts             # Weighted overall top 3
  refresh.ts                    # Refresh pipeline + getDashboardData
  mock-data.ts                  # Mock data generator
  fetch-with-retry.ts             # Exponential backoff wrapper (3 attempts, timeout)
  types.ts                      # TypeScript types
  weights.ts                    # Benchmark names, weights, categories, descriptions
  env.ts                        # Environment validation helper
  db.ts                         # Prisma client
__tests__/
  scoring/
    normalize.test.ts           # Normalization unit tests
    overall-rank.test.ts        # Ranking unit tests
    weights.test.ts             # Weights validation tests
  adapters/
    adapter-contracts.test.ts   # Contract tests for all 12 adapters
  env.test.ts                   # Environment validation tests
  fetch-with-retry.test.ts      # Retry/backoff unit tests
prisma/
  schema.prisma                 # SQLite schema
instrumentation.ts              # Next.js startup hook (env validation)
vitest.config.ts                # Vitest configuration
themes/
  Default Light.css             # Default theme preset
  Midnight Dark.css             # Dark theme preset
  Ocean Blue.css                # Blue-tinted light theme preset
LLM Dashboard Theme Architect.html  # Standalone theme editor web app
```

## Adding a new benchmark

1. Add the key to `BenchmarkKey` in `lib/types.ts`
2. Add category to `BenchmarkCategory` if needed
3. Create adapter file in `lib/adapters/` extending `BaseAdapter`
4. Register in `lib/adapters/index.ts`
5. Add weight, name, category, and description in `lib/weights.ts`
6. Add category color variables in `app/theme.css`
7. Add category style in `components/benchmark-card.tsx` and `components/overall-top3.tsx`
8. Add bucket in `getDashboardData()` in `lib/refresh.ts`
9. Add `USE_LIVE_*` flag in `.env.example`
10. Add strength label in `components/overall-top3.tsx`
11. Add inline colors in `app/export/report/page.tsx` for export parity

## Known limitations

- No authentication
- No scheduled refresh (manual trigger only)
- No last-known-good fallback on fetch failure
- HF Open LLM benchmark was retired 2025-03-13 (kept for archival)
- LiveBench HF dataset may lag behind livebench.ai (falls back to seed when stale)
- No deployment config yet (Vercel/Docker)
- AA API free tier limited to 1,000 requests/day
