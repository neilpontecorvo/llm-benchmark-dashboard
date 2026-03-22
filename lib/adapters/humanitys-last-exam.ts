import { BaseAdapter } from "@/lib/adapters/_base";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import type { BenchmarkResult } from "@/lib/types";

/**
 * Humanity's Last Exam — expert-level multidomain benchmark.
 *
 * Live sources (tried in order):
 * 1. Artificial Analysis API v2 — evaluations.hle field (structured JSON, reliable)
 * 2. Scale Labs official leaderboard — HTML parse (fragile, fallback)
 * 3. Seed data — hardcoded scores (last resort)
 *
 * HLE scores are percentages (0-100). AA API returns decimals (0-1) which are
 * converted to percentages for consistency.
 */

const AA_API_URL = "https://artificialanalysis.ai/api/v2/data/llms/models";
const LIVE_URL = "https://labs.scale.com/leaderboard/humanitys_last_exam";

interface AAModel {
  name?: string;
  model_creator?: { name?: string };
  evaluations?: { hle?: number };
}

const SEED_DATA = [
  { model: "Gemini 3 Pro", provider: "Google DeepMind", score: 37.52, ci: 1.90 },
  { model: "GPT-5.4 High", provider: "OpenAI", score: 36.24, ci: 1.88 },
  { model: "Claude Opus 4.6 Thinking", provider: "Anthropic", score: 34.44, ci: 1.86 },
  { model: "GPT-5 Pro", provider: "OpenAI", score: 31.64, ci: 1.82 },
  { model: "GPT-5.2", provider: "OpenAI", score: 27.80, ci: 1.75 },
  { model: "GPT-5", provider: "OpenAI", score: 25.32, ci: 1.70 },
  { model: "Claude Opus 4.5 Thinking", provider: "Anthropic", score: 25.20, ci: 1.70 },
  { model: "Kimi K2.5", provider: "Moonshot AI", score: 24.37, ci: 1.68 },
  { model: "GPT-5.1 Thinking", provider: "OpenAI", score: 23.68, ci: 1.66 },
  { model: "Gemini 2.5 Pro Preview", provider: "Google DeepMind", score: 21.64, ci: 1.61 },
];

export class HumanitysLastExamAdapter extends BaseAdapter {
  key = "humanitys_last_exam" as const;
  displayName = "Humanity's Last Exam";
  sourceUrl = LIVE_URL;
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_HUMANITYS_LAST_EXAM !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    // Try AA API first (structured, reliable)
    const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
    if (apiKey) {
      try {
        const res = await fetchWithRetry(
          AA_API_URL,
          { headers: { "User-Agent": "Mozilla/5.0", "x-api-key": apiKey, Accept: "application/json" }, cache: "no-store" },
          { label: "hle-aa", timeoutMs: 15_000 }
        );
        {
          const json = (await res.json()) as { data?: AAModel[] } | AAModel[];
          const models = Array.isArray(json) ? json : (json.data ?? []);
          const withHle = models
            .filter((m) => m.evaluations?.hle != null && m.evaluations.hle > 0)
            .map((m) => ({
              name: m.name ?? "Unknown",
              provider: m.model_creator?.name,
              score: Number((m.evaluations!.hle! * 100).toFixed(2)),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

          if (withHle.length >= 5) {
            const fetchedAt = new Date().toISOString();
            return this.normalizeLiveRows(
              withHle.map((row, idx) => ({
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
                category: "general" as const,
                sourceUrl: this.sourceUrl,
                includedInOverall: this.includedInOverall,
              }))
            );
          }
        }
      } catch {
        // AA API failed — try Scale Labs
      }
    }

    // Fallback: Scale Labs HTML scraping
    try {
      const res = await fetchWithRetry(
        LIVE_URL,
        { headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" }, cache: "no-store" },
        { label: "hle-scale", timeoutMs: 15_000 }
      );

      const html = await res.text();
      const parsed = this.parseLeaderboard(html, limit);

      if (parsed.length >= 5) return parsed;
    } catch {
      // Scraping failed — fall back to seed
    }

    return this.buildFromSeed(limit);
  }

  private parseLeaderboard(html: string, limit: number): BenchmarkResult[] {
    // Strip HTML tags to get text, then parse score patterns
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const candidates: Array<{ name: string; score: number; ci?: number }> = [];
    const seen = new Set<string>();

    // Match model slugs followed by percentage scores
    const pattern = /([\w][\w\-.]+[\w])\s+(\d{1,3}\.\d{1,2})/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      const score = Number(match[2]);

      // Filter: HLE scores are typically 0-50 range, skip noise
      if (score > 80 || score < 1) continue;
      if (name.length < 3) continue;

      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      candidates.push({ name, score });
    }

    const sorted = candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (sorted.length < 5) return [];

    const fetchedAt = new Date().toISOString();

    return this.normalizeLiveRows(
      sorted.map((row, idx) => ({
        id: `${this.key}:${row.name}:${idx + 1}`,
        benchmarkKey: this.key,
        fetchedAt,
        modelName: formatModelName(row.name),
        provider: inferProvider(row.name),
        rank: idx + 1,
        rawScore: row.score,
        rawScoreText: `${row.score}%`,
        normalizedScore: null as number | null,
        confidenceText: row.ci ? `\u00b1${row.ci}%` : null,
        category: "general" as const,
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
      rawScore: entry.score,
      rawScoreText: `${entry.score}%`,
      normalizedScore: null as number | null,
      confidenceText: `\u00b1${entry.ci}%`,
      category: "general" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall,
    }));
    return this.normalizeLiveRows(rows);
  }
}

/** Convert model slug to display name */
function formatModelName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

/** Infer provider from model name/slug */
function inferProvider(name: string): string | undefined {
  const s = name.toLowerCase();
  if (s.includes("gpt") || s.includes("o1") || s.includes("o3") || s.includes("o4")) return "OpenAI";
  if (s.includes("claude") || s.includes("sonnet") || s.includes("opus")) return "Anthropic";
  if (s.includes("gemini") || s.includes("gemma")) return "Google DeepMind";
  if (s.includes("grok")) return "xAI";
  if (s.includes("llama")) return "Meta";
  if (s.includes("mistral") || s.includes("mixtral")) return "Mistral AI";
  if (s.includes("qwen")) return "Alibaba";
  if (s.includes("deepseek")) return "DeepSeek";
  if (s.includes("kimi")) return "Moonshot AI";
  return undefined;
}
