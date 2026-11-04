import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders lesson Markdown. Raw HTML in content is NOT rendered (react-markdown
 * escapes it by default and no rehype-raw plugin is used), so content can never
 * inject scripts.
 */
export function Markdown({ children, inherit = false }: { children: string; inherit?: boolean }) {
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
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
