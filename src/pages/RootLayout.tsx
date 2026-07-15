import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useEffect, useState } from "react";

import { PersonaSwitcher } from "@/components/dev/PersonaSwitcher";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { submitPendingAccessRequest, takePendingAccessRequest } from "@/data/accessRequests";
import { supabase } from "@/integrations/supabase/client";

export function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ScrollRestoration />
        <Outlet />
        <ScrollToTopButton />
        {(import.meta.env.DEV || import.meta.env.VITE_VERCEL_ENV === "preview") && <PersonaSwitcher />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
