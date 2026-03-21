# Strict Audit Findings

This audit covered:
- TypeScript path alias consistency
- Tailwind and PostCSS compatibility
- Route/runtime behavior in refresh and export handlers
- Prisma seed and runtime validation

## Findings

### 1) TypeScript path aliases
Status: needs patch

Issue:
- `tsconfig.json` defines `paths` for `@/*` but does not define `baseUrl`.
- This is fragile for TypeScript resolution and for tools that consume tsconfig path aliases outside the Next.js build context.

Recommended patch:
- Add `"baseUrl": "."` to `compilerOptions`.

### 2) Tailwind/PostCSS compatibility
Status: acceptable, with one documentation note

Verified:
- `tailwind.config.ts` content globs cover `app`, `components`, and `lib`.
- `postcss.config.js` correctly enables `tailwindcss` and `autoprefixer`.
- `app/globals.css` correctly imports Tailwind layers.

No required code patch here.

### 3) Route/runtime behavior
Status: needs patch

Issues:
- Export routes launch Playwright and read from the file system, but do not explicitly declare `runtime = "nodejs"`.
- Export and refresh routes do not wrap failures in structured HTTP 500 responses.
- Export render page should be forced dynamic to avoid stale cached exports.

Recommended patch:
- Add `export const runtime = "nodejs"` to:
  - `app/api/benchmarks/route.ts`
  - `app/api/refresh/route.ts`
  - `app/api/export/pdf/route.ts`
  - `app/api/export/png/route.ts`
- Add `export const dynamic = "force-dynamic"` to the same routes and to `app/export/report/page.tsx`.
- Add try/catch handling in those route handlers.

### 4) Export helper robustness
Status: needs patch

Issues:
- `lib/export.ts` accepts `APP_URL` without validation.
- `page.goto` does not set an explicit timeout.

Recommended patch:
- Validate `APP_URL` with `new URL()`.
- Normalize trailing slash handling.
- Add explicit timeout to export page navigation.

### 5) Prisma runtime validation
Status: needs patch

Issues:
- `lib/db.ts` does not fail early with a clear message when `DATABASE_URL` is missing.
- `scripts/test-refresh.ts` does not disconnect Prisma on completion.
- `package.json` does not register Prisma seed config for `prisma db seed`.

Recommended patch:
- Add a small `getDatabaseUrl()` helper in `lib/db.ts`.
- Use PrismaClient with `datasourceUrl` from validated env.
- Add `prisma.$disconnect()` in `scripts/test-refresh.ts`.
- Add Prisma seed registration to `package.json`.

## Conclusion

The repo is close to Codex-ready. The main remaining hardening items are runtime declarations, error handling, Prisma validation, and the tsconfig alias fix.

See `docs/STRICT_AUDIT_PATCH.diff` for the exact patch set.
