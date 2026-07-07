import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/$slug")({
  component: SlugLayout,
});

function SlugLayout() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <div className="relative z-10">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
