import { useEffect, useState } from "react";

import type { Project, ProjectStatus, SensitivityLevel } from "@/types/project";

interface ProjectDrawerProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (project: Project) => void;
}

const emptyProject: Project = {
  id: "",
  title: "",
  short_desc: "",
  long_desc: null,
  ai_structured_desc: { probleme: "", decisions: "", resultat: "" },
  thumbnail_url: null,
  status: "draft",
  sensitivity_level: "sensible",
  secteur_activite: null,
  client_name: "",
  company_name: "",
  role: "",
  team: "",
  start_date: "",
  end_date: "",
  deleted_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: { tools: [], keywords: [], types: [] },
};

export function ProjectDrawer({ open, project, onClose, onSave }: ProjectDrawerProps) {
  const [draft, setDraft] = useState<Project>(emptyProject);

  useEffect(() => {
    if (open) setDraft(project ?? { ...emptyProject, id: String(Date.now()) });
  }, [open, project]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputCls =
    "w-full rounded-xl border border-white/5 bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const labelCls = "block text-sm font-medium text-on-surface-variant";

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Éditer le projet">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside className="absolute right-0 top-0 flex h-screen w-full max-w-2xl flex-col border-l border-white/10 bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              {project ? "Édition" : "Nouveau projet"}
            </p>
            <h2 className="mt-1 text-xl font-medium text-on-surface">
              {draft.title || "Sans titre"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                auto_awesome
              </span>
              Structurer avec l'IA
            </button>
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
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div>
            <label htmlFor="pd-title" className={labelCls}>
              Titre du projet
            </label>
            <input
              id="pd-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className={inputCls + " mt-2"}
            />
          </div>
          <div>
            <label htmlFor="pd-subtitle" className={labelCls}>
              Sous-titre
            </label>
            <input
              id="pd-subtitle"
              value={draft.short_desc ?? ""}
              onChange={(e) => setDraft({ ...draft, short_desc: e.target.value })}
              className={inputCls + " mt-2"}
            />
          </div>

          <div>
            <label htmlFor="pd-problem" className={labelCls}>
              Problème
            </label>
            <textarea
              id="pd-problem"
              rows={3}
              value={draft.ai_structured_desc?.probleme ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  ai_structured_desc: { ...draft.ai_structured_desc, probleme: e.target.value },
                })
              }
              className={inputCls + " mt-2 resize-y"}
            />
          </div>
          <div>
            <label htmlFor="pd-decisions" className={labelCls}>
              Décisions
            </label>
            <textarea
              id="pd-decisions"
              rows={3}
              value={draft.ai_structured_desc?.decisions ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  ai_structured_desc: { ...draft.ai_structured_desc, decisions: e.target.value },
                })
              }
              className={inputCls + " mt-2 resize-y"}
            />
          </div>
          <div>
            <label htmlFor="pd-result" className={labelCls}>
              Résultat
            </label>
            <textarea
              id="pd-result"
              rows={3}
              value={draft.ai_structured_desc?.resultat ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  ai_structured_desc: { ...draft.ai_structured_desc, resultat: e.target.value },
                })
              }
              className={inputCls + " mt-2 resize-y"}
            />
          </div>

          <div>
            <p className={labelCls}>Images du projet</p>
            <div className="mt-2 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-surface-container px-6 py-10 text-center">
              <span aria-hidden="true" className="material-symbols-outlined text-3xl text-on-surface-variant">
                cloud_upload
              </span>
              <p className="text-sm text-on-surface-variant">
                Glissez-déposez vos images ou{" "}
                <span className="text-primary">parcourir</span>
              </p>
              <p className="text-xs text-on-surface-variant/70">PNG, JPG jusqu'à 8 Mo</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pd-status" className={labelCls}>
                Statut
              </label>
              <select
                id="pd-status"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as ProjectStatus })}
                className={inputCls + " mt-2"}
              >
                <option value="draft">Brouillon</option>
                <option value="public">Public</option>
                <option value="confidential">Confidentiel</option>
              </select>
            </div>
            <div>
              <label htmlFor="pd-sensitivity" className={labelCls}>
                Sensibilité
              </label>
              <select
                id="pd-sensitivity"
                value={draft.sensitivity_level}
                onChange={(e) =>
                  setDraft({ ...draft, sensitivity_level: e.target.value as SensitivityLevel })
                }
                className={inputCls + " mt-2"}
              >
                <option value="sensible">Sensible</option>
                <option value="tres_sensible">Très sensible</option>
              </select>
            </div>
            <div>
              <label htmlFor="pd-company" className={labelCls}>
                Entreprise
              </label>
              <input
                id="pd-company"
                value={draft.company_name ?? ""}
                onChange={(e) => setDraft({ ...draft, company_name: e.target.value })}
                className={inputCls + " mt-2"}
              />
            </div>
            <div>
              <label htmlFor="pd-client" className={labelCls}>
                Client
              </label>
              <input
                id="pd-client"
                value={draft.client_name ?? ""}
                onChange={(e) => setDraft({ ...draft, client_name: e.target.value })}
                className={inputCls + " mt-2"}
              />
            </div>
            <div>
              <label htmlFor="pd-role" className={labelCls}>
                Rôle
              </label>
              <input
                id="pd-role"
                value={draft.role ?? ""}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                className={inputCls + " mt-2"}
              />
            </div>
            <div>
              <label htmlFor="pd-team" className={labelCls}>
                Équipe
              </label>
              <input
                id="pd-team"
                value={draft.team ?? ""}
                onChange={(e) => setDraft({ ...draft, team: e.target.value })}
                className={inputCls + " mt-2"}
              />
            </div>
            <div>
              <label htmlFor="pd-start" className={labelCls}>
                Date de début
              </label>
              <input
                id="pd-start"
                type="date"
                value={draft.start_date ?? ""}
                onChange={(e) => setDraft({ ...draft, start_date: e.target.value || null })}
                className={inputCls + " mt-2"}
              />
            </div>
            <div>
              <label htmlFor="pd-end" className={labelCls}>
                Date de fin
              </label>
              <input
                id="pd-end"
                type="date"
                value={draft.end_date ?? ""}
                onChange={(e) => setDraft({ ...draft, end_date: e.target.value || null })}
                className={inputCls + " mt-2"}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface hover:border-white/30"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary hover:opacity-90"
          >
            Enregistrer
          </button>
        </div>
      </aside>
    </div>
  );
}
