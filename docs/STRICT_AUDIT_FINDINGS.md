# Strict Audit Findings

Original audit covered TypeScript path aliases, Tailwind/PostCSS, route/runtime behavior, Prisma validation, and export robustness. Updated to reflect current resolution status.

## Findings

### 1) TypeScript path aliases
Status: **RESOLVED**

Original issue: `tsconfig.json` defined `paths` for `@/*` without `baseUrl`.
Resolution: `baseUrl: "."` was added. All imports resolve correctly. `npx tsc --noEmit` passes clean.

### 2) Tailwind/PostCSS compatibility
Status: **RESOLVED** (no code change needed)

Verified:
- `tailwind.config.ts` content globs cover `app`, `components`, and `lib`.
- `postcss.config.js` correctly enables `tailwindcss` and `autoprefixer`.
- `app/globals.css` correctly imports Tailwind layers.
- 10 benchmark categories now have color mappings in `benchmark-card.tsx`.

### 3) Route/runtime behavior
Status: **RESOLVED**

Applied:
- `export const runtime = "nodejs"` on all API routes.
- `export const dynamic = "force-dynamic"` on API routes and export render page.
- try/catch wrappers returning structured HTTP 500 on failure.

### 4) Export helper robustness
Status: **RESOLVED**

Applied:
- `APP_URL` validated with `new URL()`.
- Trailing slash normalization.
- Explicit 45-second timeout on `page.goto`.

Note: Export page now needs layout verification for 12 benchmark tables (expanded from original 6).

### 5) Prisma runtime validation
Status: **RESOLVED**

Applied:
- `getDatabaseUrl()` helper in `lib/db.ts` with clear error message.
- `PrismaClient` uses `datasourceUrl` from validated env.
- Prisma seed config registered in `package.json`.

Additional schema changes since audit:
- `dataSource` column added to `BenchmarkResult` model (`String @default("mock")`).

### 6) New finding: Hydration mismatch (cosmetic)
Status: **RESOLVED**

Issue: Dark Reader browser extension injects `data-darkreader-*` attributes causing React hydration warnings.
Resolution: `suppressHydrationWarning` added to `<html>` and `<body>` in `app/layout.tsx`. No functional impact.

### 7) New finding: Adapter data coverage
Status: **KNOWN LIMITATION**

Observations:
- Vellum benchmarks (GPQA Diamond, HLE, MMMLU) only expose top 5 models.
- LiveBench aggregator data may be stale (missing recent frontier models).
- Arena multimodal adapters use seed data from manual scrape (March 2026).

Recommended future work:
- Implement headless browser scraping for LiveBench and Arena.
- Monitor Vellum for expanded data access.
- Add `lastSeedDate` metadata to track staleness of seed data.

## Conclusion

All original audit findings have been resolved. The project has expanded significantly since the initial audit:
- 6 benchmarks → 12 benchmarks
- Pure mock mode → selective live/mock rollout
- No data source tracking → `dataSource` field through full pipeline
- Basic UI → Live/mock badges, score bars, weight indicators, status banners

Remaining hardening targets are testing (Phase 7) and deployment (Phase 8).
