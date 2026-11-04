import { describe, expect, it } from "vitest";
import { encouragementFor, greetingFor } from "@/lib/learning/greeting";

describe("greetingFor", () => {
  it("follows the learner's time zone", () => {
    // 03:30 UTC = 09:00 in India
    expect(greetingFor(new Date("2026-11-04T03:30:00Z"), "Asia/Kolkata")).toBe("Good morning");
    expect(greetingFor(new Date("2026-11-04T03:30:00Z"), "UTC")).toBe("Good evening");
  });

  it("covers afternoon and the midnight boundary", () => {
    expect(greetingFor(new Date("2026-11-04T08:30:00Z"), "Asia/Kolkata")).toBe("Good afternoon"); // 14:00
    expect(greetingFor(new Date("2026-11-03T18:30:00Z"), "Asia/Kolkata")).toBe("Good evening"); // 00:00
  });
});

describe("encouragementFor", () => {
  it("is stable for a given day", () => {
    expect(encouragementFor("2026-11-04")).toBe(encouragementFor("2026-11-04"));
  });
});
