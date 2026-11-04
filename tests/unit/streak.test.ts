import { describe, expect, it } from "vitest";
import { currentStreak, dayInZone, longestStreak } from "@/lib/learning/streak";

describe("dayInZone", () => {
  it("uses the learner's midnight, not UTC", () => {
    // 20:00 UTC on 3 Nov is 01:30 on 4 Nov in India
    const at = new Date("2026-11-03T20:00:00Z");
    expect(dayInZone(at, "Asia/Kolkata")).toBe("2026-11-04");
    expect(dayInZone(at, "UTC")).toBe("2026-11-03");
  });
});

describe("currentStreak", () => {
  it("is 0 with no activity", () => {
    expect(currentStreak([], "2026-11-04")).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-11-02", "2026-11-03", "2026-11-04"], "2026-11-04")).toBe(3);
  });

  it("is not broken yet if you studied yesterday but not today", () => {
    expect(currentStreak(["2026-11-02", "2026-11-03"], "2026-11-04")).toBe(2);
  });

  it("resets after a missed day", () => {
    expect(currentStreak(["2026-11-01", "2026-11-02"], "2026-11-04")).toBe(0);
    expect(currentStreak(["2026-11-01", "2026-11-03", "2026-11-04"], "2026-11-04")).toBe(2);
  });

  it("crosses month and year boundaries", () => {
    expect(currentStreak(["2026-12-31", "2027-01-01"], "2027-01-01")).toBe(2);
    expect(currentStreak(["2026-10-31", "2026-11-01"], "2026-11-01")).toBe(2);
  });

  it("ignores duplicates", () => {
    expect(currentStreak(["2026-11-04", "2026-11-04"], "2026-11-04")).toBe(1);
  });
});

describe("longestStreak", () => {
  it("finds the longest run anywhere in history", () => {
    expect(longestStreak(["2026-01-01", "2026-01-02", "2026-01-03", "2026-02-10", "2026-02-11"])).toBe(3);
    expect(longestStreak([])).toBe(0);
  });
});
