import {
  ArrowRight,
  CircleAlert,
  CircleCheckBig,
  Eye,
  EyeOff,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";

import { Alert } from "@/components/Alert";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Checkbox } from "@/components/Checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { designer } from "@/data/designer";
import { getProjects } from "@/data/projects";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { textLinkClass } from "@/lib/linkStyles";
import { formatSecteur } from "@/lib/secteurLabels";
import type { Project } from "@/types/project";

interface AccessRequestModalProps {
  open: boolean;
  onClose: () => void;
  initialProject?: Project | null;
  onSuccess?: () => void;
  /** Projets pour lesquels le visiteur a déjà une demande (pending/approved/refused) — exclus de la sélection pour éviter les doublons. */
  excludeProjectIds?: string[];
}

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 8 caractères min., au moins une lettre et un chiffre.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

type FieldKey = "name" | "company" | "email" | "password" | "confirmPassword";
type FieldState = { kind: "valid" | "warning" | "error"; message: string };

const emptyForm = {
  name: "",
  company: "",
  email: "",
  password: "",
  confirmPassword: "",
  message: "",
  rgpd: false,
  consentGivenAt: null as string | null,
  projectIds: [] as string[],
};

function getFieldState(key: FieldKey, form: typeof emptyForm): FieldState {
  switch (key) {
    case "name":
      return form.name.trim()
        ? { kind: "valid", message: "Validé" }
        : { kind: "error", message: "Ce champ est requis." };
    case "company":
      return form.company.trim()
        ? { kind: "valid", message: "Validé" }
        : { kind: "error", message: "Ce champ est requis." };
    case "email":
      if (!form.email.trim()) return { kind: "error", message: "Ce champ est requis." };
      return EMAIL_RULE.test(form.email)
        ? { kind: "valid", message: "Validé" }
        : { kind: "error", message: "Veuillez entrer une adresse email valide." };
    case "password":
      if (!form.password) return { kind: "error", message: "Ce champ est requis." };
      return PASSWORD_RULE.test(form.password)
        ? { kind: "valid", message: "Validé" }
        : { kind: "warning", message: "8 caractères min., avec au moins une lettre et un chiffre." };
    case "confirmPassword":
      if (!form.confirmPassword) return { kind: "error", message: "Ce champ est requis." };
      return form.confirmPassword === form.password
        ? { kind: "valid", message: "Validé" }
        : { kind: "error", message: "Les mots de passe ne correspondent pas." };
  }
}

function isFormValid(form: typeof emptyForm, isAuthenticated: boolean): boolean {
  if (!isAuthenticated) {
    return (
      form.name.trim() !== "" &&
      form.company.trim() !== "" &&
      EMAIL_RULE.test(form.email) &&
      PASSWORD_RULE.test(form.password) &&
      form.confirmPassword === form.password &&
      form.rgpd &&
      form.projectIds.length > 0
    );
  }
  return form.rgpd && form.projectIds.length > 0;
}

function mapSubmitError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (/already registered|already exists/i.test(msg)) {
    return "Un compte existe déjà avec cet email. Connectez-vous pour suivre votre demande.";
  }
  if (msg) return msg;
  return "Une erreur est survenue. Réessayez.";
}

function FieldHint({ state }: { state: FieldState }) {
  const Icon = state.kind === "valid" ? CircleCheckBig : state.kind === "warning" ? TriangleAlert : CircleAlert;
  const colorClass =
    state.kind === "valid" ? "text-primary" : state.kind === "warning" ? "text-warning" : "text-error";
  return (
    <p className={"mt-1 flex items-center gap-1 text-xs " + colorClass} role="alert">
      <Icon aria-hidden="true" size={14} />
      {state.message}
    </p>
  );
}

// Le focus (saisie en cours) reste teal ; une fois validé, la bordure
// redevient neutre — seuls l'icône CheckCircle2 + "Validé" en text-primary
// portent l'information, pour ne pas se confondre visuellement avec le focus.
function borderClassFor(state: FieldState | null): string {
  if (!state) return "border-outline focus:border-primary";
  if (state.kind === "valid") return "border-outline focus:border-primary";
  if (state.kind === "warning") return "border-warning";
  return "border-error";
}

