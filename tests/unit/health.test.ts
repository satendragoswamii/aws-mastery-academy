import { describe, expect, it, vi } from "vitest";
import { checkFlociHealth, parseHealth } from "@/lib/floci/health";

const ok = (body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;

describe("parseHealth", () => {
  it("extracts version and running services", () => {
    const h = parseHealth("http://localhost:4566", {
      version: "2.4.0",
      edition: "community",
      services: { sqs: "running", s3: "running", fsx: "disabled" },
    });
    expect(h).toEqual({
      reachable: true,
      endpoint: "http://localhost:4566",
      version: "2.4.0",
      edition: "community",
      runningServices: ["s3", "sqs"],
    });
  });

  it("treats a non-object payload as unreachable", () => {
    expect(parseHealth("http://localhost:4566", "nope").reachable).toBe(false);
  });
});

describe("checkFlociHealth", () => {
  it("calls only the Floci health path on the local endpoint", async () => {
    const fetchImpl = ok({ version: "2.4.0", services: { s3: "running" } });
    const h = await checkFlociHealth("http://localhost:4566", { fetchImpl });
    expect(h.reachable).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith("http://localhost:4566/_floci/health", expect.anything());
  });

  it("reports HTTP errors", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 503 })) as unknown as typeof fetch;
    const h = await checkFlociHealth("http://localhost:4566", { fetchImpl });
    expect(h).toMatchObject({ reachable: false, error: expect.stringContaining("503") });
  });

  it("reports connection failures with a hint", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    const h = await checkFlociHealth("http://localhost:4566", { fetchImpl });
    expect(h).toMatchObject({ reachable: false, error: expect.stringContaining("docker ps") });
  });

  it("refuses a real-AWS endpoint before making any request", async () => {
    const fetchImpl = ok({});
    await expect(
      checkFlociHealth("https://s3.amazonaws.com", { fetchImpl }),
    ).rejects.toThrow(/Refusing/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe.runIf(process.env.FLOCI_LIVE === "1")("live Floci (FLOCI_LIVE=1)", () => {
  it("is reachable at the configured endpoint", async () => {
    const h = await checkFlociHealth(process.env.FLOCI_ENDPOINT ?? "http://localhost:4566");
    expect(h.reachable).toBe(true);
    if (h.reachable) expect(h.runningServices).toContain("s3");
  });
});
