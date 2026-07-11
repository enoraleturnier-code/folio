import { Calendar as CalendarIcon, ChevronDown, CloudUpload, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/Alert";
import { TagPicker } from "@/components/TagPicker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ensureRefValue,
  getKeywordsRef,
  getToolsRef,
  getTypesRef,
  type RefTable,
} from "@/data/projectRefs";
import type { ProjectInput } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { SECTEUR_LABELS } from "@/lib/secteurLabels";
import { SENSITIVITY_LABELS } from "@/lib/sensitivityLabels";
import { uploadProjectThumbnail } from "@/lib/storage";
import { MAX_LENGTHS, validateProject, type ValidationError } from "@/lib/projectValidation";
import type { AiGenerationResult, Project, ProjectStatus, SensitivityLevel } from "@/types/project";

interface AiSuggestions {
  tools: string[];
  keywords: string[];
  types: string[];
}

const EMPTY_SUGGESTIONS: AiSuggestions = { tools: [], keywords: [], types: [] };

const REF_TABLES: Record<keyof AiSuggestions, RefTable> = {
  tools: "tools_ref",
  keywords: "keywords_ref",
  types: "project_types_ref",
};

const REF_FETCHERS: Record<keyof AiSuggestions, () => ReturnType<typeof getToolsRef>> = {
  tools: getToolsRef,
  keywords: getKeywordsRef,
  types: getTypesRef,
};

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

/**
 * Hauteur par défaut d'un textarea : suffisante pour afficher le nombre de
 * caractères maximum autorisé pour ce champ sans scroll interne (le drawer
 * lui-même reste scrollable) -- estimation grossière ~90 caractères/ligne,
 * plafonnée pour ne pas produire un champ démesurément haut.
 */
