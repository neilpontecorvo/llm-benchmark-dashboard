import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkResult } from "@/lib/types";

/**
 * Arena Image-to-Video leaderboard.
 * Source: https://arena.ai/leaderboard (Image to Video tab)
 * ELO-based community voting. No public JSON API — seeded from latest scrape.
 */

const SEED_DATA = [
  { model: "Grok Imagine Video 720p", provider: "xAI", elo: 1404, votes: 66616 },
  { model: "Veo 3.1 Audio 1080p", provider: "Google DeepMind", elo: 1402, votes: 9786 },
  { model: "Veo 3.1 Audio", provider: "Google DeepMind", elo: 1395, votes: 23406 },
  { model: "Veo 3.1 Fast Audio 1080p", provider: "Google DeepMind", elo: 1383, votes: 10273 },
  { model: "Grok Imagine Video 480p", provider: "xAI", elo: 1381, votes: 19518 },
  { model: "Veo 3.1 Fast Audio", provider: "Google DeepMind", elo: 1380, votes: 51820 },
  { model: "Vidu Q3 Pro", provider: "Shengshu Technology", elo: 1353, votes: 37094 },
  { model: "Wan 2.5 I2V Preview", provider: "Alibaba", elo: 1339, votes: 12023 },
  { model: "Kling v3 Pro", provider: "Kuaishou (KlingAI)", elo: 1334, votes: 4111 },
  { model: "Veo 3 Audio", provider: "Google DeepMind", elo: 1331, votes: 34535 }
];

export class ArenaImageToVideoAdapter extends BaseAdapter {
  key = "arena_image_to_video" as const;
  displayName = "Arena Image to Video";
  sourceUrl = "https://arena.ai/leaderboard";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_ARENA_IMAGE_TO_VIDEO !== "true";
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
      rawScore: entry.elo,
      rawScoreText: `${entry.elo} ELO`,
      normalizedScore: null as number | null,
      confidenceText: `${entry.votes.toLocaleString()} votes`,
      category: "image_to_video" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall
    }));
    return this.normalizeLiveRows(rows);
  }
}
