import { BaseAdapter } from "@/lib/adapters/_base";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import type { BenchmarkResult } from "@/lib/types";

/**
 * MMMLU — Massive Multilingual Multitask Language Understanding.
 *
 * Live source: Artificial Analysis API v2 — evaluations.mmlu_pro field.
 * Endpoint: https://artificialanalysis.ai/api/v2/data/llms/models
 * Requires ARTIFICIAL_ANALYSIS_API_KEY env var.
 *
 * Falls back to seed data if API key is missing or request fails.
 * Note: Many models in the AA API have null mmlu_pro, so results may be limited.
 */

const API_URL = "https://artificialanalysis.ai/api/v2/data/llms/models";

const SEED_DATA = [
  { model: "Gemini 3 Pro", provider: "Google DeepMind", score: 91.8 },
  { model: "Claude Opus 4.6 Thinking", provider: "Anthropic", score: 91.1 },
  { model: "GPT-5.4 High", provider: "OpenAI", score: 90.8 },
  { model: "Claude Opus 4.6", provider: "Anthropic", score: 89.5 },
  { model: "Claude Sonnet 4.6", provider: "Anthropic", score: 89.3 }
];

interface AAModel {
  name?: string;
  model_creator?: { name?: string };
  evaluations?: { mmlu_pro?: number };
}

export class MmmluAdapter extends BaseAdapter {
  key = "mmmlu" as const;
  displayName = "MMMLU";
  sourceUrl = "https://artificialanalysis.ai/leaderboards/models";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_MMMLU !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

    if (!apiKey) {
      console.warn("[mmmlu] No AA API key — using seed data");
      return this.buildFromSeed(limit);
    }

    try {
      const res = await fetchWithRetry(
        API_URL,
        { headers: { "User-Agent": "Mozilla/5.0", "x-api-key": apiKey, Accept: "application/json" }, cache: "no-store" },
        { label: "mmmlu", timeoutMs: 15_000 }
      );

      const json = (await res.json()) as { data?: AAModel[] } | AAModel[];
      const models = Array.isArray(json) ? json : (json.data ?? []);

      const withScore = models
        .filter((m) => m.evaluations?.mmlu_pro != null && m.evaluations.mmlu_pro > 0)
        .map((m) => ({
          name: m.name ?? "Unknown",
          provider: m.model_creator?.name,
          score: Number((m.evaluations!.mmlu_pro! * 100).toFixed(1)),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (withScore.length < 3) {
        console.warn("[mmmlu] AA API returned only " + String(withScore.length) + " MMLU-Pro models — using seed");
        return this.buildFromSeed(limit);
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
          rawScoreText: `${row.score}%`,
          normalizedScore: null as number | null,
          confidenceText: null as string | null,
          category: "multilingual" as const,
          sourceUrl: this.sourceUrl,
          includedInOverall: this.includedInOverall,
        }))
      );
    } catch {
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
      category: "multilingual" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall
    }));
    return this.normalizeLiveRows(rows);
  }
}
