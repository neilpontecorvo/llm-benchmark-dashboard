import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkResult } from "@/lib/types";

/**
 * Arena Text-to-Image leaderboard.
 *
 * Live source: Official LMArena catalog JSON from GitHub.
 * Uses the "full" category which contains all models.
 *
 * Seed data retained as fallback if the JSON fetch fails.
 */

const LIVE_URL =
  "https://raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-image.json";

const SEED_DATA = [
  { model: "Gemini 3.1 Flash Image Preview (nano-banana-2) [web-search]", provider: "Google", elo: 1266, votes: 15317 },
  { model: "GPT Image 1.5 High Fidelity", provider: "OpenAI", elo: 1244, votes: 62556 },
  { model: "Gemini 3 Pro Image Preview 2K (nano-banana-pro)", provider: "Google", elo: 1235, votes: 58168 },
  { model: "Gemini 3 Pro Image Preview (nano-banana-pro)", provider: "Google", elo: 1232, votes: 82536 },
  { model: "MAI Image 2", provider: "Microsoft", elo: 1189, votes: 6221 },
  { model: "Reve v1.5", provider: "Reve", elo: 1177, votes: 7796 },
  { model: "Grok Imagine Image", provider: "xAI", elo: 1173, votes: 48767 },
  { model: "FLUX 2 Max", provider: "Black Forest Labs", elo: 1167, votes: 66012 },
  { model: "Grok Imagine Image Pro", provider: "xAI", elo: 1160, votes: 48363 },
  { model: "FLUX 2 Flex", provider: "Black Forest Labs", elo: 1158, votes: 101631 },
];

type ModelEntry = { rating: number; rating_q975: number; rating_q025: number };
type LeaderboardJSON = Record<string, Record<string, ModelEntry>>;

export class ArenaTextToImageAdapter extends BaseAdapter {
  key = "arena_text_to_image" as const;
  displayName = "Arena Text to Image";
  sourceUrl = "https://arena.ai/leaderboard";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_ARENA_TEXT_TO_IMAGE !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    try {
      const res = await fetch(LIVE_URL, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`LMArena image JSON fetch failed: ${res.status}`);

      const json = (await res.json()) as LeaderboardJSON;

      // Use the "full" category which includes all models
      const full = json["full"];
      if (!full) throw new Error("Missing 'full' category in leaderboard-image.json");

      const parsed = this.parseCategory(full, limit);
      if (parsed.length >= 5) return parsed;
    } catch {
      // Fall back to seed
    }

    return this.buildFromSeed(limit);
  }

  private parseCategory(data: Record<string, ModelEntry>, limit: number): BenchmarkResult[] {
    const ranked = Object.entries(data)
      .map(([modelId, entry]) => ({
        modelId,
        rating: entry.rating,
        ci: Math.round(entry.rating_q975 - entry.rating_q025),
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    const fetchedAt = new Date().toISOString();

    return this.normalizeLiveRows(
      ranked.map((row, idx) => ({
        id: `${this.key}:${row.modelId}:${idx + 1}`,
        benchmarkKey: this.key,
        fetchedAt,
        modelName: formatModelName(row.modelId),
        provider: inferImageProvider(row.modelId),
        rank: idx + 1,
        rawScore: Math.round(row.rating * 100) / 100,
        rawScoreText: `${row.rating.toFixed(1)} ELO`,
        normalizedScore: null as number | null,
        confidenceText: `±${row.ci}`,
        category: "text_to_image" as const,
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
      confidenceText: `${entry.votes.toLocaleString()} votes`,
      category: "text_to_image" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall,
    }));
    return this.normalizeLiveRows(rows);
  }
}

/** Convert model slug to display name */
function formatModelName(slug: string): string {
  return slug
    .split("-")
    .map((part) => {
      if (/^\d/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Infer provider from image model slug */
function inferImageProvider(slug: string): string | undefined {
  const s = slug.toLowerCase();
  if (s.includes("gemini") || s.includes("imagen")) return "Google";
  if (s.includes("gpt") || s.includes("dall")) return "OpenAI";
  if (s.includes("flux")) return "Black Forest Labs";
  if (s.includes("grok") || s.includes("imagine")) return "xAI";
  if (s.includes("mai")) return "Microsoft";
  if (s.includes("reve")) return "Reve";
  if (s.includes("midjourney")) return "Midjourney";
  if (s.includes("stable") || s.includes("sdxl")) return "Stability AI";
  if (s.includes("ideogram")) return "Ideogram";
  if (s.includes("playground")) return "Playground AI";
  return undefined;
}
