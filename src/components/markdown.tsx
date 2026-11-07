import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

/**
 * Renders lesson Markdown. Raw HTML in content is NOT rendered (react-markdown
 * escapes it by default and no rehype-raw plugin is used), so content can never
 * inject scripts.
 */
export function Markdown({ children, inherit = false }: { children: string; inherit?: boolean }) {
  const source = labelOutputBlocks(children);
  return (
    <div className={inherit ? "lesson-prose lesson-prose-inherit" : "lesson-prose"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children;
            const cls: string =
              (child as { props?: { className?: string } } | undefined)?.props?.className ?? "";
            const language = /language-(\w+)/.exec(cls)?.[1] ?? "text";
            return <CodeBlock language={language}>{children}</CodeBlock>;
          },
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

/**
 * A plain `text` block that directly follows a command block is that command's
 * output, so it is labelled "Output". Other `text` blocks (diagrams, examples)
 * stay unlabelled.
 */
export function labelOutputBlocks(md: string): string {
  return md.replace(
    /(^(~~~|```)(?:bash|sh|shell|zsh|console)[^\n]*\n[\s\S]*?\n\2[ \t]*\n)(\s*\n)?(~~~|```)text[ \t]*\n/gm,
    (_m, cmd: string, _fence: string, gap: string | undefined, outFence: string) => `${cmd}${gap ?? ""}${outFence}output\n`,
  );
}
