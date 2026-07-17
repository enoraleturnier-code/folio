import { useEffect } from "react";

/** Pose le titre d'onglet pour la page courante -- le `<title>` d'index.html ne change sinon jamais entre les routes de la SPA (WCAG 2.4.2). */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} - Folio+`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
