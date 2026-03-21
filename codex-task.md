Build a production-quality MVP web app named "LLM Benchmark Dashboard".

Requirements:
- Next.js 15 + TypeScript + Tailwind + minimal modern UI
- Prisma + SQLite for MVP
- Clean dashboard UI
- Manual refresh button
- PDF export button
- PNG export button
- Show top 10 models per benchmark
- Show overall top 3 across approved benchmarks only
- Persist latest refresh results in database
- Persist refresh logs
- Use typed adapters per benchmark source

Benchmarks to support:
1. Artificial Analysis Intelligence Index
2. LM Arena Text leaderboard
3. SWE-bench Verified
4. Aider Polyglot leaderboard
5. LiveBench
6. Hugging Face Open LLM leaderboard (display only; exclude from default overall ranking)

Rules:
- Do not average raw scores across benchmarks
- Implement per-benchmark normalization to 0-100
- Implement weighted overall scoring
- Add adapter-level error handling
- Add loading and stale-data states
- Add last-refreshed timestamp
- Add source links in UI
- Use a dedicated export page for Playwright PDF/PNG generation
- Use strict TypeScript
- Add seed/mock mode so the UI runs even if a source parser fails
- Add README with setup, commands, architecture, and limitations

Deliverables:
- Full app scaffold
- Working API routes
- Database schema
- Adapters
- Normalization logic
- Export logic
- README
- Basic parser strategy notes per benchmark source
