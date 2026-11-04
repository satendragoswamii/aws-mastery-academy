/**
 * Floci endpoint guard.
 *
 * The single most important safety rule of the lab: every AWS call the
 * platform makes must go to the LOCAL emulator, never to real AWS.
 * This module is the only place an endpoint is accepted, and it rejects
 * anything that is not plain http on a loopback address.
 */

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export class UnsafeEndpointError extends Error {
  constructor(reason: string) {
    super(`Refusing to use AWS endpoint: ${reason}`);
    this.name = "UnsafeEndpointError";
  }
}

/** Validates and normalises a Floci endpoint URL (no trailing slash). */
export function assertLocalEndpoint(raw: string | undefined): string {
  if (!raw || raw.trim() === "") {
    throw new UnsafeEndpointError("no endpoint configured");
  }

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new UnsafeEndpointError(`"${raw}" is not a valid URL`);
  }

  if (url.protocol !== "http:") {
    throw new UnsafeEndpointError(
      `protocol must be http: (got ${url.protocol}). Floci runs without TLS locally.`,
    );
  }
  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    throw new UnsafeEndpointError(
      `host "${url.hostname}" is not a loopback address. Only localhost/127.0.0.1/::1 are allowed.`,
    );
  }
  if (url.username || url.password) {
    throw new UnsafeEndpointError("credentials must not be embedded in the URL");
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new UnsafeEndpointError("endpoint must not contain a path, query or fragment");
  }

  return `${url.protocol}//${url.host}`;
}
