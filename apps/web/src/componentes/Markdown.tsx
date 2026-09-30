import DOMPurify from "dompurify";
import { marked } from "marked";
import { useMemo } from "react";

DOMPurify.addHook("afterSanitizeAttributes", (no) => {
  if (no.tagName === "A") {
    no.setAttribute("target", "_blank");
    no.setAttribute("rel", "noopener noreferrer");
  }
});

export function paraHtml(texto: string): string {
  return DOMPurify.sanitize(marked.parse(texto, { async: false, gfm: true, breaks: false }));
}

/** Markdown vindo de trilhas e da IA: sempre sanitizado antes de ir para a tela. */
export function Markdown({ texto, className = "" }: { texto: string; className?: string }) {
  const html = useMemo(() => paraHtml(texto), [texto]);
  return <div className={`md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
