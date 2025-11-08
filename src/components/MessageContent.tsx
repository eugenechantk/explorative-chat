'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

interface MessageContentProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  language?: string;
  children: React.ReactNode;
  className?: string;
}

function CodeBlock({ language, children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract text content from children
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (node && typeof node === 'object' && 'props' in node) {
      return getTextContent(node.props.children);
    }
    return '';
  };

  const codeText = getTextContent(children);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-zinc-800">
      {language && (
        <div className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs font-mono border-b border-zinc-800 flex items-center justify-between">
          <span>{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-800 rounded transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <pre className="m-0! p-0! bg-zinc-950! overflow-x-auto text-sm">
        <code className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export function MessageContent({ content, className = '' }: MessageContentProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize code block rendering
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;

            if (isInline) {
              // Inline code
              return (
                <code
                  className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Code block
            return (
              <CodeBlock
                language={match?.[1]}
                className={className}
              >
                {children}
              </CodeBlock>
            );
          },
          // Customize paragraph spacing
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-7">{children}</p>;
          },
          // Customize headings
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>;
          },
          // Customize lists
          ul({ children }) {
            return <ul className="mb-4 pl-6 list-disc space-y-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-4 pl-6 list-decimal space-y-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-7">{children}</li>;
          },
          // Customize blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-zinc-700 pl-4 my-4 italic text-zinc-400">
                {children}
              </blockquote>
            );
          },
          // Customize links
          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-blue-400 hover:text-blue-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          // Customize tables
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-zinc-800">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-zinc-800 px-4 py-2 bg-zinc-900 text-left font-semibold">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-zinc-800 px-4 py-2">
                {children}
              </td>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
