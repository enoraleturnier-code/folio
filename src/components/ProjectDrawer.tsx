import { CloudUpload, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/Alert";
import { TagPicker } from "@/components/TagPicker";
import { getKeywordsRef, getToolsRef, getTypesRef } from "@/data/projectRefs";
import type { ProjectInput } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { SECTEUR_LABELS } from "@/lib/secteurLabels";
import { uploadProjectThumbnail } from "@/lib/storage";
import { MAX_LENGTHS, validateProject, type ValidationError } from "@/lib/projectValidation";
import type { AiStructuredDesc, Project, ProjectStatus, SensitivityLevel } from "@/types/project";

interface ProjectDrawerProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (id: string, input: ProjectInput, isNew: boolean) => Promise<void>;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  public: "Public",
  confidential: "Confidentiel",
};

const SENSITIVITY_LABELS: Record<SensitivityLevel, string> = {
  sensible: "Sensible",
  tres_sensible: "Très sensible",
};

function emptyProject(): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    short_desc: "",
    long_desc: "",
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
    created_at: now,
    updated_at: now,
    tags: { tools: [], keywords: [], types: [] },
  };
}

export function ProjectDrawer({ open, project, onClose, onSave }: ProjectDrawerProps) {
  const [draft, setDraft] = useState<Project>(emptyProject);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [confirmStatusChange, setConfirmStatusChange] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [showLongDescOverride, setShowLongDescOverride] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Instantané de l'état initial (projet chargé ou nouveau projet vide) pris
  // à l'ouverture -- sert de référence pour détecter les modifications non
  // enregistrées (cf. isDirty ci-dessous), sans re-render à chaque frappe.
  const initialSnapshotRef = useRef("");

  useEffect(() => {
    if (open) {
      const initial = project ?? emptyProject();
      setDraft(initial);
      setPendingFile(null);
      setPendingPreview(null);
      setSaveError(null);
      setErrors([]);
      setConfirmStatusChange(false);
      setConfirmClose(false);
      setShowLongDescOverride(false);
      setAiNotes("");
      setAiError(null);
      initialSnapshotRef.current = JSON.stringify(initial);
    }
  }, [open, project]);

  const isDirty =
    open &&
    (JSON.stringify(draft) !== initialSnapshotRef.current ||
      aiNotes.trim() !== "" ||
      pendingFile !== null);

  // Fermeture "douce" : si le formulaire a des modifications non enregistrées,
  // on affiche la confirmation dédiée au lieu de fermer directement. Chemin
  // commun pour le bouton Fermer (X), Échap et Annuler -- les seules sorties
  // possibles avec le clic sur l'overlay désormais désactivé (cf. rendu).
  const requestClose = () => {
    if (isDirty) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isDirty]);

  // Navigateur (fermeture d'onglet, F5, saisie d'URL) : seul filet possible
  // en dehors du SPA lui-même -- le message personnalisé n'est plus affiché
  // par les navigateurs modernes (prompt générique imposé), mais l'appel à
  // preventDefault()/returnValue déclenche bien leur confirmation native.
  useEffect(() => {
    if (!open || !isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [open, isDirty]);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  if (!open) return null;

  const inputCls =
    "w-full rounded-xl border border-white/5 bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const labelCls = "block text-sm font-medium text-on-surface-variant";

  const errorFor = (field: ValidationError["field"]) => errors.find((e) => e.field === field);

  function counter(field: keyof typeof MAX_LENGTHS, value: string | null | undefined) {
    const max = MAX_LENGTHS[field];
    const len = (value ?? "").length;
    return (
      <span className={"text-[10px] " + (len > max ? "text-error" : "text-on-surface-variant/60")}>
        {len}/{max}
      </span>
    );
  }

  function fieldError(field: ValidationError["field"]) {
    const err = errorFor(field);
    if (!err) return null;
    return <p className="mt-1 text-xs text-error">{err.message}</p>;
  }

  const onFileSelected = (file: File) => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const runValidation = () => {
    // Un fichier vient d'être sélectionné mais n'est uploadé (et ne remplit
    // draft.thumbnail_url) qu'au moment de persist() — sans ça la validation
    // rejette a tort une image pourtant bien choisie, juste pas encore envoyée.
    const errs = validateProject(draft).filter(
      (e) => !(e.field === "thumbnail_url" && pendingFile),
    );
    setErrors(errs);
    return errs;
  };

  const persist = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      let thumbnailUrl = draft.thumbnail_url;
      if (pendingFile) {
        setUploading(true);
        thumbnailUrl = await uploadProjectThumbnail(pendingFile, draft.id);
        setUploading(false);
      }
      const input: ProjectInput = {
        title: draft.title,
        short_desc: draft.short_desc,
        long_desc: draft.long_desc ?? null,
        ai_structured_desc: draft.ai_structured_desc ?? null,
        thumbnail_url: thumbnailUrl,
        status: draft.status,
        sensitivity_level: draft.sensitivity_level,
        secteur_activite: draft.secteur_activite,
        client_name: draft.client_name,
        company_name: draft.company_name,
        role: draft.role,
        team: draft.team,
        start_date: draft.start_date,
        end_date: draft.end_date,
        tags: draft.tags,
      };
      await onSave(draft.id, input, !project);
      onClose();
    } catch (err) {
      setUploading(false);
      setSaveError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = runValidation();
    if (errs.length > 0) return;

    if (project && draft.status !== project.status) {
      setConfirmStatusChange(true);
      return;
    }
    await persist();
  };

  const handleAiStructure = async () => {
    if (!aiNotes.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const { data, error } = await supabase.functions.invoke<AiStructuredDesc>(
        "generate-ai-description",
        {
          body: { notes: aiNotes },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (error || !data) throw error ?? new Error("Réponse vide");

      setDraft((d) => ({
        ...d,
        ai_structured_desc: {
          ...d.ai_structured_desc,
          probleme: data.probleme ?? d.ai_structured_desc?.probleme ?? "",
          decisions: data.decisions ?? d.ai_structured_desc?.decisions ?? "",
          resultat: data.resultat ?? d.ai_structured_desc?.resultat ?? "",
        },
        tags: {
          types: Array.from(new Set([...d.tags.types, ...(data.types_suggestions ?? [])])),
          tools: Array.from(new Set([...d.tags.tools, ...(data.tools_suggestions ?? [])])),
          keywords: Array.from(new Set([...d.tags.keywords, ...(data.keywords_suggestions ?? [])])),
        },
      }));
    } catch {
      setAiError("La génération a échoué, réessaie.");
    } finally {
      setAiLoading(false);
    }
  };

  // Description longue (rédaction manuelle) et trio Problème/Décisions/Résultat
  // (IA ou saisie manuelle) sont deux façons alternatives de raconter le
  // projet : si le trio est déjà complet, la description longue n'est pas
  // nécessaire et reste masquée par défaut (cf. validateProject) -- sauf si
  // l'admin choisit explicitement de la rédiger quand même, ou qu'un projet
  // existant en avait déjà une avant l'usage de l'IA.
  const hasStructuredContent = Boolean(
    draft.ai_structured_desc?.probleme?.trim() &&
    draft.ai_structured_desc?.decisions?.trim() &&
    draft.ai_structured_desc?.resultat?.trim(),
  );
  const showLongDesc =
    showLongDescOverride || !hasStructuredContent || Boolean(draft.long_desc?.trim());

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Éditer le projet"
    >
      {/* Clic extérieur volontairement sans effet (aria-hidden, pas de onClick) :
          seuls les boutons explicites (Fermer, Annuler, Enregistrer) peuvent
          fermer la modale. */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" />
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
          <button
            type="button"
            onClick={requestClose}
            aria-label="Fermer"
            className="rounded-full p-2 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
          >
            <X aria-hidden="true" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            {saveError && (
              <Alert type="error" title="Échec de l'enregistrement" description={saveError} />
            )}

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
              <div className="mt-1 flex items-center justify-between">
                {fieldError("title")}
                {counter("title", draft.title)}
              </div>
            </div>

            <div>
              <label htmlFor="pd-subtitle" className={labelCls}>
                Sous-titre (carte teaser)
              </label>
              <textarea
                id="pd-subtitle"
                rows={2}
                value={draft.short_desc ?? ""}
                onChange={(e) => setDraft({ ...draft, short_desc: e.target.value })}
                className={inputCls + " mt-2 resize-y"}
              />
              <div className="mt-1 flex items-center justify-between">
                {fieldError("short_desc")}
                {counter("short_desc", draft.short_desc)}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-white/5 bg-surface-container/50 p-4">
              <label htmlFor="pd-ai-notes" className={labelCls}>
                Notes libres pour l'IA
              </label>
              <textarea
                id="pd-ai-notes"
                rows={3}
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                placeholder="Décrivez le projet en vrac, l'IA structure Problème / Décisions / Résultat + suggère des tags..."
                className={inputCls + " resize-y"}
              />
              {!aiNotes.trim() && (
                <p className="text-xs text-on-surface-variant/70">
                  Saisis des notes ci-dessus avant de lancer la génération.
                </p>
              )}
              {aiError && <Alert type="error" title={aiError} />}
              <button
                type="button"
                onClick={handleAiStructure}
                disabled={!aiNotes.trim() || aiLoading}
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary-container/5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary-container/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles aria-hidden="true" size={18} />
                {aiLoading ? "Génération…" : "Structurer avec l'IA"}
              </button>
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
              <div className="mt-1 flex items-center justify-between">
                {fieldError("probleme")}
                {counter("probleme", draft.ai_structured_desc?.probleme)}
              </div>
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
              <div className="mt-1 flex items-center justify-between">
                {fieldError("decisions")}
                {counter("decisions", draft.ai_structured_desc?.decisions)}
              </div>
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
              <div className="mt-1 flex items-center justify-between">
                {fieldError("resultat")}
                {counter("resultat", draft.ai_structured_desc?.resultat)}
              </div>
            </div>

            {showLongDesc ? (
              <div>
                <label htmlFor="pd-long-desc" className={labelCls}>
                  Description longue
                </label>
                <textarea
                  id="pd-long-desc"
                  rows={6}
                  value={draft.long_desc ?? ""}
                  onChange={(e) => setDraft({ ...draft, long_desc: e.target.value })}
                  className={inputCls + " mt-2 resize-y"}
                  placeholder="Contenu complet de l'étude de cas..."
                />
                <div className="mt-1 flex items-center justify-between">
                  {fieldError("long_desc")}
                  {counter("long_desc", draft.long_desc)}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-on-surface-variant">
                Description longue non nécessaire — le résumé structuré par l'IA ci-dessus (Problème
                / Décisions / Résultat) couvre déjà le contenu.{" "}
                <button
                  type="button"
                  onClick={() => setShowLongDescOverride(true)}
                  className="font-medium text-primary hover:underline"
                >
                  Rédiger quand même une description longue
                </button>
              </div>
            )}

            <div>
              <p className={labelCls}>Image</p>
              <label className="mt-2 flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-white/15 bg-surface-container text-center hover:bg-white/5">
                {pendingPreview || draft.thumbnail_url ? (
                  <img
                    src={pendingPreview ?? draft.thumbnail_url ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <CloudUpload aria-hidden="true" className="text-on-surface-variant" size={30} />
                    <p className="text-sm text-on-surface-variant">
                      Glissez-déposez ou <span className="text-primary">parcourir</span>
                    </p>
                    <p className="text-xs text-on-surface-variant/70">
                      JPG, PNG ou WebP (max 5 Mo)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
                />
              </label>
              {uploading && <p className="mt-1 text-xs text-on-surface-variant">Envoi en cours…</p>}
              {fieldError("thumbnail_url")}
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
                  {(Object.entries(STATUS_LABELS) as [ProjectStatus, string][]).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
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
                  {(Object.entries(SENSITIVITY_LABELS) as [SensitivityLevel, string][]).map(
                    ([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pd-secteur" className={labelCls}>
                  Secteur d'activité
                </label>
                <select
                  id="pd-secteur"
                  value={draft.secteur_activite ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      secteur_activite: (e.target.value || null) as Project["secteur_activite"],
                    })
                  }
                  className={inputCls + " mt-2"}
                >
                  <option value="">— Choisir —</option>
                  {Object.entries(SECTEUR_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                {fieldError("secteur_activite")}
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
                <div className="mt-1 flex items-center justify-between">
                  {fieldError("company_name")}
                  {counter("company_name", draft.company_name)}
                </div>
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
                <div className="mt-1 flex items-center justify-between">
                  {fieldError("client_name")}
                  {counter("client_name", draft.client_name)}
                </div>
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
                <div className="mt-1 flex items-center justify-between">
                  {fieldError("role")}
                  {counter("role", draft.role)}
                </div>
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
                <div className="mt-1 flex items-center justify-between">
                  {fieldError("team")}
                  {counter("team", draft.team)}
                </div>
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
                {fieldError("start_date")}
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
                {fieldError("end_date")}
              </div>
            </div>

            <div className="space-y-5 border-t border-white/5 pt-5">
              <TagPicker
                label="Types de design"
                category="designType"
                refTable="project_types_ref"
                fetchOptions={getTypesRef}
                selected={draft.tags.types}
                onChange={(types) => setDraft({ ...draft, tags: { ...draft.tags, types } })}
              />
              <TagPicker
                label="Outils"
                category="tools"
                refTable="tools_ref"
                fetchOptions={getToolsRef}
                selected={draft.tags.tools}
                onChange={(tools) => setDraft({ ...draft, tags: { ...draft.tags, tools } })}
              />
              <TagPicker
                label="Mots-clés"
                category="keywords"
                refTable="keywords_ref"
                fetchOptions={getKeywordsRef}
                selected={draft.tags.keywords}
                onChange={(keywords) => setDraft({ ...draft, tags: { ...draft.tags, keywords } })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
            <button
              type="button"
              onClick={requestClose}
              className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface hover:border-white/30"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer le projet"}
            </button>
          </div>
        </form>
      </aside>

      {confirmStatusChange && project && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setConfirmStatusChange(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-md rounded-2xl border border-white/10 bg-surface-container-lowest p-6">
            <h3 className="text-lg font-medium text-on-surface">
              Confirmer le changement de statut ?
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {STATUS_LABELS[project.status]} → {STATUS_LABELS[draft.status]}. Effet immédiat sur le
              catalogue une fois confirmé.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmStatusChange(false)}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmStatusChange(false);
                  persist();
                }}
                className="rounded-full bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmClose && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setConfirmClose(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-surface-container-lowest p-6">
            <Alert
              type="warning"
              title="Quitter sans enregistrer ?"
              description="Êtes-vous sûr de vouloir quitter sans enregistrer ? Vos données seront perdues."
            />
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface"
              >
                Annuler / Revenir au formulaire
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmClose(false);
                  onClose();
                }}
                className="rounded-full bg-error px-6 py-2.5 text-sm font-bold text-on-error shadow-lg transition-all hover:scale-105 hover:brightness-110 active:scale-95"
              >
                Continuer sans enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
