export type BenchmarkKey =
  | "artificial_analysis"
  | "arena_text"
  | "swe_bench_verified"
  | "aider_polyglot"
  | "livebench"
  | "hf_open_llm"
  | "arena_text_to_image"
  | "arena_text_to_video"
  | "arena_image_to_video"
  | "gpqa_diamond"
  | "humanitys_last_exam"
  | "mmmlu";

export type BenchmarkCategory =
  | "general"
  | "coding"
  | "agentic"
  | "open_only"
  | "community_preference"
  | "text_to_image"
  | "text_to_video"
  | "image_to_video"
  | "reasoning"
  | "multilingual";

export interface RawBenchmarkRecord {
  id: string;
  benchmarkKey: BenchmarkKey;
  fetchedAt: string;
  sourceUrl: string;
  sourceVersion?: string;
  payload: unknown;
}

export type DataSource = "live" | "mock";

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
  dataSource?: DataSource;
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

export interface RefreshStatus {
  status: "success" | "partial" | "failed" | null;
  lastRefreshedAt: string | null;
  isStale: boolean;
  benchmarkStatuses: Array<{
    key: BenchmarkKey;
    succeeded: boolean;
  }>;
  errorSummary: string | null;
}

export interface DashboardPayload {
  lastRefreshedAt: string | null;
  refreshStatus: RefreshStatus;
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
