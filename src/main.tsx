import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import "./styles.css";

// Après le passage au code-splitting par route (chunks Vite hashés par
// build), un onglet resté ouvert d'avant un nouveau déploiement référence
// encore les anciens noms de fichiers -- le prochain `import()` dynamique
// (navigation vers une route lazy) échoue en 404 et bloque la page jusqu'à
// un rechargement manuel. Vite émet `vite:preloadError` dans ce cas précis ;
// un rechargement automatique (une seule fois par session, sessionStorage
// pour éviter une boucle si le problème persiste) le résout silencieusement.
window.addEventListener("vite:preloadError", () => {
  const key = "folio-chunk-reload-attempted";
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
