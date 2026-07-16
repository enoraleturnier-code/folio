import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Au premier chargement, le focus est déjà géré par le navigateur -- rien à
 * faire. À chaque changement de route suivant (SPA), react-router ne déplace
 * ni le focus ni ne prévient un lecteur d'écran (contrairement à un
 * chargement de page classique) : ce composant ramène le focus sur
 * #main-content et annonce le titre de la nouvelle page via une région
 * aria-live. Monté une seule fois dans RootLayout.tsx.
 */
export function RouteAnnouncer() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Laisse le useEffect de useDocumentTitle (dans la page qui vient de
    // monter) s'exécuter d'abord -- les effets enfants sont commit avant ceux
    // du parent, document.title reflète donc déjà la nouvelle page ici.
    document.getElementById("main-content")?.focus();
    setAnnouncement(document.title);
  }, [location.pathname]);

  return (
    <div aria-live="polite" role="status" className="sr-only">
      {announcement}
    </div>
  );
}
