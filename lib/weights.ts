import { BenchmarkKey } from "@/lib/types";

export const BENCHMARK_WEIGHTS: Record<BenchmarkKey, number> = {
  artificial_analysis: 0.3,
  arena_text: 0.25,
  livebench: 0.2,
  swe_bench_verified: 0.15,
  aider_polyglot: 0.1,
  hf_open_llm: 0
};

export const BENCHMARK_NAMES: Record<BenchmarkKey, string> = {
  artificial_analysis: "Artificial Analysis Intelligence Index",
  arena_text: "LM Arena Text",
  swe_bench_verified: "SWE-bench Verified",
  aider_polyglot: "Aider Polyglot",
  livebench: "LiveBench",
  hf_open_llm: "Hugging Face Open LLM"
};
