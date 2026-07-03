import { useEffect, useState } from "react";

import { projects as allProjects } from "@/data/projects";
import type { Project } from "@/data/types";

interface AccessRequestModalProps {
  open: boolean;
  onClose: () => void;
  initialProject?: Project | null;
}

export function AccessRequestModal({ open, onClose, initialProject }: AccessRequestModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    reason: "",
    rgpd: false,
    projectIds: [] as string[],
  });

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setForm((f) => ({
        ...f,
        projectIds: initialProject ? [initialProject.id] : [],
      }));
    }
  }, [open, initialProject]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const confidentialProjects = allProjects.filter(
    (p) => p.sensitivity === "confidentielle" && p.status !== "deleted",
  );

  const toggleProject = (id: string) =>
    setForm((f) => ({
      ...f,
      projectIds: f.projectIds.includes(id)
        ? f.projectIds.filter((x) => x !== id)
        : [...f.projectIds, id],
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rgpd || form.projectIds.length === 0) return;
    setSubmitted(true);
  };

  const inputCls =
    "w-full rounded-xl border border-white/5 bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Demander l'accès aux projets confidentiels"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-surface-container-lowest shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/5 p-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#A78BFA]">
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                lock
              </span>
              Accès confidentiel
            </div>
            <h2 className="mt-2 text-2xl font-medium text-on-surface">
              Demander l'<span className="font-display-accent italic text-primary">accès</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-2 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-3xl text-primary">
              task_alt
            </span>
            <h3 className="mt-3 text-lg font-medium text-on-surface">Demande envoyée.</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Vous recevrez une réponse sous 24 à 48 heures.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface hover:border-primary"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ar-name" className="block text-sm font-medium text-on-surface-variant">
                  Nom complet
                </label>
                <input
                  id="ar-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls + " mt-2"}
                />
              </div>
              <div>
                <label htmlFor="ar-email" className="block text-sm font-medium text-on-surface-variant">
                  Email professionnel
                </label>
                <input
                  id="ar-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls + " mt-2"}
                />
              </div>
            </div>
            <div>
              <label htmlFor="ar-company" className="block text-sm font-medium text-on-surface-variant">
                Entreprise
              </label>
              <input
                id="ar-company"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className={inputCls + " mt-2"}
              />
            </div>
            <fieldset>
              <legend className="block text-sm font-medium text-on-surface-variant">
                Projets demandés
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {confidentialProjects.map((p) => {
                  const selected = form.projectIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProject(p.id)}
                      className={
                        "rounded-full border px-4 py-2 text-xs font-medium transition-colors " +
                        (selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/15 text-on-surface-variant hover:text-on-surface")
                      }
                    >
                      {p.title}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div>
              <label htmlFor="ar-reason" className="block text-sm font-medium text-on-surface-variant">
                Motif de la demande
              </label>
              <textarea
                id="ar-reason"
                rows={4}
                required
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className={inputCls + " mt-2 resize-y"}
                placeholder="Contexte, projet en cours, calendrier."
              />
            </div>
            <label className="flex items-start gap-3 text-sm text-on-surface-variant">
              <input
                type="checkbox"
                required
                checked={form.rgpd}
                onChange={(e) => setForm({ ...form, rgpd: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border border-outline bg-surface-container text-primary focus:ring-primary"
              />
              <span>
                J'accepte que mes données soient utilisées pour traiter ma demande, conformément à
                la politique de confidentialité.
              </span>
            </label>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface hover:border-white/30"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!form.rgpd || form.projectIds.length === 0}
                className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white/4 disabled:text-white/20"
              >
                Envoyer la demande
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
