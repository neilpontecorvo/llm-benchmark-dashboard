import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkResult } from "@/lib/types";

/**
 * GPQA Diamond — Graduate-level reasoning benchmark.
 *
 * Live source: Artificial Analysis API v2 using evaluations.gpqa field.
 * Requires ARTIFICIAL_ANALYSIS_API_KEY env var.
 *
 * Seed data updated with broader coverage (replaces old Vellum top-5).
 * Falls back to seed if API key is missing or request fails.
 */

const API_URL = "https://artificialanalysis.ai/api/v2/data/llms/models";

const SEED_DATA = [
  { model: "Claude 3 Opus", provider: "Anthropic", score: 95.4 },
  { model: "GPT-5.2", provider: "OpenAI", score: 92.4 },
  { model: "Gemini 3 Pro", provider: "Google DeepMind", score: 91.9 },
  { model: "Claude Opus 4.6", provider: "Anthropic", score: 91.3 },
  { model: "Claude Sonnet 4.6", provider: "Anthropic", score: 89.9 },
  { model: "GPT-5.4 High", provider: "OpenAI", score: 89.1 },
  { model: "Grok 4.20", provider: "xAI", score: 87.5 },
  { model: "Gemini 3 Flash", provider: "Google DeepMind", score: 86.2 },
  { model: "DeepSeek V4", provider: "DeepSeek", score: 84.8 },
  { model: "Llama 4 Maverick", provider: "Meta", score: 82.3 },
];

interface AAModel {
  name?: string;
  provider?: string;
  evaluations?: {
    gpqa?: number;
  };
}

export class GPQADiamondAdapter extends BaseAdapter {
  key = "gpqa_diamond" as const;
  displayName = "GPQA Diamond";
  sourceUrl = "https://artificialanalysis.ai/leaderboards/models";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_GPQA_DIAMOND !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

    if (!apiKey) {
      console.warn("[gpqa-diamond] No AA API key — using seed data");
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
      const models = Array.isArray(data) ? data : (data.data ?? []);

      const withScore = models
        .filter((m) => m.evaluations?.gpqa != null)
        .map((m) => ({
          name: m.name ?? "Unknown",
          provider: m.provider,
          score: m.evaluations!.gpqa!,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (withScore.length < 3) {
        throw new Error("AA API returned only " + String(withScore.length) + " GPQA models");
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
          category: "reasoning" as const,
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
      category: "reasoning" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall,
    }));
    return this.normalizeLiveRows(rows);
  }
}
