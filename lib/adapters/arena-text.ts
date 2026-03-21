import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkCategory, BenchmarkResult } from "@/lib/types";

type ParsedRow = {
  modelName: string;
  provider?: string;
  rank: number | null;
  rawScore: number | null;
  rawScoreText?: string | null;
};

export class ArenaTextAdapter extends BaseAdapter {
  key = "arena_text" as const;
  displayName = "LM Arena Text";
  sourceUrl = "https://arena.ai/leaderboard/text/overall";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_ARENA_TEXT === "true" ? false : true;
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    const res = await fetch(this.sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml"
      },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`LM Arena request failed: ${res.status}`);
    }

    const html = await res.text();
    const rows = this.parseLeaderboard(html).slice(0, limit);

    if (!rows.length) {
      throw new Error("LM Arena parser returned zero rows");
    }

    if (rows.length < 10) {
      throw new Error(`LM Arena parser returned only ${rows.length} rows; expected at least 10`);
    }

    const fetchedAt = new Date().toISOString();

    return this.normalizeLiveRows(
      rows.map((row, idx) => ({
        id: `${this.key}:${row.modelName}:${idx + 1}`,
        benchmarkKey: this.key,
        fetchedAt,
        modelName: row.modelName,
        provider: row.provider,
        rank: row.rank ?? idx + 1,
        rawScore: row.rawScore,
        rawScoreText: row.rawScoreText ?? (row.rawScore != null ? String(row.rawScore) : null),
        normalizedScore: null,
        confidenceText: null,
        category: "community_preference" as BenchmarkCategory,
        sourceUrl: this.sourceUrl,
        includedInOverall: this.includedInOverall
      }))
    );
  }

  private parseLeaderboard(html: string): ParsedRow[] {
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const candidates: ParsedRow[] = [];
    const seen = new Set<string>();

    const pattern = /#?(\d{1,3})\s+([A-Za-z0-9][A-Za-z0-9 .:+\-_/()]+?)\s+(\d{3,5})/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const rank = Number(match[1]);
      const modelName = match[2].trim();
      const scoreStr = match[3];

      if (rank > 200) continue;
      if (Number(scoreStr) < 800) continue;

      const key = `${rank}:${modelName}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      candidates.push({
        modelName,
        rank,
        rawScore: Number(scoreStr),
        rawScoreText: scoreStr
      });
    }

    return candidates
      .sort((a, b) => {
        if (a.rank != null && b.rank != null) return a.rank - b.rank;
        if (a.rawScore != null && b.rawScore != null) return b.rawScore - a.rawScore;
        return a.modelName.localeCompare(b.modelName);
      })
      .filter((row, idx, arr) => idx === arr.findIndex((x) => x.modelName === row.modelName));
  }
}
