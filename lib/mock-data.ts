import { BenchmarkAdapter, BenchmarkCategory, BenchmarkKey, BenchmarkResult } from "@/lib/types";

const MODELS = [
  ["OpenAI GPT-5", "OpenAI"],
  ["Anthropic Claude 4.5", "Anthropic"],
  ["Google Gemini 2.5 Pro", "Google"],
  ["xAI Grok 3", "xAI"],
  ["Meta Llama 4 Maverick", "Meta"],
  ["DeepSeek V3.1", "DeepSeek"],
  ["Mistral Large 2", "Mistral"],
  ["Qwen 3 Max", "Alibaba"],
  ["Cohere Command R+", "Cohere"],
  ["OpenAI o4", "OpenAI"]
] as const;

function categoryFor(key: BenchmarkKey): BenchmarkCategory {
  if (key === "swe_bench_verified" || key === "aider_polyglot") return "coding";
  if (key === "arena_text") return "community_preference";
  if (key === "hf_open_llm") return "open_only";
  return "general";
}

export function mockResultsForBenchmark(adapter: Pick<BenchmarkAdapter, "key" | "sourceUrl" | "includedInOverall">, limit = 10): BenchmarkResult[] {
  const now = new Date().toISOString();
  return MODELS.slice(0, limit).map(([modelName, provider], index) => {
    const base = 100 - index * 3 - (adapter.key.length % 5);
    return {
      id: `${adapter.key}-${index + 1}`,
      benchmarkKey: adapter.key,
      fetchedAt: now,
      modelName,
      provider,
      rank: index + 1,
      rawScore: Number((base + Math.random()).toFixed(2)),
      rawScoreText: `${(base + Math.random()).toFixed(2)}`,
      normalizedScore: Number((100 - index * 4.5).toFixed(2)),
      confidenceText: null,
      category: categoryFor(adapter.key),
      sourceUrl: adapter.sourceUrl,
      includedInOverall: adapter.includedInOverall
    };
  });
}
