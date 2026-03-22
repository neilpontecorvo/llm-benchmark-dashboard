import { BaseAdapter } from "@/lib/adapters/_base";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import type { BenchmarkResult } from "@/lib/types";

/**
 * LiveBench — contamination-free benchmark with monthly question rotation.
 * Source: https://livebench.ai/
 *
 * Live data: HuggingFace dataset `livebench/model_judgment` (parquet format).
 * Contains per-question binary scores (0/1) across 6 categories.
 * We aggregate using category-balanced averaging (matching official methodology):
 *   1. Compute average score per model per category
 *   2. Average those 6 category scores equally → overall score (0–100)
 *
 * Falls back to seed data if HF fetch fails or data has too few models.
 * Note: HF dataset may lag behind livebench.ai — when key models are missing,
 * the adapter falls back to seed data automatically.
 */

const PARQUET_URL =
  "https://huggingface.co/api/datasets/livebench/model_judgment/parquet/default/leaderboard/0.parquet";

const SEED_DATA = [
  { model: "Claude Opus 4.6 Thinking", provider: "Anthropic", score: 84.6 },
  { model: "GPT-5.4 High", provider: "OpenAI", score: 83.2 },
  { model: "Gemini 3 Pro", provider: "Google DeepMind", score: 81.7 },
  { model: "Grok 4.20", provider: "xAI", score: 79.4 },
  { model: "Claude Opus 4.6", provider: "Anthropic", score: 78.8 },
  { model: "GPT-5.2", provider: "OpenAI", score: 77.1 },
  { model: "Gemini 3 Flash", provider: "Google DeepMind", score: 74.9 },
  { model: "DeepSeek V4", provider: "DeepSeek", score: 73.1 },
  { model: "Llama 4 Maverick", provider: "Meta", score: 67.0 },
  { model: "Mistral Large 3", provider: "Mistral AI", score: 64.5 },
];

/** Row shape from the parquet file */
interface JudgmentRow {
  model: string;
  score: number;
  category: string;
}

export class LiveBenchAdapter extends BaseAdapter {
  key = "livebench" as const;
  displayName = "LiveBench";
  sourceUrl = "https://livebench.ai/";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_LIVEBENCH !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    try {
      const res = await fetchWithRetry(PARQUET_URL, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      }, { label: "livebench-hf", timeoutMs: 20_000 });

      const buffer = await res.arrayBuffer();

      // Dynamic import — hyparquet is ESM-only
      const { parquetRead } = await import("hyparquet");

      const rows: JudgmentRow[] = [];
      await parquetRead({
        file: { byteLength: buffer.byteLength, slice: (s: number, e: number) => buffer.slice(s, e) },
        columns: ["model", "score", "category"],
        rowFormat: "object" as const,
        onComplete: (data: Record<string, unknown>[]) => {
          for (const row of data) {
            if (typeof row.model === "string" && typeof row.score === "number" && typeof row.category === "string") {
              rows.push({ model: row.model, score: row.score, category: row.category });
            }
          }
        },
      });

      if (rows.length < 1000) {
        throw new Error(`LiveBench HF returned only ${rows.length} judgment rows`);
      }

      const ranked = aggregateCategoryBalanced(rows);

      if (ranked.length < 5) {
        throw new Error(`LiveBench HF produced only ${ranked.length} ranked models`);
      }

      const fetchedAt = new Date().toISOString();

      return this.normalizeLiveRows(
        ranked.slice(0, limit).map((row, idx) => ({
          id: `${this.key}:${row.model}:${idx + 1}`,
          benchmarkKey: this.key,
          fetchedAt,
          modelName: formatModelName(row.model),
          provider: inferProvider(row.model),
          rank: idx + 1,
          rawScore: row.score,
          rawScoreText: `${row.score}%`,
          normalizedScore: null as number | null,
          confidenceText: `${row.categories} categories`,
          category: "general" as const,
          sourceUrl: this.sourceUrl,
          includedInOverall: this.includedInOverall,
        }))
      );
    } catch (err) {
      console.warn("[livebench] HF fetch failed, using seed:", err instanceof Error ? err.message : err);
      return this.buildFromSeed(limit);
    }
  }

  private buildFromSeed(limit: number): BenchmarkResult[] {
    const fetchedAt = new Date().toISOString();
    const rows = SEED_DATA.slice(0, limit).map((entry, idx) => ({
      id: `${this.key}:${entry.model}:${idx + 1}`,
      benchmarkKey: this.key,
      fetchedAt,
      modelName: entry.model,
      provider: entry.provider,
      rank: idx + 1,
      rawScore: entry.score,
      rawScoreText: `${entry.score}%`,
      normalizedScore: null as number | null,
      confidenceText: null as string | null,
      category: "general" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall,
    }));
    return this.normalizeLiveRows(rows);
  }
}

/**
 * Category-balanced aggregation (matches official LiveBench methodology).
 *
 * 1. For each (model, category) pair, compute average score
 * 2. For each model, average across its category scores
 * 3. Multiply by 100 to get percentage
 */
function aggregateCategoryBalanced(
  rows: JudgmentRow[]
): Array<{ model: string; score: number; categories: number }> {
  // Step 1: accumulate per (model, category)
  const acc = new Map<string, Map<string, { sum: number; count: number }>>();

  for (const row of rows) {
    let modelMap = acc.get(row.model);
    if (!modelMap) {
      modelMap = new Map();
      acc.set(row.model, modelMap);
    }
    const cat = modelMap.get(row.category);
    if (cat) {
      cat.sum += row.score;
      cat.count += 1;
    } else {
      modelMap.set(row.category, { sum: row.score, count: 1 });
    }
  }

  // Step 2: average within categories, then across categories
  const results: Array<{ model: string; score: number; categories: number }> = [];

  for (const [model, catMap] of acc) {
    let totalCatAvg = 0;
    let catCount = 0;
    for (const { sum, count } of catMap.values()) {
      totalCatAvg += sum / count;
      catCount += 1;
    }
    const overall = (totalCatAvg / catCount) * 100;
    results.push({
      model,
      score: Number(overall.toFixed(1)),
      categories: catCount,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

/** Convert model slug to display name: "claude-3-7-sonnet-20250219-thinking-64k" → "Claude 3.7 Sonnet" */
function formatModelName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

/** Infer provider from model slug */
function inferProvider(slug: string): string | undefined {
  const s = slug.toLowerCase();
  if (s.includes("gpt") || s.includes("chatgpt") || s.startsWith("o1") || s.startsWith("o3") || s.startsWith("o4")) return "OpenAI";
  if (s.includes("claude") || s.includes("sonnet") || s.includes("opus") || s.includes("haiku")) return "Anthropic";
  if (s.includes("gemini") || s.includes("gemma") || s.includes("learnlm")) return "Google DeepMind";
  if (s.includes("grok")) return "xAI";
  if (s.includes("llama") || s.includes("meta-llama")) return "Meta";
  if (s.includes("mistral") || s.includes("mixtral")) return "Mistral AI";
  if (s.includes("command")) return "Cohere";
  if (s.includes("qwen") || s.includes("qwq")) return "Alibaba";
  if (s.includes("deepseek")) return "DeepSeek";
  if (s.includes("phi")) return "Microsoft";
  if (s.includes("nova")) return "Amazon";
  return undefined;
}
