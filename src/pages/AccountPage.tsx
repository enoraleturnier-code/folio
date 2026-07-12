import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function AccountPage() {
  const navigate = useNavigate();
  const { session, loading, role, roleLoading, fullName, user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Le sign-out déclenché par handleDelete() met `session` à null, ce qui
  // ferait sinon courir cet effet et son propre navigate("/auth") en
  // concurrence avec le navigate("/") explicite de handleDelete -- résultat
  // non déterministe (observé en test réel : atterrissage sur /auth au lieu
  // de "/"). Ce flag désarme l'effet le temps de la redirection volontaire.
  const [justDeleted, setJustDeleted] = useState(false);

  useEffect(() => {
    if (loading || roleLoading || justDeleted) return;
    if (!session) {
      navigate("/auth");
      return;
    }
    if (role === "admin") {
      navigate("/admin");
    }
  }, [loading, roleLoading, session, role, navigate, justDeleted]);

  if (loading || roleLoading || !session || role === "admin") {
    return <div className="min-h-screen bg-background" />;
  }

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const { data, error } = await supabase.functions.invoke<{ success: boolean }>(
        "anonymize-rgpd",
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      );
      if (error || !data?.success) throw error ?? new Error("Réponse inattendue.");

      setJustDeleted(true);
      await supabase.auth.signOut();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleting(false);
      setDeleteError(
        err instanceof Error ? err.message : "La suppression a échoué. Réessayez.",
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
          Information du profil
        </p>
        <h1 className="mb-10 text-4xl font-medium text-on-surface md:text-5xl">
          Mon compte
        </h1>

        <div className="space-y-6 rounded-2xl border border-white/5 bg-surface-container-low p-6">
          <Field label="Nom complet" value={fullName ?? "—"} />
          <Field label="Email" value={user?.email ?? "—"} />
          <Field label="Rôle actuel" value={role ?? "—"} />
        </div>

        <div className="mt-10 rounded-2xl border border-error/20 bg-error/5 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-error">Zone sensible</p>
          <h2 className="mt-2 text-lg font-medium text-on-surface">Supprimer mes données</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Conformément au RGPD, vous pouvez demander la suppression définitive de votre compte
            et de vos données personnelles. Cette action est irréversible : votre profil sera
            anonymisé et vous serez déconnecté immédiatement.
          </p>
          {deleteError && (
            <div className="mt-4">
              <Alert type="error" title="Échec de la suppression" description={deleteError} />
            </div>
          )}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-error/40 px-6 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10"
          >
            <Trash2 aria-hidden="true" size={16} />
            Supprimer mes données
          </button>
        </div>
      </main>
      <Footer />

      {confirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-surface-container-lowest p-6">
            <Alert
              type="warning"
              title="Supprimer définitivement votre compte ?"
              description="Vos données personnelles seront anonymisées et votre compte supprimé. Cette action est irréversible et ne peut pas être annulée."
            />
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-error px-6 py-2.5 text-sm font-bold text-on-error shadow-lg transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:brightness-100"
              >
                {deleting ? "Suppression…" : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
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
