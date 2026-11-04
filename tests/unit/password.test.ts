import { describe, expect, it } from "vitest";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/auth/password";

describe("passwords", () => {
  it("hashes with bcrypt and verifies", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
    expect(hash).not.toContain("correct-horse-battery");
    expect(await verifyPassword("correct-horse-battery", hash)).toBe(true);
    expect(await verifyPassword("wrong-password!", hash)).toBe(false);
  });

  it("enforces length rules", () => {
    expect(validatePasswordStrength("short")).toMatch(/at least 10/);
    expect(validatePasswordStrength("x".repeat(73))).toMatch(/72 bytes/);
    expect(validatePasswordStrength("long-enough-password")).toBeNull();
  });
});
