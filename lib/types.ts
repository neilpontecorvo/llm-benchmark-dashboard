export type BenchmarkKey =
  | "artificial_analysis"
  | "arena_text"
  | "swe_bench_verified"
  | "aider_polyglot"
  | "livebench"
  | "hf_open_llm";

export type BenchmarkCategory =
  | "general"
  | "coding"
  | "agentic"
  | "open_only"
  | "community_preference";

export interface RawBenchmarkRecord {
  id: string;
  benchmarkKey: BenchmarkKey;
  fetchedAt: string;
  sourceUrl: string;
  sourceVersion?: string;
  payload: unknown;
}

export interface BenchmarkResult {
  id: string;
  benchmarkKey: BenchmarkKey;
  fetchedAt: string;
  modelName: string;
  provider?: string;
  rank: number | null;
  rawScore: number | null;
  rawScoreText?: string | null;
  normalizedScore: number | null;
  confidenceText?: string | null;
  category: BenchmarkCategory;
  sourceUrl: string;
  includedInOverall: boolean;
}

export interface OverallResult {
  id: string;
  fetchedAt: string;
  modelName: string;
  provider?: string;
  includedBenchmarks: BenchmarkKey[];
  weightedScore: number;
  appearanceCount: number;
  overallRank: number;
}

export interface RefreshRunResponse {
  status: "success" | "partial" | "failed";
  startedAt: string;
  completedAt?: string;
  benchmarks: Array<{
    key: BenchmarkKey;
    status: "success" | "failed";
    error?: string;
    count?: number;
  }>;
}

export interface DashboardPayload {
  lastRefreshedAt: string | null;
  benchmarks: Record<BenchmarkKey, BenchmarkResult[]>;
  overallTop3: OverallResult[];
}

export interface BenchmarkAdapter {
  key: BenchmarkKey;
  displayName: string;
  sourceUrl: string;
  includedInOverall: boolean;
  fetchTopResults(limit?: number): Promise<BenchmarkResult[]>;
}
