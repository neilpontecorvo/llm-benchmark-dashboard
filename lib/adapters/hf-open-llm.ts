import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkResult } from "@/lib/types";

/**
 * HuggingFace Open LLM Leaderboard.
 * Source: datasets-server rows API (JSON, no auth required).
 * Fetches top models by "Average ⬆️" score.
 *
 * ⚠️ RETIRED: This benchmark was officially retired by HuggingFace on March 13, 2025.
 * The datasets remain queryable but are effectively frozen history.
 * Kept for archival visibility — excluded from overall ranking (weight = 0%).
 *
 * Note: The dataset has ~4,500 models. We fetch 100 rows sorted by average
 * (the API doesn't support sorting, so we fetch a larger batch and sort client-side).
 */

const ROWS_API =
  "https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard%2Fcontents&config=default&split=train&offset=0&length=100";

interface HFRow {
  row: {
    fullname?: string;
    Model?: string;
    "Average ⬆️"?: number;
    "#Params (B)"?: number;
    Type?: string;
    "Hub License"?: string;
    Flagged?: boolean;
  };
}

export class HuggingFaceOpenLLMAdapter extends BaseAdapter {
  key = "hf_open_llm" as const;
  displayName = "Hugging Face Open LLM";
  sourceUrl = "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard";
  includedInOverall = false;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_HF_OPEN_LLM !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    // Fetch a larger batch since API doesn't support server-side sorting
    const res = await fetch(ROWS_API, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`HF Open LLM API failed: ${res.status}`);
    }

    const data = await res.json() as { rows: HFRow[] };

    const valid = data.rows
      .map((r) => r.row)
      .filter((r) => r["Average ⬆️"] != null && !r.Flagged && r.Model)
      .sort((a, b) => (b["Average ⬆️"] ?? 0) - (a["Average ⬆️"] ?? 0))
      .slice(0, limit);

    if (valid.length < 5) {
      throw new Error(
        `HF Open LLM returned only ${valid.length} valid rows; expected at least 5`
      );
    }

    const fetchedAt = new Date().toISOString();

    return this.normalizeLiveRows(
      valid.map((row, idx) => {
        const avg = row["Average ⬆️"] ?? 0;
        const modelName = row.fullname ?? row.Model ?? "Unknown";
        const params = row["#Params (B)"];
        const paramText = params ? `${params}B params` : null;

        return {
          id: `${this.key}:${modelName}:${idx + 1}`,
          benchmarkKey: this.key,
          fetchedAt,
          modelName,
          provider: inferOrgFromHFName(modelName),
          rank: idx + 1,
          rawScore: avg,
          rawScoreText: `${avg.toFixed(2)}`,
          normalizedScore: null as number | null,
          confidenceText: paramText,
          category: "open_only" as const,
          sourceUrl: this.sourceUrl,
          includedInOverall: this.includedInOverall
        };
      })
    );
  }
}

/** Extract org from HF model path format "org/model-name" */
function inferOrgFromHFName(name: string): string | undefined {
  const slash = name.indexOf("/");
  if (slash > 0) return name.slice(0, slash);
  return undefined;
}
