import { BaseAdapter } from "@/lib/adapters/_base";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import type { BenchmarkResult } from "@/lib/types";

/**
 * Arena Text-to-Video leaderboard.
 *
 * Live source: Artificial Analysis API v2 media endpoint.
 * Endpoint: https://artificialanalysis.ai/api/v2/data/media/text-to-video
 * Returns ELO ratings with confidence intervals and appearance counts.
 * Requires ARTIFICIAL_ANALYSIS_API_KEY env var.
 *
 * Falls back to seed data if API key is missing or request fails.
 */

const API_URL = "https://artificialanalysis.ai/api/v2/data/media/text-to-video";

const SEED_DATA = [
  { model: "Veo 3.1 Audio 1080p", provider: "Google DeepMind", elo: 1381, votes: 5537 },
  { model: "Veo 3.1 Fast Audio 1080p", provider: "Google DeepMind", elo: 1378, votes: 5743 },
  { model: "Veo 3.1 Audio", provider: "Google DeepMind", elo: 1371, votes: 12604 },
  { model: "Sora 2 Pro", provider: "OpenAI", elo: 1367, votes: 18963 },
  { model: "Veo 3.1 Fast Audio", provider: "Google DeepMind", elo: 1366, votes: 25377 },
  { model: "Grok Imagine Video 720p", provider: "xAI", elo: 1358, votes: 33739 },
  { model: "Veo 3 Fast Audio", provider: "Google DeepMind", elo: 1351, votes: 25765 },
  { model: "Wan 2.6 T2V", provider: "Alibaba", elo: 1347, votes: 6446 },
  { model: "Sora 2", provider: "OpenAI", elo: 1342, votes: 25157 },
  { model: "Veo 3 Audio", provider: "Google DeepMind", elo: 1341, votes: 19331 }
];

interface AAMediaModel {
  name?: string;
  model_creator?: { name?: string };
  elo?: number;
  rank?: number;
  ci95?: string;
  appearances?: number;
}

export class ArenaTextToVideoAdapter extends BaseAdapter {
  key = "arena_text_to_video" as const;
  displayName = "Arena Text to Video";
  sourceUrl = "https://artificialanalysis.ai/leaderboards/video-generation";
  includedInOverall = false;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_ARENA_TEXT_TO_VIDEO !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

    if (!apiKey) {
      console.warn("[arena-text-to-video] No AA API key — using seed data");
      return this.buildFromSeed(limit);
    }

    try {
      const res = await fetchWithRetry(
        API_URL,
        { headers: { "User-Agent": "Mozilla/5.0", "x-api-key": apiKey, Accept: "application/json" }, cache: "no-store" },
        { label: "arena-t2v", timeoutMs: 15_000 }
      );

      const json = (await res.json()) as { data?: AAMediaModel[] } | AAMediaModel[];
      const models = Array.isArray(json) ? json : (json.data ?? []);

      const withElo = models
        .filter((m) => m.elo != null && m.name)
        .sort((a, b) => (b.elo ?? 0) - (a.elo ?? 0))
        .slice(0, limit);

      if (withElo.length < 5) {
        throw new Error("AA T2V API returned only " + String(withElo.length) + " models");
      }

      const fetchedAt = new Date().toISOString();

      return this.normalizeLiveRows(
        withElo.map((row, idx) => ({
          id: `${this.key}:${row.name}:${idx + 1}`,
          benchmarkKey: this.key,
          fetchedAt,
          modelName: row.name!,
          provider: row.model_creator?.name,
          rank: row.rank ?? idx + 1,
          rawScore: row.elo!,
          rawScoreText: `${row.elo} ELO`,
          normalizedScore: null as number | null,
          confidenceText: row.ci95 ? `CI95: ${row.ci95}` : (row.appearances ? `${row.appearances.toLocaleString()} appearances` : null),
          category: "text_to_video" as const,
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
      rawScore: entry.elo,
      rawScoreText: `${entry.elo} ELO`,
      normalizedScore: null as number | null,
      confidenceText: `${entry.votes.toLocaleString()} votes`,
      category: "text_to_video" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall
    }));
    return this.normalizeLiveRows(rows);
  }
}
