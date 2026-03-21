import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkCategory, BenchmarkResult } from "@/lib/types";

/**
 * LM Arena Text — community preference ELO ranking for text models.
 *
 * Live source: Official LMArena catalog JSON from GitHub.
 * The JSON contains sub-categories (chinese, coding, creative_writing).
 * Overall ranking is computed by averaging a model's rating across all
 * categories it appears in — matching how LMArena constructs the overall view.
 *
 * Seed data retained as fallback if the JSON fetch fails.
 */

const LIVE_URL =
  "https://raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-text.json";

const SEED_DATA = [
  { model: "Claude Opus 4.6 Thinking", provider: "Anthropic", elo: 1502, ci: 6, votes: 11801 },
  { model: "Claude Opus 4.6", provider: "Anthropic", elo: 1501, ci: 6, votes: 12546 },
  { model: "Gemini 3.1 Pro Preview", provider: "Google DeepMind", elo: 1493, ci: 6, votes: 14677 },
  { model: "Grok 4.20 Beta1", provider: "xAI", elo: 1492, ci: 7, votes: 7396 },
  { model: "Gemini 3 Pro", provider: "Google DeepMind", elo: 1486, ci: 4, votes: 41762 },
  { model: "GPT-5.4 High", provider: "OpenAI", elo: 1485, ci: 9, votes: 4965 },
  { model: "GPT-5.2 Chat Latest (2026-02-10)", provider: "OpenAI", elo: 1482, ci: 6, votes: 10140 },
  { model: "Grok 4.20 Beta 0309 Reasoning", provider: "xAI", elo: 1481, ci: 9, votes: 4504 },
  { model: "Gemini 3 Flash", provider: "Google DeepMind", elo: 1475, ci: 4, votes: 31060 },
  { model: "Claude Opus 4.5 Thinking 32K (2025-11-01)", provider: "Anthropic", elo: 1474, ci: 4, votes: 37036 },
];

/** Shape of the JSON: { "chinese": { "model-id": { rating, rating_q975, rating_q025 } }, ... } */
type CategoryData = Record<string, { rating: number; rating_q975: number; rating_q025: number }>;
type LeaderboardJSON = Record<string, CategoryData>;

export class ArenaTextAdapter extends BaseAdapter {
  key = "arena_text" as const;
  displayName = "LM Arena Text";
  sourceUrl = "https://arena.ai/leaderboard/text/overall";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_ARENA_TEXT !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    try {
      const res = await fetch(LIVE_URL, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`LMArena JSON fetch failed: ${res.status}`);

      const json = (await res.json()) as LeaderboardJSON;
      const parsed = this.parseOverallRankings(json, limit);

      if (parsed.length >= 5) return parsed;
      // Fall through to seed if too few results
    } catch {
      // JSON fetch failed — fall back to seed
    }

    return this.buildFromSeed(limit);
  }

  /**
   * Compute overall ranking by averaging each model's rating across
   * all categories it appears in.
   */
  private parseOverallRankings(json: LeaderboardJSON, limit: number): BenchmarkResult[] {
    const aggregated = new Map<string, { totalRating: number; count: number; q975: number; q025: number }>();

    for (const categoryData of Object.values(json)) {
      for (const [modelId, entry] of Object.entries(categoryData)) {
        const existing = aggregated.get(modelId);
        if (existing) {
          existing.totalRating += entry.rating;
          existing.count += 1;
          existing.q975 = Math.max(existing.q975, entry.rating_q975);
          existing.q025 = Math.min(existing.q025, entry.rating_q025);
        } else {
          aggregated.set(modelId, {
            totalRating: entry.rating,
            count: 1,
            q975: entry.rating_q975,
            q025: entry.rating_q025,
          });
        }
      }
    }

    const ranked = [...aggregated.entries()]
      .map(([modelId, data]) => ({
        modelId,
        avgRating: data.totalRating / data.count,
        categories: data.count,
        ci: Math.round(data.q975 - data.q025),
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);

    const fetchedAt = new Date().toISOString();

    return this.normalizeLiveRows(
      ranked.map((row, idx) => ({
        id: `${this.key}:${row.modelId}:${idx + 1}`,
        benchmarkKey: this.key,
        fetchedAt,
        modelName: formatModelName(row.modelId),
        provider: inferProvider(row.modelId),
        rank: idx + 1,
        rawScore: Math.round(row.avgRating * 100) / 100,
        rawScoreText: `${row.avgRating.toFixed(1)} ELO`,
        normalizedScore: null as number | null,
        confidenceText: `±${row.ci} · ${row.categories} categories`,
        category: "community_preference" as BenchmarkCategory,
        sourceUrl: this.sourceUrl,
        includedInOverall: this.includedInOverall,
      }))
    );
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
      rawScore: entry.elo,
      rawScoreText: `${entry.elo} ELO`,
      normalizedScore: null as number | null,
      confidenceText: `±${entry.ci} · ${entry.votes.toLocaleString()} votes`,
      category: "community_preference" as BenchmarkCategory,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall,
    }));
    return this.normalizeLiveRows(rows);
  }
}

/** Convert model slug to display name: "gpt-5.1-high" → "GPT 5.1 High" */
function formatModelName(slug: string): string {
  return slug
    .split("-")
    .map((part) => {
      if (/^\d/.test(part)) return part; // Keep version numbers as-is
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Infer provider from model slug */
function inferProvider(slug: string): string | undefined {
  const s = slug.toLowerCase();
  if (s.includes("gpt") || s.includes("o1") || s.includes("o3") || s.includes("o4")) return "OpenAI";
  if (s.includes("claude") || s.includes("sonnet") || s.includes("opus") || s.includes("haiku")) return "Anthropic";
  if (s.includes("gemini") || s.includes("gemma") || s.includes("palm")) return "Google DeepMind";
  if (s.includes("grok")) return "xAI";
  if (s.includes("llama") || s.includes("meta")) return "Meta";
  if (s.includes("mistral") || s.includes("mixtral")) return "Mistral AI";
  if (s.includes("command") || s.includes("cohere")) return "Cohere";
  if (s.includes("qwen")) return "Alibaba";
  if (s.includes("deepseek")) return "DeepSeek";
  if (s.includes("phi")) return "Microsoft";
  if (s.includes("ernie")) return "Baidu";
  if (s.includes("glm")) return "Zhipu AI";
  if (s.includes("kimi")) return "Moonshot AI";
  return undefined;
}
