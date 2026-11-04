import { assertLocalEndpoint } from "./endpoint";

export type FlociHealth =
  | {
      reachable: true;
      endpoint: string;
      version: string | null;
      edition: string | null;
      runningServices: string[];
    }
  | { reachable: false; endpoint: string; error: string };

type HealthPayload = {
  version?: unknown;
  edition?: unknown;
  services?: Record<string, unknown>;
};

/** Parses Floci's /_floci/health response. Exported for unit tests. */
export function parseHealth(endpoint: string, payload: unknown): FlociHealth {
  if (!payload || typeof payload !== "object") {
    return { reachable: false, endpoint, error: "Health endpoint returned a non-object response" };
  }
  const p = payload as HealthPayload;
  const services = p.services && typeof p.services === "object" ? p.services : {};
  const runningServices = Object.entries(services)
    .filter(([, state]) => state === "running" || state === "available")
    .map(([name]) => name)
    .sort();
  return {
    reachable: true,
    endpoint,
    version: typeof p.version === "string" ? p.version : null,
    edition: typeof p.edition === "string" ? p.edition : null,
    runningServices,
  };
}

/**
 * Asks Floci whether it is up. Uses Floci's own health endpoint, not an AWS API,
 * so it cannot accidentally hit real AWS even if misconfigured.
 */
export async function checkFlociHealth(
  rawEndpoint: string,
  { timeoutMs = 3000, fetchImpl = fetch }: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<FlociHealth> {
  const endpoint = assertLocalEndpoint(rawEndpoint);
  try {
    const res = await fetchImpl(`${endpoint}/_floci/health`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!res.ok) {
      return { reachable: false, endpoint, error: `HTTP ${res.status} from /_floci/health` };
    }
    return parseHealth(endpoint, await res.json());
  } catch (e) {
    const message =
      e instanceof Error && e.name === "TimeoutError"
        ? `No response within ${timeoutMs} ms. Is the floci container running? (docker ps)`
        : `Cannot connect: ${e instanceof Error ? e.message : String(e)}. Is the floci container running? (docker ps)`;
    return { reachable: false, endpoint, error: message };
  }
}
