# LLM Benchmark Dashboard

A Next.js dashboard that aggregates 12 LLM benchmark leaderboards, computes a weighted overall top 3, and exports as PDF or PNG. Supports selective live/mock rollout per adapter with a centralized theme system.

## Benchmarks

| Benchmark | Category | Source | Data Mode |
|---|---|---|---|
| Artificial Analysis Intelligence Index | General | [AA API v2](https://artificialanalysis.ai/leaderboards/models) | Live (API, needs key) / Seed fallback |
| LM Arena Text | Community Preference | [LMArena catalog JSON](https://github.com/lmarena/arena-catalog) | Live (JSON) / Seed fallback |
| SWE-bench Verified | Coding | [GitHub JSON](https://www.swebench.com/) | Live (GitHub JSON) |
| Aider Polyglot | Coding | [GitHub YAML](https://aider.chat/docs/leaderboards/) | Live (GitHub YAML) |
| LiveBench | General | [livebench.ai](https://livebench.ai/) | Seed (JS-rendered SPA, no API) |
| Hugging Face Open LLM | Open-Only | [huggingface.co](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) | Live (HF API) ⚠️ Retired 2025-03-13 |
| Arena Text to Image | Text to Image | [LMArena catalog JSON](https://github.com/lmarena/arena-catalog) | Live (JSON) / Seed fallback |
| Arena Text to Video | Text to Video | [arena.ai](https://arena.ai/leaderboard) | Seed (no public JSON) |
| Arena Image to Video | Image to Video | [arena.ai](https://arena.ai/leaderboard) | Seed (no public JSON) |
| GPQA Diamond | Reasoning | [AA API v2](https://artificialanalysis.ai) | Live (API, needs key) / Seed fallback |
| Humanity's Last Exam | Reasoning | [Scale Labs](https://labs.scale.com/leaderboard/humanitys_last_exam) | Live (HTML parse) / Seed fallback |
| MMMLU | Multilingual | Seed data | Seed (no official endpoint) |

**7 live-capable** · **3 seed-only** · **1 retired/archival** · **1 mock fallback**

**Data modes:**
- **Live** — fetches structured data (JSON, YAML, API) on each refresh
- **Seed** — uses real scores from the latest manual capture, returned on refresh
- **Mock** — synthetic placeholder data for local development

## Overall ranking weights

| Benchmark | Weight |
|---|---|
| Artificial Analysis | 15% |
| Arena Text | 12% |
| LiveBench | 10% |
| SWE-bench Verified | 10% |
| GPQA Diamond | 10% |
| Humanity's Last Exam | 10% |
| Arena Text to Image | 8% |
| Arena Text to Video | 8% |
| Arena Image to Video | 7% |
| Aider Polyglot | 5% |
| MMMLU | 5% |
| Hugging Face Open LLM | 0% (excluded) |

Scores are normalized independently to 0-100 per benchmark before weighting.

## Tech stack

- Next.js 15, TypeScript, Tailwind CSS
- Prisma + SQLite
- Adapter pattern with per-adapter live/mock toggle
- Centralized CSS variable theme system (`app/theme.css`)
- PDF and PNG export via Playwright headless render
- Vitest test suite (173 tests)
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
ARTIFICIAL_ANALYSIS_API_KEY=""   # Required for AA, GPQA Diamond live mode

# Per-adapter live flags (only checked when USE_MOCK_DATA="false")
USE_LIVE_ARTIFICIAL_ANALYSIS="false"
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

| Key | Adapters | Required? |
|---|---|---|
| `ARTIFICIAL_ANALYSIS_API_KEY` | Artificial Analysis, GPQA Diamond | Optional — falls back to seed data without it |

## Testing

```bash
npm test              # Run all 173 tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Test suites (5):**
- Normalization (7 tests) — min-max scaling, rank fallback, edge cases
- Overall ranking (7 tests) — weighted scoring, multi-benchmark aggregation, tie-breaking
- Weights validation (8 tests) — sum to 1.0, keys have names/categories/labels
- Adapter contracts (139 tests) — all 12 adapters × shape, dataSource, normalizedScore bounds
- Environment validation (4 tests) — env variable checks

## API routes

| Route | Method | Description |
|---|---|---|
| `/api/benchmarks` | GET | Current dashboard data as JSON |
| `/api/refresh` | POST | Refresh all benchmarks (returns per-adapter status) |
| `/api/export/pdf` | GET | Export dashboard as PDF |
| `/api/export/png` | GET | Export dashboard as PNG |
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

To customize the dashboard appearance, edit `app/theme.css`. All components read from these variables — no scattered hex values to hunt down.

## UI features

- **Overall Top 3** with weighted scores, strength tags, and scoring methodology explanation
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
  export/report/page.tsx        # Export render view (inline styles for Playwright)
components/
  dashboard-header.tsx          # Refresh button, status banners, export links
  benchmark-card.tsx            # Per-benchmark card with category/source badges
  benchmark-table.tsx           # Ranked table with heat-gradient score bars
  overall-top3.tsx              # Overall weighted top 3 with strength tags
lib/
  adapters/
    _base.ts                    # BaseAdapter with mock/live toggle
    index.ts                    # Adapter registry (all 12)
    arena-text.ts               # LM Arena Text (LMArena catalog JSON + seed)
    artificial-analysis.ts      # Artificial Analysis (API v2 + seed)
    swebench.ts                 # SWE-bench Verified (live GitHub JSON)
    aider.ts                    # Aider Polyglot (live GitHub YAML)
    livebench.ts                # LiveBench (seed)
    hf-open-llm.ts              # HF Open LLM (live API, retired)
    arena-text-to-image.ts      # Arena T2I (LMArena catalog JSON + seed)
    arena-text-to-video.ts      # Arena T2V (seed)
    arena-image-to-video.ts     # Arena I2V (seed)
    gpqa-diamond.ts             # GPQA Diamond (AA API v2 + seed)
    humanitys-last-exam.ts      # Humanity's Last Exam (Scale Labs HTML + seed)
    mmmlu.ts                    # MMMLU (seed)
  scoring/
    normalize.ts                # 0-100 normalization
    overall-rank.ts             # Weighted overall top 3
  refresh.ts                    # Refresh pipeline + getDashboardData
  mock-data.ts                  # Mock data generator
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
prisma/
  schema.prisma                 # SQLite schema
instrumentation.ts              # Next.js startup hook (env validation)
vitest.config.ts                # Vitest configuration
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
- No retry/backoff policy for live fetches
- No last-known-good fallback on fetch failure
- Seed adapters require manual updates when source data changes
- Arena T2V and I2V have no public structured endpoint
- MMMLU has no strong official public endpoint
- HF Open LLM benchmark was retired 2025-03-13 (kept for archival)
- No deployment config yet (Vercel/Docker)
