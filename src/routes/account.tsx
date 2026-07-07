import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const { session, loading, role, roleLoading, fullName, user } = useAuth();

  useEffect(() => {
    if (loading || roleLoading) return;
    if (!session) {
      navigate({ to: "/auth" });
      return;
    }
    if (role === "admin") {
      navigate({ to: "/admin" });
    }
  }, [loading, roleLoading, session, role, navigate]);

  if (loading || roleLoading || !session || role === "admin") {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
          Mon compte
        </p>
        <h1 className="mb-10 text-4xl font-medium text-on-surface md:text-5xl">
          Vos informations.
        </h1>

        <div className="space-y-6 rounded-2xl border border-white/5 bg-surface-container-low p-6">
          <Field label="Nom complet" value={fullName ?? "—"} />
          <Field label="Email" value={user?.email ?? "—"} />
          <Field label="Rôle actuel" value={role ?? "—"} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-on-surface">{value}</p>
    </div>
  );
}
