import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";

import { textLinkClass } from "@/lib/linkStyles";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string | null | undefined;
  className?: string;
}

/**
 * Rendu Markdown partagé pour les champs longue-forme du catalogue (long_desc,
 * ai_structured_desc.probleme/decisions/resultat) -- pas de plugin Typography
 * Tailwind installé, donc chaque élément Markdown est stylé explicitement ici
 * pour matcher le design system plutôt que de dépendre d'un preset générique.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content) return null;
  return (
    <div className={cn("space-y-4 text-base leading-relaxed text-on-surface-variant", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => <strong className="font-medium text-on-surface">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => {
            // Lien interne (route de l'app, ex. renvoi vers /politique-de-confidentialite
            // depuis /mentions-legales) -- navigation SPA via React Router, jamais un
            // nouvel onglet. Un lien externe (http/https) ouvre en revanche dans un
            // nouvel onglet, comportement d'origine conservé pour ce cas.
            if (href?.startsWith("/")) {
              return (
                <Link to={href} className={textLinkClass()}>
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className={textLinkClass()}>
                {children}
              </a>
            );
          },
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          h1: ({ children }) => <h3 className="text-lg font-medium text-on-surface">{children}</h3>,
          h2: ({ children }) => <h3 className="text-lg font-medium text-on-surface">{children}</h3>,
          h3: ({ children }) => <h3 className="text-base font-medium text-on-surface">{children}</h3>,
          code: ({ children }) => (
            <code className="rounded bg-surface-container px-1.5 py-0.5 text-sm text-on-surface">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/40 pl-4 italic text-on-surface-variant">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-container-low text-on-surface">{children}</thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 align-top text-on-surface-variant">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
