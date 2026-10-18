import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageContentProps {
  content: string;
  compact?: boolean;
}

function normalizeResponse(content: string): string {
  if (!content) return "";
  return content.trim();
}

export function ChatMessageContent({
  content,
  compact = false,
}: ChatMessageContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-2 text-sm font-semibold text-white">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2
            className={`${compact ? "text-xs" : "text-base"} mb-2 font-semibold text-white`}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 mt-3 text-xs font-semibold text-white first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="my-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2 list-decimal space-y-1 pl-4 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="pl-0.5">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-purple-500/50 pl-3 italic text-zinc-400">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-white/10" />,
        pre: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-xl bg-black/60 p-3 font-mono text-[11px] text-purple-200 border border-white/[0.08]">
            <pre>{children}</pre>
          </div>
        ),
        code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
          const isInline = !className && typeof children === "string" && !children.includes("\n");
          if (isInline) {
            return (
              <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-[11px] text-purple-300 border border-white/[0.06]">
                {children}
              </code>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[10px]">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-white/15 text-zinc-200">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1.5 font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border-b border-white/[0.08] px-2 py-1.5 align-top">
            {children}
          </td>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-100">{children}</strong>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-200 underline decoration-purple-300/40 underline-offset-2 hover:text-white"
          >
            {children}
          </a>
        ),
      }}
    >
      {normalizeResponse(content)}
    </ReactMarkdown>
  );
}