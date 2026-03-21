import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkResult } from "@/lib/types";

/**
 * Arena Text-to-Video leaderboard.
 * Source: https://arena.ai/leaderboard (Text to Video tab)
 * ELO-based community voting. No public JSON API — seeded from latest scrape.
 */

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

export class ArenaTextToVideoAdapter extends BaseAdapter {
  key = "arena_text_to_video" as const;
  displayName = "Arena Text to Video";
  sourceUrl = "https://arena.ai/leaderboard";
  includedInOverall = false;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_ARENA_TEXT_TO_VIDEO !== "true";
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
      category: "text_to_video" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall
    }));
    return this.normalizeLiveRows(rows);
  }
}
