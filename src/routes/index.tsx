import { createFileRoute, redirect } from "@tanstack/react-router";

// TODO: replace with dynamic slug from Supabase auth at step 2
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/$slug", params: { slug: "lea-martin" } });
  },
});
