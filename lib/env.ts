/**
 * Environment validation — runs on startup to catch missing configuration early.
 *
 * Required vars: DATABASE_URL (or default SQLite path)
 * Optional vars: APP_URL, USE_MOCK_DATA, USE_LIVE_* flags
 */

const LIVE_FLAGS = [
  "USE_LIVE_SWE_BENCH",
  "USE_LIVE_AIDER",
  "USE_LIVE_HF_OPEN_LLM",
  "USE_LIVE_ARENA_TEXT",
  "USE_LIVE_ARENA_TEXT_TO_IMAGE",
  "USE_LIVE_ARENA_TEXT_TO_VIDEO",
  "USE_LIVE_ARENA_IMAGE_TO_VIDEO",
  "USE_LIVE_GPQA_DIAMOND",
  "USE_LIVE_HUMANITYS_LAST_EXAM",
  "USE_LIVE_MMMLU",
  "USE_LIVE_LIVEBENCH",
  "USE_LIVE_ARTIFICIAL_ANALYSIS",
] as const;

export interface EnvReport {
  valid: boolean;
  warnings: string[];
  mockMode: boolean;
  liveFlagSummary: Record<string, boolean>;
}

export function validateEnv(): EnvReport {
  const warnings: string[] = [];

  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    warnings.push(
      "DATABASE_URL is not set — Prisma will use the default from schema.prisma"
    );
  }

  // Check APP_URL for export routes
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    warnings.push(
      "APP_URL is not set — export routes will use http://localhost:3000"
    );
  }

  // Mock mode check
  const mockMode = process.env.USE_MOCK_DATA === "true";

  // Compile live flag summary
  const liveFlagSummary: Record<string, boolean> = {};
  for (const flag of LIVE_FLAGS) {
    liveFlagSummary[flag] = process.env[flag] === "true";
  }

  const liveCount = Object.values(liveFlagSummary).filter(Boolean).length;
  if (!mockMode && liveCount === 0) {
    warnings.push(
      "USE_MOCK_DATA is false but no USE_LIVE_* flags are enabled — all adapters will use mock/seed data"
    );
  }

  // Check API keys for adapters that need them
  const aaLive = liveFlagSummary.USE_LIVE_ARTIFICIAL_ANALYSIS || liveFlagSummary.USE_LIVE_GPQA_DIAMOND;
  if (!mockMode && aaLive && !process.env.ARTIFICIAL_ANALYSIS_API_KEY) {
    warnings.push(
      "ARTIFICIAL_ANALYSIS_API_KEY is not set — AA and GPQA adapters will fall back to seed data"
    );
  }

  return {
    valid: true,
    warnings,
    mockMode,
    liveFlagSummary,
  };
}

/** Log environment status to console on startup */
export function logEnvStatus(): void {
  const report = validateEnv();

  const liveCount = Object.values(report.liveFlagSummary).filter(Boolean).length;
  const totalFlags = Object.keys(report.liveFlagSummary).length;

  console.log(`[env] Mock mode: ${report.mockMode ? "ON" : "OFF"}`);
  console.log(`[env] Live adapters: ${liveCount}/${totalFlags}`);

  if (report.warnings.length > 0) {
    for (const w of report.warnings) {
      console.warn(`[env] ⚠ ${w}`);
    }
  }
}
