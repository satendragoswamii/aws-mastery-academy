import { describe, expect, it } from "vitest";
import { assertLocalEndpoint, UnsafeEndpointError } from "@/lib/floci/endpoint";

describe("assertLocalEndpoint", () => {
  it.each([
    ["http://localhost:4566", "http://localhost:4566"],
    ["http://localhost:4566/", "http://localhost:4566"],
    ["  http://127.0.0.1:4566  ", "http://127.0.0.1:4566"],
    ["http://[::1]:4566", "http://[::1]:4566"],
  ])("accepts loopback endpoint %s", (input, expected) => {
    expect(assertLocalEndpoint(input)).toBe(expected);
  });

  it.each([
    ["real AWS regional endpoint", "https://s3.us-east-1.amazonaws.com"],
    ["real AWS over plain http", "http://dynamodb.us-east-1.amazonaws.com"],
    ["https to localhost", "https://localhost:4566"],
    ["LAN address", "http://192.168.1.10:4566"],
    ["all-interfaces address", "http://0.0.0.0:4566"],
    ["lookalike domain", "http://localhost.evil.example:4566"],
    ["embedded credentials", "http://user:pass@localhost:4566"],
    ["path", "http://localhost:4566/s3"],
    ["query", "http://localhost:4566/?x=1"],
    ["empty", ""],
    ["undefined", undefined],
    ["garbage", "not a url"],
  ])("rejects %s", (_label, input) => {
    expect(() => assertLocalEndpoint(input)).toThrow(UnsafeEndpointError);
  });
});
