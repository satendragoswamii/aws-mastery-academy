"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/**
 * A fenced code block from lesson Markdown.
 * Commands (bash/sh/zsh) render as a dark "Terminal" block with a Copy button
 * and wrap long lines; everything else (output, diagrams, JSON) renders as a
 * light block that keeps its exact spacing.
 */
export function CodeBlock({
  language,
  children,
}: {
  language: string;
  children: ReactNode;
}) {
  const pre = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const isCommand = ["bash", "sh", "shell", "zsh", "console"].includes(
    language,
  );
  const label = isCommand ? "Terminal" : LABELS[language];

  async function copy() {
    const text = pre.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (e.g. insecure context); selecting the text still works */
    }
  }

  return (
    <div className={`code-block ${isCommand ? "code-command" : "code-output"}`}>
      {(label || isCommand) && (
        <div className="code-block-bar">
          <span>{label}</span>
          {isCommand && (
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 normal-case tracking-normal text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label={copied ? "Copied" : "Copy commands"}
            >
              {copied ? (
                <Check aria-hidden className="h-3.5 w-3.5" />
              ) : (
                <Copy aria-hidden className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
      <pre ref={pre}>{children}</pre>
    </div>
  );
}

const LABELS: Record<string, string> = {
  json: "JSON",
  yaml: "YAML",
  javascript: "JavaScript",
  js: "JavaScript",
  ts: "TypeScript",
  python: "Python",
  output: "Output",
};
