import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { MarkdownLink } from "./MarkdownLink";

interface MarkdownViewProps {
  content: string;
  currentFilePath: string | null;
  onOpenMarkdown: (path: string) => void | Promise<void>;
}

export function MarkdownView({
  content,
  currentFilePath,
  onOpenMarkdown,
}: MarkdownViewProps) {
  return (
    <article className="markdown-view">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...props }) => (
            <MarkdownLink
              href={href}
              currentFilePath={currentFilePath}
              onOpenMarkdown={onOpenMarkdown}
              {...props}
            >
              {children}
            </MarkdownLink>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
