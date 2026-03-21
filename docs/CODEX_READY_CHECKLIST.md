# Codex Readiness Checklist

Use this checklist before handing implementation to Codex.

## Repository readiness
- [ ] `README.md` is current and matches actual project structure.
- [ ] `.env.example` includes every required environment variable.
- [ ] `package.json` scripts are valid and minimal.
- [ ] Prisma schema matches the intended MVP data model.
- [ ] Mock mode runs without any external credentials.
- [ ] Export routes have a clear dedicated render page.

## Product clarity
- [ ] Benchmark list is explicitly defined.
- [ ] Overall ranking policy is documented.
- [ ] Excluded benchmarks are tagged and explained.
- [ ] Failure handling is defined for partial refreshes.
- [ ] Stale data behavior is defined.

## Adapter rules
- [ ] One adapter per benchmark source.
- [ ] Every adapter returns the same normalized shape.
- [ ] Every adapter preserves source URL and fetch timestamp.
- [ ] Every adapter can fail without crashing the refresh pipeline.
- [ ] Last-known-good data policy is documented.

## Codex execution scope
- [ ] Phase 1: implement live adapters.
- [ ] Phase 2: add tests and fixtures.
- [ ] Phase 3: complete export flow.
- [ ] Phase 4: deploy and harden.

## Required acceptance checks
- [ ] `npm install` succeeds.
- [ ] `npm run db:generate` succeeds.
- [ ] `npm run db:push` succeeds.
- [ ] `npm run db:seed` succeeds.
- [ ] `npm run dev` starts cleanly.
- [ ] `POST /api/refresh` returns success or partial success.
- [ ] Dashboard renders with mock data.
- [ ] PDF and PNG export routes return files or a clear actionable error.

## Rules for Codex
- Keep changes incremental.
- Do not rewrite the whole project when a targeted change is enough.
- Preserve mock mode until live adapters are confirmed working.
- Do not silently change scoring policy.
- Add tests whenever a parser or normalization rule is added.
