# LLM Benchmark Dashboard — Project Assets Pack

This asset pack converts the uploaded repository documentation into reusable project-level assets for ChatGPT Projects, Codex handoff, and source indexing.

## Files

1. `PROJECT_SYSTEM_PROMPT.md`
   - Full project-level system prompt for ChatGPT/Codex use.
2. `PROJECT_CONTEXT_BRIEF.md`
   - Snapshot of current architecture, rules, status, and open work.
3. `PROJECT_SOURCE_MANIFEST.json`
   - Machine-readable source manifest for the assets currently present in project storage.
4. `PROJECT_IMPLEMENTATION_BACKLOG.md`
   - Ordered backlog aligned to remaining phases.
5. `PROJECT_HANDOFF.md`
   - Clean execution handoff for Codex or another coding agent.
6. `PROJECT_ASSETS_README.md`
   - Human-readable summary of the asset bundle.

## Intended use

- Use `PROJECT_SYSTEM_PROMPT.md` as the main project prompt.
- Use `PROJECT_SOURCE_MANIFEST.json` and the original docs for source indexing.
- Use `PROJECT_HANDOFF.md` when passing execution to Codex.
- Use `PROJECT_IMPLEMENTATION_BACKLOG.md` to track remaining work.
- Treat this file as the human-readable overview of the asset pack.
