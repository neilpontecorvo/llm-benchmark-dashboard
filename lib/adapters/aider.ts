import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkResult } from "@/lib/types";

/**
 * Aider Polyglot leaderboard.
 * Source: YAML data hosted on GitHub at Aider-AI/aider repo.
 * Tests 225 Exercism coding exercises across C++, Go, Java, JS, Python, Rust.
 * Key metric: pass_rate_2 (percent passing on second attempt).
 */

const DATA_URL =
  "https://raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/polyglot_leaderboard.yml";

interface AiderEntry {
  model: string;
  pass_rate_2: number;
  total_cost: number;
  edit_format: string;
  test_cases: number;
  date: string;
  reasoning_effort?: string;
}

export class AiderAdapter extends BaseAdapter {
  key = "aider_polyglot" as const;
  displayName = "Aider Polyglot";
  sourceUrl = "https://aider.chat/docs/leaderboards/";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_AIDER !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    const res = await fetch(DATA_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`Aider YAML fetch failed: ${res.status}`);
    }

    const text = await res.text();
    const entries = parseSimpleYaml(text);

    // Deduplicate: keep best pass_rate_2 per model name
    const best = new Map<string, AiderEntry>();
    for (const entry of entries) {
      const existing = best.get(entry.model);
      if (!existing || entry.pass_rate_2 > existing.pass_rate_2) {
        best.set(entry.model, entry);
      }
    }

    const sorted = [...best.values()]
      .sort((a, b) => b.pass_rate_2 - a.pass_rate_2)
      .slice(0, limit);

    if (sorted.length < 10) {
      throw new Error(
        `Aider returned only ${sorted.length} unique models; expected at least 10`
      );
    }

    const fetchedAt = new Date().toISOString();

    return this.normalizeLiveRows(
      sorted.map((entry, idx) => ({
        id: `${this.key}:${entry.model}:${idx + 1}`,
        benchmarkKey: this.key,
        fetchedAt,
        modelName: entry.model,
        provider: inferProvider(entry.model),
        rank: idx + 1,
        rawScore: entry.pass_rate_2,
        rawScoreText: `${entry.pass_rate_2}%`,
        normalizedScore: null as number | null,
        confidenceText: entry.total_cost > 0 ? `$${entry.total_cost.toFixed(2)} cost` : null,
        category: "coding" as const,
        sourceUrl: this.sourceUrl,
        includedInOverall: this.includedInOverall
      }))
    );
  }
}

/**
 * Minimal YAML list parser — Aider's YAML is a flat list of objects.
 * No need for a full YAML library; we just split on "- dirname:" entries.
 */
function parseSimpleYaml(text: string): AiderEntry[] {
  const entries: AiderEntry[] = [];
  const blocks = text.split(/^- /m).filter(Boolean);

  for (const block of blocks) {
    const get = (key: string): string | undefined => {
      const match = block.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "m"));
      return match?.[1]?.trim();
    };

    const model = get("model");
    const passRate2 = get("pass_rate_2");
    if (!model || !passRate2) continue;

    entries.push({
      model,
      pass_rate_2: parseFloat(passRate2),
      total_cost: parseFloat(get("total_cost") ?? "0"),
      edit_format: get("edit_format") ?? "unknown",
      test_cases: parseInt(get("test_cases") ?? "225", 10),
      date: get("date") ?? "",
      reasoning_effort: get("reasoning_effort")
    });
  }

  return entries;
}

function inferProvider(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("gpt") || lower.includes("o3") || lower.includes("o4") || lower.includes("o1")) return "OpenAI";
  if (lower.includes("claude") || lower.includes("sonnet") || lower.includes("opus") || lower.includes("haiku")) return "Anthropic";
  if (lower.includes("gemini")) return "Google DeepMind";
  if (lower.includes("grok")) return "xAI";
  if (lower.includes("llama") || lower.includes("codellama")) return "Meta";
  if (lower.includes("deepseek")) return "DeepSeek";
  if (lower.includes("mistral") || lower.includes("codestral")) return "Mistral";
  if (lower.includes("qwen")) return "Alibaba";
  if (lower.includes("command")) return "Cohere";
  return undefined as unknown as string;
}
