import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useState } from "react";

import { PersonaSwitcher } from "@/components/dev/PersonaSwitcher";
import { TooltipProvider } from "@/components/ui/tooltip";

export function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ScrollRestoration />
        <Outlet />
        {import.meta.env.DEV && <PersonaSwitcher />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
