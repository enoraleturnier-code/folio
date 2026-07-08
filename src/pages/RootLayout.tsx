import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useState } from "react";

import { PersonaSwitcher } from "@/components/dev/PersonaSwitcher";

export function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollRestoration />
      <Outlet />
      {import.meta.env.DEV && <PersonaSwitcher />}
    </QueryClientProvider>
  );
}
