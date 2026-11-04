import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

const base = { DATABASE_URL: "postgres://a:b@127.0.0.1:5433/academy" };

describe("parseEnv", () => {
  it("applies safe defaults", () => {
    const env = parseEnv(base);
    expect(env.FLOCI_ENDPOINT).toBe("http://localhost:4566");
    expect(env.FLOCI_REGION).toBe("us-east-1");
    expect(env.SESSION_TTL_DAYS).toBe(14);
  });

  it("refuses a non-local Floci endpoint at startup", () => {
    expect(() => parseEnv({ ...base, FLOCI_ENDPOINT: "https://sqs.us-east-1.amazonaws.com" })).toThrow(
      /Refusing to use AWS endpoint/,
    );
  });

  it("rejects a missing or malformed DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
    expect(() => parseEnv({ DATABASE_URL: "mysql://x" })).toThrow(/postgres/);
  });

  it("rejects an invalid region and session TTL", () => {
    expect(() => parseEnv({ ...base, FLOCI_REGION: "mars" })).toThrow(/FLOCI_REGION/);
    expect(() => parseEnv({ ...base, SESSION_TTL_DAYS: "0" })).toThrow(/SESSION_TTL_DAYS/);
  });
});
