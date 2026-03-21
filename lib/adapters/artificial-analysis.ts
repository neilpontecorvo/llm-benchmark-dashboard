import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkCategory, BenchmarkResult } from "@/lib/types";

/**
 * Artificial Analysis Intelligence Index.
 *
 * Live source: Official Artificial Analysis API v2.
 * Endpoint: https://artificialanalysis.ai/api/v2/data/llms/models
 * Uses evaluations.artificial_analysis_intelligence_index field.
 * Requires ARTIFICIAL_ANALYSIS_API_KEY env var.
 *
 * Falls back to seed data if API key is missing or request fails.
 */

const API_URL = "https://artificialanalysis.ai/api/v2/data/llms/models";

const SEED_DATA = [
  { model: "Claude Opus 4.6 Thinking", provider: "Anthropic", score: 92 },
  { model: "GPT-5.4 High", provider: "OpenAI", score: 91 },
  { model: "Gemini 3 Pro", provider: "Google DeepMind", score: 89 },
  { model: "Grok 4.20", provider: "xAI", score: 87 },
  { model: "Claude Opus 4.6", provider: "Anthropic", score: 86 },
  { model: "GPT-5.2", provider: "OpenAI", score: 85 },
  { model: "Gemini 3 Flash", provider: "Google DeepMind", score: 83 },
  { model: "DeepSeek V4", provider: "DeepSeek", score: 81 },
  { model: "Llama 4 Maverick", provider: "Meta", score: 79 },
  { model: "Mistral Large 3", provider: "Mistral AI", score: 77 },
];

interface AAModel {
  name?: string;
  provider?: string;
  evaluations?: {
    artificial_analysis_intelligence_index?: number;
    gpqa?: number;
    hle?: number;
  };
}

export class ArtificialAnalysisAdapter extends BaseAdapter {
  key = "artificial_analysis" as const;
  displayName = "Artificial Analysis Intelligence Index";
  sourceUrl = "https://artificialanalysis.ai/leaderboards/models";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_ARTIFICIAL_ANALYSIS !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

    if (!apiKey) {
      console.warn("[artificial-analysis] No API key — using seed data");
      return this.buildFromSeed(limit);
    }

    try {
      const res = await fetch(API_URL, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("AA API failed: " + String(res.status));

      const data = (await res.json()) as AAModel[] | { data: AAModel[] };

      // API may return array directly or wrapped in { data: [...] }
      const models = Array.isArray(data) ? data : (data.data ?? []);

      const withScore = models
        .filter((m) => m.evaluations?.artificial_analysis_intelligence_index != null)
        .map((m) => ({
          name: m.name ?? "Unknown",
          provider: m.provider,
          score: m.evaluations!.artificial_analysis_intelligence_index!,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (withScore.length < 5) {
        throw new Error("AA API returned only " + String(withScore.length) + " scored models");
      }

      const fetchedAt = new Date().toISOString();

      return this.normalizeLiveRows(
        withScore.map((row, idx) => ({
          id: `${this.key}:${row.name}:${idx + 1}`,
          benchmarkKey: this.key,
          fetchedAt,
          modelName: row.name,
          provider: row.provider,
          rank: idx + 1,
          rawScore: row.score,
          rawScoreText: String(row.score),
          normalizedScore: null as number | null,
          confidenceText: null as string | null,
          category: "general" as BenchmarkCategory,
          sourceUrl: this.sourceUrl,
          includedInOverall: this.includedInOverall,
        }))
      );
    } catch {
      // API failed — fall back to seed
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
      rawScoreText: String(entry.score),
      normalizedScore: null as number | null,
      confidenceText: null as string | null,
      category: "general" as BenchmarkCategory,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall,
    }));
    return this.normalizeLiveRows(rows);
  }
}