export function AccessRequestModal({
  open,
  onClose,
  initialProject,
  onSuccess,
  excludeProjectIds,
}: AccessRequestModalProps) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!session;
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<FieldKey | "rgpd" | "projectIds", boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confidentialProjects, setConfidentialProjects] = useState<Project[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setSubmitError(null);
      setTouched({});
      setForm({ ...emptyForm, projectIds: initialProject ? [initialProject.id] : [] });
      const exclude = new Set(excludeProjectIds);
      getProjects()
        .then((all) =>
          setConfidentialProjects(
            all.filter((p) => p.status === "confidential" && !exclude.has(p.id)),
          ),
        )
        .catch(() => setConfidentialProjects([]));
    }
    // excludeProjectIds volontairement absent des deps : ne re-filtrer qu'à l'ouverture,
    // pas à chaque changement de myRequests pendant que la modale est ouverte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialProject]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Un seul scroll actif pendant que la modale est ouverte : celui de son
  // propre corps, jamais celui de la page derrière.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const touch = (key: FieldKey | "rgpd") => setTouched((t) => ({ ...t, [key]: true }));
  const fieldState = (key: FieldKey) => (touched[key] ? getFieldState(key, form) : null);

  const toggleProject = (id: string) =>
    setForm((f) => ({
      ...f,
      projectIds: f.projectIds.includes(id)
        ? f.projectIds.filter((x) => x !== id)
        : [...f.projectIds, id],
    }));

  const goToProjects = () => {
    onClose();
    navigate(`/${designer.slug}/projects`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(
      isAuthenticated
        ? { rgpd: true, projectIds: true }
        : {
            name: true,
            company: true,
            email: true,
            password: true,
            confirmPassword: true,
            rgpd: true,
            projectIds: true,
          },
    );
    setSubmitError(null);
    if (!isFormValid(form, isAuthenticated)) return;

    setSubmitting(true);
    try {
      let userId: string;

      if (isAuthenticated) {
        userId = session!.user.id;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } },
        });
        if (error) throw error;
        if (!data.session || !data.user) {
          throw new Error(
            "Compte créé — confirmez votre email pour finaliser votre demande d'accès.",
          );
        }
        userId = data.user.id;

        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({ company: form.company, request_message: form.message || null })
          .eq("id", userId);
        if (profileError) throw profileError;
      }

      const requestSessionId = crypto.randomUUID();
      const consentGivenAt = form.consentGivenAt ?? new Date().toISOString();
      const rows = form.projectIds.map((projectId) => ({
        user_id: userId,
        project_id: projectId,
        request_session_id: requestSessionId,
        consent_given_at: consentGivenAt,
        message: form.message || null,
      }));
      const { error: insertError } = await supabase.from("access_requests").insert(rows);
      if (insertError) throw insertError;

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setSubmitError(mapSubmitError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus-visible:outline-none";

  const projectsTouchedInvalid = touched.projectIds && form.projectIds.length === 0;
  const rgpdTouchedInvalid = touched.rgpd && !form.rgpd;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Demander l'accès aux projets confidentiels"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    >
      <AuroraBackground />
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="glass-card relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden !border-primary/10 rounded-2xl shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le formulaire"
          className="absolute right-6 top-6 z-20 rounded-full p-2 text-on-surface-variant/70 transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X aria-hidden="true" size={24} />
        </button>

        {submitted ? (
          <div className="overflow-y-auto p-6 text-center md:p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
              <CircleCheckBig aria-hidden="true" className="text-primary" size={48} />
            </div>
            <h2 className="mb-4 text-2xl font-medium text-on-surface">Demande envoyée</h2>
            <p className="mb-8 text-sm text-on-surface-variant">
              Votre demande est bien envoyée. Notre équipe examinera votre profil et vous
              répondra par email sous 24h.
            </p>
            <button
              type="button"
              onClick={goToProjects}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-8 py-3 text-sm font-bold text-on-primary-container transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Retour aux projets
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="shrink-0 p-6 pb-0 md:p-10 md:pb-0">
              <div className="mb-6">
                <span className="mb-3 block text-xs font-medium uppercase tracking-widest text-primary">
                  Demande d'accès exclusif
                </span>
                <h2 className="mb-2 text-2xl font-medium text-on-surface md:text-3xl">
                  Demander l'accès
                </h2>
                <p className="max-w-md text-sm text-on-surface-variant">
                  Accédez aux études de cas confidentielles et aux détails de projets sous accord
                  de divulgation restreinte.
                </p>
              </div>
              {submitError && (
                <div className="mb-6">
                  <Alert type="error" title="Impossible d'envoyer la demande" description={submitError} />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6 pt-6 md:p-10 md:pt-6">
                {!isAuthenticated && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="ar-name" className="mb-1 block text-xs font-medium text-on-surface-variant">
                          Nom complet
                        </label>
                        <input
                          id="ar-name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          onBlur={() => touch("name")}
                          placeholder="Jean Dupont"
                          aria-describedby={fieldState("name") ? "ar-name-hint" : undefined}
                          className={inputCls + " " + borderClassFor(fieldState("name"))}
                        />
                        {fieldState("name") && (
                          <span id="ar-name-hint">
                            <FieldHint state={fieldState("name")!} />
                          </span>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="ar-company"
                          className="mb-1 block text-xs font-medium text-on-surface-variant"
                        >
                          Entreprise
                        </label>
                        <input
                          id="ar-company"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          onBlur={() => touch("company")}
                          placeholder="Nom de votre structure"
                          aria-describedby={fieldState("company") ? "ar-company-hint" : undefined}
                          className={inputCls + " " + borderClassFor(fieldState("company"))}
                        />
                        {fieldState("company") && (
                          <span id="ar-company-hint">
                            <FieldHint state={fieldState("company")!} />
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="ar-email" className="mb-1 block text-xs font-medium text-on-surface-variant">
                        Email professionnel
                      </label>
                      <input
                        id="ar-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onBlur={() => touch("email")}
                        placeholder="jean@entreprise.com"
                        aria-describedby={fieldState("email") ? "ar-email-hint" : undefined}
                        className={inputCls + " " + borderClassFor(fieldState("email"))}
                      />
                      {fieldState("email") && (
                        <span id="ar-email-hint">
                          <FieldHint state={fieldState("email")!} />
                        </span>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ar-password"
                          className="mb-1 block text-xs font-medium text-on-surface-variant"
                        >
                          Mot de passe souhaité
                        </label>
                        <div className="relative">
                          <input
                            id="ar-password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            onBlur={() => touch("password")}
                            aria-describedby={fieldState("password") ? "ar-password-hint" : undefined}
                            className={inputCls + " pr-12 " + borderClassFor(fieldState("password"))}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            {showPassword ? (
                              <EyeOff aria-hidden="true" size={18} />
                            ) : (
                              <Eye aria-hidden="true" size={18} />
                            )}
                          </button>
                        </div>
                        {fieldState("password") && (
                          <span id="ar-password-hint">
                            <FieldHint state={fieldState("password")!} />
                          </span>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="ar-confirm-password"
                          className="mb-1 block text-xs font-medium text-on-surface-variant"
                        >
                          Répéter le mot de passe
                        </label>
                        <div className="relative">
                          <input
                            id="ar-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            onBlur={() => touch("confirmPassword")}
                            aria-describedby={
                              fieldState("confirmPassword") ? "ar-confirm-password-hint" : undefined
                            }
                            className={inputCls + " pr-12 " + borderClassFor(fieldState("confirmPassword"))}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            aria-label={
                              showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            {showConfirmPassword ? (
                              <EyeOff aria-hidden="true" size={18} />
                            ) : (
                              <Eye aria-hidden="true" size={18} />
                            )}
                          </button>
                        </div>
                        {fieldState("confirmPassword") && (
                          <span id="ar-confirm-password-hint">
                            <FieldHint state={fieldState("confirmPassword")!} />
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <fieldset>
                  <div className="mb-3 flex items-center gap-2">
                    <legend className="text-xs font-medium text-on-surface-variant">
                      Projets demandés
                    </legend>
                    <StatusBadge kind="confidential" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {confidentialProjects.map((p) => {
                      const checked = form.projectIds.includes(p.id);
                      const meta = [formatSecteur(p.secteur_activite), p.company_name]
                        .filter(Boolean)
                        .join(" • ");
                      return (
                        <label
                          key={p.id}
                          className="group flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-white/5"
                        >
                          <Checkbox checked={checked} onChange={() => toggleProject(p.id)} className="mt-0.5" />
                          <span className="flex flex-col">
                            <span className="text-sm text-on-surface transition-colors group-hover:text-primary">
                              {p.title}
                            </span>
                            {meta && (
                              <span className="text-[11px] text-on-surface-variant">{meta}</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {projectsTouchedInvalid && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-error" role="alert">
                      <CircleAlert aria-hidden="true" size={14} />
                      Sélectionnez au moins un projet.
                    </p>
                  )}
                </fieldset>

                <div>
                  <label htmlFor="ar-message" className="mb-1 block text-xs font-medium text-on-surface-variant">
                    Message (Optionnel)
                  </label>
                  <textarea
                    id="ar-message"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Dites-nous en plus sur votre besoin..."
                    className={inputCls + " resize-y border-outline focus:border-primary"}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ar-gdpr"
                    checked={form.rgpd}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rgpd: e.target.checked,
                        consentGivenAt: e.target.checked ? new Date().toISOString() : null,
                      })
                    }
                    onBlur={() => touch("rgpd")}
                    aria-describedby={rgpdTouchedInvalid ? "ar-gdpr-hint" : undefined}
                    className="mt-0.5"
                  />
                  <label htmlFor="ar-gdpr" className="text-sm leading-relaxed text-on-surface-variant">
                    J'accepte que Folio+ traite mes données pour gérer ma demande d'accès
                    conformément à la{" "}
                    <Link
                      to="/politique-de-confidentialite"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={textLinkClass("default")}
                    >
                      politique de confidentialité
                    </Link>
                    .
                  </label>
                </div>
                {rgpdTouchedInvalid && (
                  <p id="ar-gdpr-hint" className="-mt-4 flex items-center gap-1 text-xs text-error" role="alert">
                    <CircleAlert aria-hidden="true" size={14} />
                    Ce consentement est requis pour envoyer votre demande.
                  </p>
                )}
              </div>

              <div className="shrink-0 border-t border-white/5 p-6 md:p-10">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                  {isAuthenticated ? (
                    <span />
                  ) : (
                    <Link
                      to="/auth"
                      className="text-sm text-on-surface-variant no-underline transition-colors hover:text-on-surface"
                    >
                      Déjà un compte ?{" "}
                      <span className={textLinkClass("default")}>Se connecter</span>
                    </Link>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-primary-container px-10 py-4 text-sm font-bold text-on-primary-container transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                  >
                    {submitting ? "Envoi..." : "Envoyer ma demande"}
                    <ArrowRight aria-hidden="true" size={20} />
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
