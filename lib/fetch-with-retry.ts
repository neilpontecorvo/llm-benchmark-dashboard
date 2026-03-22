/**
 * Fetch wrapper with exponential backoff and per-request timeout.
 *
 * Retries on transient failures (network errors, 429, 5xx).
 * Does NOT retry on 4xx (except 429) — those are permanent failures.
 */

export interface FetchRetryOptions {
  /** Maximum number of attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in ms before first retry (default: 1000) */
  initialDelayMs?: number;
  /** Per-request timeout in ms (default: 10000) */
  timeoutMs?: number;
  /** Tag for log messages (e.g. adapter name) */
  label?: string;
}

const DEFAULTS: Required<FetchRetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  timeoutMs: 10_000,
  label: "fetch",
};

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  opts?: FetchRetryOptions
): Promise<Response> {
  const { maxAttempts, initialDelayMs, timeoutMs, label } = {
    ...DEFAULTS,
    ...opts,
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) return res;

      // Non-retryable HTTP error → bail out immediately
      if (!isRetryable(res.status)) {
        throw new Error(`[${label}] HTTP ${res.status} (non-retryable)`);
      }

      // Retryable status — log and continue loop
      lastError = new Error(`[${label}] HTTP ${res.status}`);
      console.warn(
        `[${label}] Attempt ${attempt}/${maxAttempts} failed: HTTP ${res.status}`
      );
    } catch (err) {
      clearTimeout(timer);
      const wrapped =
        err instanceof Error ? err : new Error(String(err));

      // Re-throw non-retryable errors (e.g. 4xx) immediately
      if (wrapped.message.includes("(non-retryable)")) throw wrapped;

      lastError = wrapped;

      // AbortError = timeout
      const isTimeout = wrapped.name === "AbortError";
      console.warn(
        `[${label}] Attempt ${attempt}/${maxAttempts} failed: ${
          isTimeout ? `timeout (${timeoutMs}ms)` : wrapped.message
        }`
      );
    }

    // Wait before next attempt (exponential backoff: 1s, 2s, 4s …)
    if (attempt < maxAttempts) {
      const delay = initialDelayMs * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError ?? new Error(`[${label}] All ${maxAttempts} attempts failed`);
}
