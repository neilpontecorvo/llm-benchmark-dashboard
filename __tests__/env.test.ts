import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/env";

describe("validateEnv", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns valid report with defaults", () => {
    delete process.env.DATABASE_URL;
    delete process.env.APP_URL;
    delete process.env.USE_MOCK_DATA;

    const report = validateEnv();

    expect(report.valid).toBe(true);
    expect(report.warnings.length).toBeGreaterThan(0);
    expect(report.mockMode).toBe(false); // USE_MOCK_DATA not "true"
  });

  it("detects mock mode", () => {
    process.env.USE_MOCK_DATA = "true";
    const report = validateEnv();
    expect(report.mockMode).toBe(true);
  });

  it("tracks live flag statuses", () => {
    process.env.USE_LIVE_SWE_BENCH = "true";
    process.env.USE_LIVE_AIDER = "false";

    const report = validateEnv();

    expect(report.liveFlagSummary.USE_LIVE_SWE_BENCH).toBe(true);
    expect(report.liveFlagSummary.USE_LIVE_AIDER).toBe(false);
  });

  it("warns when no live flags are enabled and mock is off", () => {
    process.env.USE_MOCK_DATA = "false";
    // Ensure no live flags are set
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("USE_LIVE_")) {
        delete process.env[key];
      }
    }

    const report = validateEnv();
    const liveWarning = report.warnings.find((w) => w.includes("no USE_LIVE_"));
    expect(liveWarning).toBeDefined();
  });
});
