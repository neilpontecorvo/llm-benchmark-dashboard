The strongest upgrades are now:

Artificial Analysis is no longer blocked at page-scrape level; it has an official API with benchmark fields, including artificial_analysis_intelligence_index, gpqa, and hle.
Arena Text and Arena Text-to-Image have official structured JSON in lmarena/arena-catalog. The repo itself points to raw GitHub JSON files.
LiveBench still does not present one clean public leaderboard JSON, but the official repo now documents a reproducible pipeline using Hugging Face judgments/answers plus show_livebench_result.py, which outputs all_groups.csv and all_tasks.csv.
Humanity’s Last Exam should no longer come from Vellum top-5. Scale Labs has the official public leaderboard with methodology and a larger ranked table.
HF Open LLM is still queryable through datasets, but the benchmark was officially retired on March 13, 2025. Treat it as archival, not current.

Best source map for the 12 benchmarks

1. Artificial Analysis Intelligence Index
Use the official Artificial Analysis API:
https://artificialanalysis.ai/api/v2/data/llms/models
Pull evaluations.artificial_analysis_intelligence_index. This is the correct path to replace the current mock/block. It requires an API key.

2. Arena Text
Use the official LMArena catalog JSON:
https://raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-text.json
The LMArena repo explicitly loads this file from PUBLIC_DATA_PREFIX. This is the cleanest upgrade from seed to live.

3. SWE-bench Verified
Keep the current official source:
https://raw.githubusercontent.com/swe-bench/swe-bench.github.io/master/data/leaderboards.json
The SWE-bench site repo states leaderboard data is stored in data/leaderboards.json.

4. Aider Polyglot
Keep the current official raw YAML source:
https://raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/polyglot_leaderboard.yml
This remains the right live source paired with Aider’s leaderboard docs.

5. LiveBench
Replace static seed with an official scripted live ingestion path, not a single JSON endpoint. Use:
https://github.com/LiveBench/LiveBench
plus the official HF datasets:
https://huggingface.co/datasets/livebench/model_judgment
https://huggingface.co/datasets/livebench/model_answer
The repo documents download_leaderboard.py and show_livebench_result.py, and outputs all_groups.csv / all_tasks.csv. That is the best current official path.

6. HF Open LLM
Keep the existing datasets-server approach only if you want this benchmark preserved for visibility:
https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard/contents
But do not treat it as an up-to-date active benchmark. HF retired it on March 13, 2025. The datasets remain, but they are effectively frozen history.

7. Arena Text-to-Image
Use the official LMArena catalog JSON:
https://raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-image.json
The official repo writes and loads this file directly. This should replace seed data.

8. Arena Text-to-Video
Use the official Arena leaderboard page directly:
https://arena.ai/leaderboard/text-to-video
The page is currently parseable server-side and exposes date, votes, model count, and ranked rows. I did not find a public official JSON equivalent for this Arena benchmark.

9. Arena Image-to-Video
Use the official Arena leaderboard page directly:
https://arena.ai/leaderboard/image-to-video
Same situation as T2V: current page is parseable and exposes ranked rows, votes, and model count, but I did not find an official public JSON file for this benchmark.

10. GPQA Diamond
Stop using Vellum top-5 as the primary feed. Best practical source found is the Artificial Analysis API via:
https://artificialanalysis.ai/api/v2/data/llms/models
using evaluations.gpqa.
Vals has a current GPQA benchmark page updated 3/17/2026, but it is not a clean public tabular export. Artificial Analysis is the better ingestion target.

11. Humanity’s Last Exam
Prefer the official Scale Labs leaderboard:
https://labs.scale.com/leaderboard/humanitys_last_exam
This is the strongest benchmark-owner source and should replace Vellum top-5. The page includes methodology and ranked results.

12. MMMLU
I did not find a strong official public API or official broad leaderboard endpoint.
Two viable options:
Conservative: keep seeded values from Vellum top-5.
Broader but weaker: use https://llm-stats.com/benchmarks/mmmlu
That page is current, but it explicitly says 0 verified, 38 self-reported, Status Unverified. Use only if you accept third-party unverified aggregation.

Recommended source policy

Immediate live upgrades
Artificial Analysis
Arena Text
Arena Text-to-Image
Humanity’s Last Exam
These all now have materially better public ingestion paths than your current project state.
Keep current live sources
SWE-bench Verified
Aider Polyglot
Their existing endpoints are still correct.
Needs scripted collection, not simple fetch
LiveBench
Official path exists, but it is repo/HF/script-driven.
Needs page parsing
Arena Text-to-Video
Arena Image-to-Video
Official pages are usable now, but I did not find official public JSON equivalents.
Needs a trust-policy decision
GPQA Diamond
MMMLU
GPQA has a strong practical source via AA API; MMMLU still lacks a clean official public endpoint.
Should be labeled archival
HF Open LLM
Keep for historical visibility only.

Verification

Best implementation order for this repo:

Switch artificial-analysis.ts from mock/HTML assumptions to the official AA API.
Switch arena-text.ts to leaderboard-text.json.
Switch arena-text-to-image.ts to leaderboard-image.json.
Replace humanitys-last-exam.ts Vellum seed with Scale Labs.
Replace gpqa-diamond.ts Vellum seed with AA API evaluations.gpqa.
Rebuild livebench.ts around official LiveBench repo/HF script outputs.
Leave mmmlu.ts as seed unless you explicitly approve third-party unverified ingestion.
Mark hf-open-llm.ts in UI/docs as retired/archival.


The current public source picture is:

Artificial Analysis should move from HTML/mock to the official API. The API exposes get/data/llms/models and benchmark fields including artificial_analysis_intelligence_index, gpqa, and hle.
Arena Text should move to the official LMArena structured JSON feed in arena-catalog.
Arena Text-to-Image should move to the official LMArena structured JSON feed for image leaderboard data.
LiveBench should move off generic seed/manual language and use the official repo/Hugging Face scripted ingestion path; the repo documents download_leaderboard.py, show_livebench_result.py, and generated outputs like all_groups.csv and all_tasks.csv.
Arena Text-to-Video and Arena Image-to-Video can move from static seed wording to official page-parse + seed fallback. I did not find a confirmed public JSON feed for those two.
GPQA Diamond should move off Vellum and use Artificial Analysis API evaluations.gpqa.
Humanity’s Last Exam should move off Vellum and use the official Scale Labs leaderboard.
HF Open LLM can stay ingestible through the current source path, but it should be labeled retired / archival because the benchmark was officially retired on March 13, 2025.
MMMLU should remain seed-based for now. I did not find a strong official broad public endpoint worth promoting to live.
Verification

The handoff spec includes:

revised source map for all 12 benchmarks
exact adapters Codex should touch
ARTIFICIAL_ANALYSIS_API_KEY env addition
fallback rules for AA, LiveBench, Arena T2V/I2V, and HLE
exact docs that should be updated after implementation is verified
Next best move

Hand Codex the new revision spec first, then have it update README.md, ADAPTER_SPEC.md, IMPLEMENTATION_SEQUENCE.md, PROJECT_CONTEXT_BRIEF.md, CODEX_READY_CHECKLIST.md, PROJECT_SYSTEM_PROMPT.md, CODEX_PROMPT.md, STRICT_AUDIT_FINDINGS.md, and PROJECT_IMPLEMENTATION_BACKLOG.md only after the adapter changes are merged and tested.