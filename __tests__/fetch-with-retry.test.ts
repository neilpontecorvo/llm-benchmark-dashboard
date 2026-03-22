import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

/* ── helpers ───────────────────────────────────── */

const ok = (body = "{}") =>
  new Response(body, { status: 200, statusText: "OK" });
const err = (status: number) =>
  new Response("", { status, statusText: "Error" });

/* ── tests ─────────────────────────────────────── */

describe("fetchWithRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns immediately on a 200 response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(ok());
    const res = await fetchWithRetry("https://example.com", undefined, {
      maxAttempts: 3,
      label: "test",
    });
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on 500 and succeeds on second attempt", async () => {
    const mock = fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce(err(500)).mockResolvedValueOnce(ok());
    const res = await fetchWithRetry("https://example.com", undefined, {
      maxAttempts: 3,
      initialDelayMs: 10,
      label: "test",
    });
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("retries on 429 (rate limit)", async () => {
    const mock = fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce(err(429)).mockResolvedValueOnce(ok());
    const res = await fetchWithRetry("https://example.com", undefined, {
      maxAttempts: 3,
      initialDelayMs: 10,
      label: "test",
    });
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on 404 (non-retryable)", async () => {
    const mock = fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce(err(404));
    await expect(
      fetchWithRetry("https://example.com", undefined, {
        maxAttempts: 3,
        initialDelayMs: 10,
        label: "test",
      })
    ).rejects.toThrow("HTTP 404");
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("throws after maxAttempts exhausted", async () => {
    const mock = fetch as ReturnType<typeof vi.fn>;
    mock
      .mockResolvedValueOnce(err(503))
      .mockResolvedValueOnce(err(503))
      .mockResolvedValueOnce(err(503));
    await expect(
      fetchWithRetry("https://example.com", undefined, {
        maxAttempts: 3,
        initialDelayMs: 10,
        label: "test",
      })
    ).rejects.toThrow("HTTP 503");
    expect(mock).toHaveBeenCalledTimes(3);
  });

  it("retries on network errors", async () => {
    const mock = fetch as ReturnType<typeof vi.fn>;
    mock
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValueOnce(ok());
    const res = await fetchWithRetry("https://example.com", undefined, {
      maxAttempts: 3,
      initialDelayMs: 10,
      label: "test",
    });
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("respects timeout via AbortController", async () => {
    const mock = fetch as ReturnType<typeof vi.fn>;
    // Simulate a hanging request that rejects when aborted
    mock
      .mockImplementationOnce(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError"))
            );
          })
      )
      .mockResolvedValueOnce(ok());

    const res = await fetchWithRetry("https://example.com", undefined, {
      maxAttempts: 2,
      initialDelayMs: 10,
      timeoutMs: 50,
      label: "test",
    });
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });
});
