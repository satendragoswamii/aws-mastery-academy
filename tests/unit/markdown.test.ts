import { describe, expect, it } from "vitest";
import { labelOutputBlocks } from "@/components/markdown";

describe("labelOutputBlocks", () => {
  it("labels a text block that directly follows a command block as output", () => {
    const md = "~~~bash\nls\n~~~\n\n~~~text\nfile.txt\n~~~\n";
    expect(labelOutputBlocks(md)).toBe("~~~bash\nls\n~~~\n\n~~~output\nfile.txt\n~~~\n");
  });

  it("leaves diagrams and other text blocks alone", () => {
    const md = "Intro\n\n~~~text\nA --> B\n~~~\n\nMore\n\n~~~bash\nls\n~~~\n\nSome prose.\n\n~~~text\ndiagram\n~~~\n";
    expect(labelOutputBlocks(md)).toBe(md);
  });

  it("handles several command/output pairs and backtick fences", () => {
    const md = "```bash\na\n```\n```text\n1\n```\n\n~~~bash\nb\n~~~\n\n~~~text\n2\n~~~\n";
    expect(labelOutputBlocks(md)).toBe("```bash\na\n```\n```output\n1\n```\n\n~~~bash\nb\n~~~\n\n~~~output\n2\n~~~\n");
  });
});
