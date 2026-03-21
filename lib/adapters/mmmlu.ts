import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkResult } from "@/lib/types";

/**
 * MMMLU — Massive Multilingual Multitask Language Understanding.
 * Source: https://vellum.ai/llm-leaderboard
 * Only top 5 are publicly displayed on Vellum.
 */

const SEED_DATA = [
  { model: "Gemini 3 Pro", provider: "Google DeepMind", score: 91.8 },
  { model: "Claude Opus 4.6", provider: "Anthropic", score: 91.1 },
  { model: "Claude Opus 4.5", provider: "Anthropic", score: 90.8 },
  { model: "Claude Opus 4.1", provider: "Anthropic", score: 89.5 },
  { model: "Claude Sonnet 4.6", provider: "Anthropic", score: 89.3 }
];

export class MmmluAdapter extends BaseAdapter {
  key = "mmmlu" as const;
  displayName = "MMMLU";
  sourceUrl = "https://vellum.ai/llm-leaderboard";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_MMMLU !== "true";
  }

  protected async fetchLive(_limit: number): Promise<BenchmarkResult[]> {
    return this.buildFromSeed(_limit);
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
      category: "multilingual" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall
    }));
    return this.normalizeLiveRows(rows);
  }
}