function estimateRows(max: number): number {
  return Math.min(30, Math.max(2, Math.ceil(max / 90)));
}

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
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [pendingSave, setPendingSave] = useState<{
    status: ProjectStatus;
    action: "draft" | "publish";
  } | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions>(EMPTY_SUGGESTIONS);
  // Signale visuellement "généré par l'IA" (label + icône en text-primary) --
  // reste vrai après la génération jusqu'à ce que l'admin modifie un des 4
  // champs concernés à la main.
  const [aiHighlighted, setAiHighlighted] = useState(false);

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
      setPendingSave(null);
      setConfirmClose(false);
      setAiError(null);
      setAiSuggestions(EMPTY_SUGGESTIONS);
      setAiHighlighted(false);
      initialSnapshotRef.current = JSON.stringify(initial);
    }
  }, [open, project]);

  const isDirty =
    open && (JSON.stringify(draft) !== initialSnapshotRef.current || pendingFile !== null);

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
    "w-full rounded-xl border border-white/5 bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";
  const labelCls = "block text-sm font-medium text-on-surface-variant";
  const sectionHeadingCls = "text-xs font-semibold uppercase tracking-widest text-primary";

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

  const persist = async (finalStatus: ProjectStatus, action: "draft" | "publish") => {
    setSavingAction(action);
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
        status: finalStatus,
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
      setSavingAction(null);
    }
  };

  // Chemin commun aux deux boutons de sauvegarde (brouillon / publier) : la
  // confirmation de changement de statut (F-05) ne se déclenche que si le
  // projet existe déjà ET que le statut cible diffère de son statut actuel --
  // une création n'a pas de statut antérieur auquel se comparer.
  const submitWithStatus = async (targetStatus: ProjectStatus, action: "draft" | "publish") => {
    const errs = runValidation();
    if (errs.length > 0) return;

    if (project && targetStatus !== project.status) {
      setPendingSave({ status: targetStatus, action });
      return;
    }
    await persist(targetStatus, action);
  };

  const handleAiStructure = async () => {
    if (!draft.long_desc?.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const { data, error } = await supabase.functions.invoke<AiGenerationResult>(
        "generate-ai-description",
        {
          body: { long_desc: draft.long_desc },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (error || !data) throw error ?? new Error("Réponse vide");

      setDraft((d) => ({
        ...d,
        short_desc: data.short_desc ?? d.short_desc ?? "",
        ai_structured_desc: {
          ...d.ai_structured_desc,
          probleme: data.probleme ?? d.ai_structured_desc?.probleme ?? "",
          decisions: data.decisions ?? d.ai_structured_desc?.decisions ?? "",
          resultat: data.resultat ?? d.ai_structured_desc?.resultat ?? "",
        },
      }));
      setAiHighlighted(true);
      // Suggestions proposées à côté des TagPicker, jamais fusionnées
      // automatiquement dans les tags sélectionnés -- l'admin choisit
      // lesquelles ajouter (cf. bloc "suggestions" plus bas dans le rendu).
      // Celles déjà sélectionnées sont exclues pour ne pas proposer un
      // doublon du tag déjà présent.
      setAiSuggestions({
        tools: (data.tools_suggestions ?? []).filter((n) => !draft.tags.tools.includes(n)),
        keywords: (data.keywords_suggestions ?? []).filter((n) => !draft.tags.keywords.includes(n)),
        types: (data.types_suggestions ?? []).filter((n) => !draft.tags.types.includes(n)),
      });
    } catch {
      setAiError("La génération a échoué, réessaie.");
    } finally {
      setAiLoading(false);
    }
  };

  const setShortDesc = (value: string) => {
    setDraft((d) => ({ ...d, short_desc: value }));
    setAiHighlighted(false);
  };

  const setAiStructuredField = (field: "probleme" | "decisions" | "resultat", value: string) => {
    setDraft((d) => ({
      ...d,
      ai_structured_desc: { ...d.ai_structured_desc, [field]: value },
    }));
    setAiHighlighted(false);
  };

  // Fix bug "tags IA ne persistent pas" : une suggestion IA est un nom libre
  // qui ne correspond pas forcément à une ligne déjà existante dans la table
  // de référence -- l'ajouter tel quel à draft.tags (comme avant) faisait
  // que syncProjectTags() ne trouvait aucun id correspondant au moment de
  // sauvegarder, et le tag disparaissait silencieusement. On passe donc par
  // ensureRefValue() (même mécanisme que TagPicker.addNew()) pour créer ou
  // réutiliser la ligne de référence avant d'ajouter le tag aux sélectionnés.
  const addSuggestion = async (category: keyof AiSuggestions, name: string) => {
    try {
      const existing = await REF_FETCHERS[category]();
      const row = await ensureRefValue(REF_TABLES[category], name, existing);
      setDraft((d) => ({
        ...d,
        tags: {
          ...d.tags,
          [category]: d.tags[category].some((n) => n.toLowerCase() === row.name.toLowerCase())
            ? d.tags[category]
            : [...d.tags[category], row.name],
        },
      }));
      setAiSuggestions((s) => ({ ...s, [category]: s[category].filter((n) => n !== name) }));
    } catch {
      setAiError("Impossible d'ajouter ce tag, réessaie.");
    }
  };

  // Suggestions IA proposées à côté de chaque TagPicker : un clic les ajoute
  // aux tags sélectionnés, jamais fusionnées automatiquement à la génération.
  function suggestionChips(category: keyof AiSuggestions) {
    const items = aiSuggestions[category];
    if (items.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-on-surface-variant/60">Suggestions IA :</span>
        {items.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => addSuggestion(category, name)}
            className="rounded-full border border-dashed border-primary/40 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary-container/10"
          >
            + {name}
          </button>
        ))}
      </div>
    );
  }

  const aiActive = aiLoading || aiHighlighted;
  const aiLabelCls = cn(labelCls, "flex items-center gap-1.5", aiActive && "text-primary");
  const aiIconCls = cn("shrink-0", aiLoading && "animate-pulse");

  function aiFieldSkeleton(max: number) {
    const rows = estimateRows(max);
    return <Skeleton className="mt-2 w-full rounded-xl" style={{ height: rows * 24 + 24 }} />;
  }

  // Live check (pas seulement à la soumission) pour désactiver "Enregistrer"
  // tant que le formulaire n'est pas valide -- même filtre thumbnail_url que
  // runValidation() (un fichier sélectionné mais pas encore uploadé ne doit
  // pas être compté comme une image manquante).
  const isValid =
    validateProject(draft).filter((e) => !(e.field === "thumbnail_url" && pendingFile)).length ===
    0;

  const statusOptions = (Object.entries(STATUS_LABELS) as [ProjectStatus, string][]).filter(
    ([v]) => project || v !== "draft",
  );
  const showSensitivity = draft.status === "confidential";

  const selectCls = inputCls + " mt-2 appearance-none pr-10";
  const chevronCls =
    "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant";
  const tertiaryBtnCls =
    "rounded-full border border-transparent px-6 py-2.5 text-sm font-medium text-on-surface hover:border-white/30";

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
      <aside className="absolute right-0 top-0 flex h-screen w-[70vw] flex-col border-l border-white/10 bg-surface-container-lowest">
        <div className="border-b border-white/5 px-10 py-4">
          <div className="flex items-center justify-between">
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
          <p className="mt-2 text-xs text-on-surface-variant/70">Tous les champs sont obligatoires.</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-8 overflow-y-auto px-10 py-6">
            {saveError && (
              <Alert type="error" title="Échec de l'enregistrement" description={saveError} />
            )}

            {/* ---------- Section 1 — Informations générales ---------- */}
            <div className="space-y-5">
              <p className={sectionHeadingCls}>Informations générales</p>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-5">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className={showSensitivity ? "" : "col-span-2"}>
                      <label htmlFor="pd-status" className={labelCls}>
                        Statut
                      </label>
                      <div className="relative mt-2">
                        <select
                          id="pd-status"
                          value={draft.status}
                          onChange={(e) =>
                            setDraft({ ...draft, status: e.target.value as ProjectStatus })
                          }
                          className={selectCls}
                        >
                          {statusOptions.map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                        <ChevronDown aria-hidden="true" size={18} className={chevronCls} />
                      </div>
                    </div>
                    {showSensitivity && (
                      <div>
                        <label htmlFor="pd-sensitivity" className={labelCls}>
                          Niveau de sensibilité
                        </label>
                        <div className="relative mt-2">
                          <select
                            id="pd-sensitivity"
                            value={draft.sensitivity_level}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                sensitivity_level: e.target.value as SensitivityLevel,
                              })
                            }
                            className={selectCls}
                          >
                            {(Object.entries(SENSITIVITY_LABELS) as [SensitivityLevel, string][]).map(
                              ([v, l]) => (
                                <option key={v} value={v}>
                                  {l}
                                </option>
                              ),
                            )}
                          </select>
                          <ChevronDown aria-hidden="true" size={18} className={chevronCls} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className={labelCls}>Image</p>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) onFileSelected(file);
                    }}
                    className={cn(
                      "mt-2 flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed bg-surface-container text-center hover:bg-white/5",
                      isDraggingOver ? "border-primary bg-primary/5" : "border-white/15",
                    )}
                  >
                    {pendingPreview || draft.thumbnail_url ? (
                      <img
                        src={pendingPreview ?? draft.thumbnail_url ?? ""}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <CloudUpload
                          aria-hidden="true"
                          className="text-on-surface-variant"
                          size={30}
                        />
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
                  {uploading && (
                    <p className="mt-1 text-xs text-on-surface-variant">Envoi en cours…</p>
                  )}
                  {fieldError("thumbnail_url")}
                </div>
              </div>
            </div>

            {/* ---------- Section 2 — Aide IA ---------- */}
            <div className="space-y-5 border-t border-white/5 pt-8">
              <p className={sectionHeadingCls}>Aide IA</p>

              <div className="sm:w-1/2 sm:pr-4">
                <Alert
                  type="info"
                  title="Structure et génère ton projet à l'aide de l'IA"
                  description="Renseigne la description détaillée du projet ci-dessous puis lance « Structurer avec l'IA » pour générer automatiquement la description courte, le problème, les décisions, le résultat, et les suggestions de tags."
                />
              </div>

              <div>
                <label htmlFor="pd-long-desc" className={labelCls}>
                  Description du projet
                </label>
                <textarea
                  id="pd-long-desc"
                  rows={estimateRows(MAX_LENGTHS.long_desc)}
                  value={draft.long_desc ?? ""}
                  onChange={(e) => setDraft({ ...draft, long_desc: e.target.value })}
                  className={inputCls + " mt-2 resize-y"}
                  placeholder="Décris le projet, l'étude de cas, les mots-clés comme ça te vient à l'esprit..."
                />
                <div className="mt-1 flex items-center justify-between">
                  {fieldError("long_desc")}
                  {counter("long_desc", draft.long_desc)}
                </div>
              </div>

              {aiError && <Alert type="error" title={aiError} />}

              <div className="grid items-end gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="pd-subtitle" className={aiLabelCls}>
                    <Sparkles aria-hidden="true" size={14} className={aiIconCls} />
                    Description courte du projet
                  </label>
                  {aiLoading ? (
                    aiFieldSkeleton(MAX_LENGTHS.short_desc)
                  ) : (
                    <textarea
                      id="pd-subtitle"
                      rows={estimateRows(MAX_LENGTHS.short_desc)}
                      value={draft.short_desc ?? ""}
                      onChange={(e) => setShortDesc(e.target.value)}
                      className={inputCls + " mt-2 resize-y"}
                    />
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    {fieldError("short_desc")}
                    {counter("short_desc", draft.short_desc)}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAiStructure}
                    disabled={!draft.long_desc?.trim() || aiLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary-container/5 px-6 py-4 text-sm font-medium text-primary hover:bg-primary-container/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles
                      aria-hidden="true"
                      size={20}
                      className={aiLoading ? "animate-pulse" : ""}
                    />
                    {aiLoading ? "Structuration…" : "Structurer avec l'IA"}
                  </button>
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="pd-problem" className={aiLabelCls}>
                      <Sparkles aria-hidden="true" size={14} className={aiIconCls} />
                      Problème
                    </label>
                    {aiLoading ? (
                      aiFieldSkeleton(MAX_LENGTHS.probleme)
                    ) : (
                      <textarea
                        id="pd-problem"
                        rows={estimateRows(MAX_LENGTHS.probleme)}
                        value={draft.ai_structured_desc?.probleme ?? ""}
                        onChange={(e) => setAiStructuredField("probleme", e.target.value)}
                        className={inputCls + " mt-2 resize-y"}
                      />
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      {fieldError("probleme")}
                      {counter("probleme", draft.ai_structured_desc?.probleme)}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pd-decisions" className={aiLabelCls}>
                      <Sparkles aria-hidden="true" size={14} className={aiIconCls} />
                      Décisions
                    </label>
                    {aiLoading ? (
                      aiFieldSkeleton(MAX_LENGTHS.decisions)
                    ) : (
                      <textarea
                        id="pd-decisions"
                        rows={estimateRows(MAX_LENGTHS.decisions)}
                        value={draft.ai_structured_desc?.decisions ?? ""}
                        onChange={(e) => setAiStructuredField("decisions", e.target.value)}
                        className={inputCls + " mt-2 resize-y"}
                      />
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      {fieldError("decisions")}
                      {counter("decisions", draft.ai_structured_desc?.decisions)}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pd-result" className={aiLabelCls}>
                      <Sparkles aria-hidden="true" size={14} className={aiIconCls} />
                      Résultat
                    </label>
                    {aiLoading ? (
                      aiFieldSkeleton(MAX_LENGTHS.resultat)
                    ) : (
                      <textarea
                        id="pd-result"
                        rows={estimateRows(MAX_LENGTHS.resultat)}
                        value={draft.ai_structured_desc?.resultat ?? ""}
                        onChange={(e) => setAiStructuredField("resultat", e.target.value)}
                        className={inputCls + " mt-2 resize-y"}
                      />
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      {fieldError("resultat")}
                      {counter("resultat", draft.ai_structured_desc?.resultat)}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <TagPicker
                      label="Types de design"
                      category="designType"
                      refTable="project_types_ref"
                      fetchOptions={getTypesRef}
                      selected={draft.tags.types}
                      onChange={(types) => setDraft({ ...draft, tags: { ...draft.tags, types } })}
                    />
                    {suggestionChips("types")}
                  </div>
                  <div className="space-y-2">
                    <TagPicker
                      label="Outils"
                      category="tools"
                      refTable="tools_ref"
                      fetchOptions={getToolsRef}
                      selected={draft.tags.tools}
                      onChange={(tools) => setDraft({ ...draft, tags: { ...draft.tags, tools } })}
                    />
                    {suggestionChips("tools")}
                  </div>
                  <div className="space-y-2">
                    <TagPicker
                      label="Mots-clés"
                      category="keywords"
                      refTable="keywords_ref"
                      fetchOptions={getKeywordsRef}
                      selected={draft.tags.keywords}
                      onChange={(keywords) =>
                        setDraft({ ...draft, tags: { ...draft.tags, keywords } })
                      }
                    />
                    {suggestionChips("keywords")}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------- Section 3 — Contexte client ---------- */}
            <div className="space-y-5 border-t border-white/5 pt-8">
              <p className={sectionHeadingCls}>Contexte client</p>

              <div className="grid gap-5 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label htmlFor="pd-secteur" className={labelCls}>
                    Secteur d'activité
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="pd-secteur"
                      value={draft.secteur_activite ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          secteur_activite: (e.target.value || null) as Project["secteur_activite"],
                        })
                      }
                      className={selectCls}
                    >
                      <option value="">— Choisir —</option>
                      {Object.entries(SECTEUR_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden="true" size={18} className={chevronCls} />
                  </div>
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
                  <div className="group relative mt-2">
                    <input
                      id="pd-start"
                      type="date"
                      value={draft.start_date ?? ""}
                      onChange={(e) => setDraft({ ...draft, start_date: e.target.value || null })}
                      className={
                        inputCls +
                        " pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                      }
                    />
                    <CalendarIcon
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary transition-colors group-hover:text-white"
                    />
                  </div>
                  {fieldError("start_date")}
                </div>
                <div>
                  <label htmlFor="pd-end" className={labelCls}>
                    Date de fin
                  </label>
                  <div className="group relative mt-2">
                    <input
                      id="pd-end"
                      type="date"
                      value={draft.end_date ?? ""}
                      onChange={(e) => setDraft({ ...draft, end_date: e.target.value || null })}
                      className={
                        inputCls +
                        " pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                      }
                    />
                    <CalendarIcon
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary transition-colors group-hover:text-white"
                    />
                  </div>
                  {fieldError("end_date")}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/5 px-10 py-4">
            <button type="button" onClick={requestClose} className={tertiaryBtnCls}>
              Annuler
            </button>
            {!project && (
              <button
                type="button"
                onClick={() => submitWithStatus("draft", "draft")}
                disabled={savingAction !== null}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingAction === "draft" ? "Enregistrement…" : "Enregistrer comme brouillon"}
              </button>
            )}
            <button
              type="button"
              onClick={() => submitWithStatus(draft.status, "publish")}
              disabled={savingAction !== null || !isValid}
              className="rounded-full bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:brightness-100"
            >
              {savingAction === "publish" ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </aside>

      {pendingSave && project && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setPendingSave(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-md rounded-2xl border border-white/10 bg-surface-container-lowest p-6">
            <h3 className="text-lg font-medium text-on-surface">
              Confirmer le changement de statut ?
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {STATUS_LABELS[project.status]} → {STATUS_LABELS[pendingSave.status]}. Effet immédiat
              sur le catalogue une fois confirmé.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingSave(null)}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const { status, action } = pendingSave;
                  setPendingSave(null);
                  persist(status, action);
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
