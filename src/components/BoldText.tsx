import { Fragment } from "react";

/** Rendu très léger d'un sous-ensemble Markdown (`**mot**` -> gras) pour un
 * champ texte simple (ex. bio profil) -- volontairement pas `MarkdownContent`
 * (react-markdown + plugins), qui alourdirait le bundle initial de la page
 * profil (statique, non lazy-loaded, cf. CLAUDE.md "Code-splitting par
 * route"). */
export function BoldText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-medium text-on-surface">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
