# Project Asset Index — Revised

Last updated: 2026-03-21
Project: **LLM Benchmark Dashboard**
Status: **Reconciled against currently uploaded project assets**

## Purpose

This index reflects the **actual asset set currently present** in project storage and clarifies each file’s role, priority, and when to use it.

## Asset inventory

| Priority | File | Status | Purpose | Primary Use |
|---|---|---:|---|---|
| 1 | `README.md` | Present | Primary repository overview | First-pass project orientation; benchmark list; weights; routes; env; structure |
| 2 | `ADAPTER_SPEC.md` | Present | Adapter contract and result schema | Adapter implementation rules; parsing/output consistency |
| 3 | `IMPLEMENTATION_SEQUENCE.md` | Present | Phase/status tracker | Current implementation state; completed vs open work |
| 4 | `CODEX_READY_CHECKLIST.md` | Present | Readiness and acceptance checklist | Pre-handoff validation; remaining hardening targets |
| 5 | `CODEX_PROMPT.md` | Present | Codex execution brief | Coding-agent handoff prompt |
| 6 | `STRICT_AUDIT_FINDINGS.md` | Present | Audit resolution log | Resolved technical findings; current known limitations |
| 7 | `PROJECT_SYSTEM_PROMPT.md` | Present | Full project operating prompt | Main project-level instruction set |
| 8 | `PROJECT_CONTEXT_BRIEF.md` | Present | Concise current-state summary | Fast onboarding for new chat, agent, or contributor |
| 9 | `PROJECT_IMPLEMENTATION_BACKLOG.md` | Present | Ordered open-work list | Remaining engineering tasks by priority |
| 10 | `PROJECT_HANDOFF.md` | Present | Clean execution handoff | Short implementation brief for Codex/agent continuation |
| 11 | `PROJECT_SOURCE_MANIFEST.json` | Present | Machine-readable source manifest | Source indexing; ingestion; asset metadata |
| 12 | `PROJECT_ASSETS_README.md` | Present | Asset-pack overview | Human-readable summary of the asset bundle |
| 13 | `PROJECT_ASSET_INDEX.md` | Present | Legacy asset index | Superseded by this revised index |

## Reconciled notes

### Confirmed present
The following files are currently present in `/mnt/data`:

- `README.md`
- `ADAPTER_SPEC.md`
- `CODEX_READY_CHECKLIST.md`
- `CODEX_PROMPT.md`
- `IMPLEMENTATION_SEQUENCE.md`
- `STRICT_AUDIT_FINDINGS.md`
- `PROJECT_SYSTEM_PROMPT.md`
- `PROJECT_CONTEXT_BRIEF.md`
- `PROJECT_IMPLEMENTATION_BACKLOG.md`
- `PROJECT_HANDOFF.md`
- `PROJECT_SOURCE_MANIFEST.json`
- `PROJECT_ASSETS_README.md`
- `PROJECT_ASSET_INDEX.md`

### Referenced but not present
These assets are referenced in project docs but are **not currently present** in the uploaded asset set:

| File | Referenced In | Recommended Action |
|---|---|---|
| `PROJECT_SHORT_INSTRUCTIONS.md` | `PROJECT_ASSET_INDEX.md`, `PROJECT_ASSETS_README.md` | Create it if a short custom-instructions asset is still required |
| `STRICT_AUDIT_PATCH.diff` | `PROJECT_SOURCE_MANIFEST.json` | Remove from manifest unless the patch file is added back |
| `codex-task.md` | `PROJECT_SYSTEM_PROMPT.md`, `PROJECT_SOURCE_MANIFEST.json` | Remove references unless that condensed task brief is restored |
| `benchmark-report-2026-03-21T10-00-44.121Z.pdf` | `PROJECT_SOURCE_MANIFEST.json` | Remove from manifest unless exported artifact is added to project storage |
| `benchmark-report-2026-03-21T10-00-57.660Z.png` | `PROJECT_SOURCE_MANIFEST.json` | Remove from manifest unless exported artifact is added to project storage |

## Recommended source-of-truth order

Use this order when project documents overlap or conflict:

1. `README.md`
2. `ADAPTER_SPEC.md`
3. `IMPLEMENTATION_SEQUENCE.md`
4. `CODEX_READY_CHECKLIST.md`
5. `CODEX_PROMPT.md`
6. `STRICT_AUDIT_FINDINGS.md`
7. `PROJECT_SYSTEM_PROMPT.md`
8. `PROJECT_CONTEXT_BRIEF.md`
9. `PROJECT_IMPLEMENTATION_BACKLOG.md`
10. `PROJECT_HANDOFF.md`
11. `PROJECT_SOURCE_MANIFEST.json`
12. `PROJECT_ASSETS_README.md`
13. `PROJECT_ASSET_INDEX.md`

## Asset usage map

| Need | Best file |
|---|---|
| Understand the whole repo quickly | `README.md` |
| Implement or fix adapters | `ADAPTER_SPEC.md` |
| See what is done vs open | `IMPLEMENTATION_SEQUENCE.md` |
| Verify repo handoff readiness | `CODEX_READY_CHECKLIST.md` |
| Hand the repo to Codex | `CODEX_PROMPT.md` or `PROJECT_HANDOFF.md` |
| Apply the full project operating rules | `PROJECT_SYSTEM_PROMPT.md` |
| Start a new chat with fast context | `PROJECT_CONTEXT_BRIEF.md` |
| Work from prioritized open tasks | `PROJECT_IMPLEMENTATION_BACKLOG.md` |
| Drive source indexing or RAG ingest | `PROJECT_SOURCE_MANIFEST.json` |
| Explain the asset bundle to a human reviewer | `PROJECT_ASSETS_README.md` |

## Recommended cleanup

1. Replace the current `PROJECT_ASSET_INDEX.md` content with this revised version.
2. Update `PROJECT_SOURCE_MANIFEST.json` so it only lists assets actually present.
3. Either create `PROJECT_SHORT_INSTRUCTIONS.md` or remove all references to it.
4. Remove stale references to `STRICT_AUDIT_PATCH.diff`, `codex-task.md`, and missing export artifacts unless they are intentionally restored.

## Current assessment

The asset pack is structurally solid, but the index and manifest are **not yet fully synchronized** with the actual uploaded files. The main issue is not content quality; it is asset-list drift.
