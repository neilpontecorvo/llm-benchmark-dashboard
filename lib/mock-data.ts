import { BenchmarkAdapter, BenchmarkCategory, BenchmarkKey, BenchmarkResult } from "@/lib/types";
import { BENCHMARK_CATEGORIES } from "@/lib/weights";

const MODELS = [
  ["GPT-5.4 High", "OpenAI"],
  ["Claude Opus 4.6 Thinking", "Anthropic"],
  ["Gemini 3 Pro", "Google DeepMind"],
  ["Grok 3.5", "xAI"],
  ["Llama 4 Maverick 405B", "Meta"],
  ["DeepSeek V3.1", "DeepSeek"],
  ["Mistral Large 3", "Mistral"],
  ["Qwen 3 Max 235B", "Alibaba"],
  ["Cohere Command R+ 08-2025", "Cohere"],
  ["o4-mini High", "OpenAI"]
] as const;

function categoryFor(key: BenchmarkKey): BenchmarkCategory {
  return BENCHMARK_CATEGORIES[key] ?? "general";
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
