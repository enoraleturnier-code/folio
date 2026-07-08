import { Outlet } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function SlugLayout() {
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
