import { Outlet, ScrollRestoration } from "react-router-dom";
import { useEffect } from "react";

import { PersonaSwitcher } from "@/components/dev/PersonaSwitcher";
import { RouteAnnouncer } from "@/components/RouteAnnouncer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { submitPendingAccessRequest, takePendingAccessRequest } from "@/data/accessRequests";
import { supabase } from "@/integrations/supabase/client";

export function RootLayout() {
  // Ecoute globale (montée une fois) : reprend une demande d'accès laissée en
  // attente si le visiteur devait confirmer son email avant que signUp() ne
  // lui rende une session — cf. AccessRequestModal + src/data/accessRequests.ts.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event !== "SIGNED_IN" || !newSession) return;
      const pending = takePendingAccessRequest();
      if (!pending) return;
      submitPendingAccessRequest(newSession.user.id, pending).catch((err) => {
        console.error("[AccessRequest] échec de la reprise après confirmation email :", err);
      });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary-container focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-on-primary-container focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Aller au contenu principal
      </a>
      <ScrollRestoration />
      <Outlet />
      {/* Après <Outlet/> : les effets s'exécutent dans l'ordre du JSX pour des
          composants siblings au sein d'un même commit -- doit rester après la
          page pour que useDocumentTitle (dans la page) ait déjà mis à jour
          document.title au moment où RouteAnnouncer le lit et l'annonce. */}
      <RouteAnnouncer />
      <ScrollToTopButton />
      {(import.meta.env.DEV || import.meta.env.VITE_VERCEL_ENV === "preview") && <PersonaSwitcher />}
    </TooltipProvider>
  );
}
