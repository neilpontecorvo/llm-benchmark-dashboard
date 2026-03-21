import { BenchmarkCategory, BenchmarkKey } from "@/lib/types";

export const BENCHMARK_WEIGHTS: Record<BenchmarkKey, number> = {
  artificial_analysis: 0.20,
  arena_text: 0.15,
  livebench: 0.13,
  swe_bench_verified: 0.13,
  aider_polyglot: 0.07,
  hf_open_llm: 0,
  arena_text_to_image: 0,
  arena_text_to_video: 0,
  arena_image_to_video: 0,
  gpqa_diamond: 0.13,
  humanitys_last_exam: 0.13,
  mmmlu: 0.06
};

export const BENCHMARK_NAMES: Record<BenchmarkKey, string> = {
  artificial_analysis: "Artificial Analysis Intelligence Index",
  arena_text: "LM Arena Text",
  swe_bench_verified: "SWE-bench Verified",
  aider_polyglot: "Aider Polyglot",
  livebench: "LiveBench",
  hf_open_llm: "Hugging Face Open LLM",
  arena_text_to_image: "Arena Text to Image",
  arena_text_to_video: "Arena Text to Video",
  arena_image_to_video: "Arena Image to Video",
  gpqa_diamond: "GPQA Diamond",
  humanitys_last_exam: "Humanity's Last Exam",
  mmmlu: "MMMLU"
};

export const BENCHMARK_CATEGORIES: Record<BenchmarkKey, BenchmarkCategory> = {
  artificial_analysis: "general",
  arena_text: "community_preference",
  swe_bench_verified: "coding",
  aider_polyglot: "coding",
  livebench: "general",
  hf_open_llm: "open_only",
  arena_text_to_image: "text_to_image",
  arena_text_to_video: "text_to_video",
  arena_image_to_video: "image_to_video",
  gpqa_diamond: "reasoning",
  humanitys_last_exam: "general",
  mmmlu: "multilingual"
};

export const BENCHMARK_DESCRIPTIONS: Record<BenchmarkKey, string> = {
  artificial_analysis: "Composite intelligence score evaluating reasoning, coding, math, and knowledge across frontier models.",
  arena_text: "Community-driven ELO ranking from blind pairwise comparisons of text model outputs on LMArena.",
  swe_bench_verified: "Measures ability to resolve real GitHub issues from popular Python repositories, verified by human reviewers.",
  aider_polyglot: "Tests AI coding assistants on editing tasks across multiple programming languages using the Aider framework.",
  livebench: "Continuously updated benchmark with fresh questions to prevent contamination, covering math, coding, reasoning, and more.",
  hf_open_llm: "Aggregated evaluation of open-weight models on standard NLP tasks. Retired March 2025 — shown for archival reference.",
  arena_text_to_image: "Community-driven ELO ranking from blind pairwise comparisons of AI-generated images on LMArena.",
  arena_text_to_video: "Community-driven ELO ranking from blind pairwise comparisons of AI-generated videos from text prompts.",
  arena_image_to_video: "Community-driven ELO ranking from blind pairwise comparisons of AI-generated videos from image inputs.",
  gpqa_diamond: "Graduate-level science questions written and validated by domain experts. Tests deep reasoning in physics, chemistry, and biology.",
  humanitys_last_exam: "Expert-crafted questions at the frontier of human knowledge. Scores are intentionally low — this benchmark is designed to challenge the best models.",
  mmmlu: "Massive Multitask Language Understanding across 14 languages, testing knowledge and reasoning beyond English.",
};

export const CATEGORY_LABELS: Record<BenchmarkCategory, string> = {
  general: "General",
  coding: "Coding",
  agentic: "Agentic",
  open_only: "Open-Only",
  community_preference: "Community Preference",
  text_to_image: "Text to Image",
  text_to_video: "Text to Video",
  image_to_video: "Image to Video",
  reasoning: "Reasoning",
  multilingual: "Multilingual"
};
