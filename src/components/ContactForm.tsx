import { CircleAlert, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Alert } from "@/components/Alert";
import { Checkbox } from "@/components/Checkbox";
import { submitContact } from "@/data/contacts";
import { textLinkClass } from "@/lib/linkStyles";
import { cn } from "@/lib/utils";

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = "name" | "email" | "message";

const FIELD_LABELS: Record<FieldKey, string> = {
  name: "Nom",
  email: "Email",
  message: "Message",
};

/** id DOM de chaque champ -- sert à retrouver et focus le premier champ en erreur (cf. ProjectDrawer.focusFirstError). */
const FIELD_INPUT_IDS: Record<FieldKey, string> = {
  name: "cf-name",
  email: "cf-email",
  message: "cf-message",
};

function fieldErrorMessage(key: FieldKey, value: string): string | null {
  if (!value.trim()) return `Le champ ${FIELD_LABELS[key]} est obligatoire.`;
  if (key === "email" && !EMAIL_RULE.test(value)) return "Le format de l'email n'est pas valide.";
  return null;
}

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", rgpd: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors: Partial<Record<FieldKey, string>> = {};
  (["name", "email", "message"] as FieldKey[]).forEach((key) => {
    const msg = fieldErrorMessage(key, form[key]);
    if (msg) errors[key] = msg;
  });
  const rgpdMissing = !form.rgpd;

  const showError = (key: FieldKey) => submitAttempted && Boolean(errors[key]);

  // Amène l'utilisateur au premier champ en erreur selon sa position visuelle réelle,
  // pas l'ordre de validation -- même pattern que ProjectDrawer.focusFirstError().
  const focusFirstError = () => {
    let target: HTMLElement | null = null;
    let targetTop = Infinity;
    for (const key of Object.keys(errors) as FieldKey[]) {
      const el = document.getElementById(FIELD_INPUT_IDS[key]);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top < targetTop) {
        targetTop = top;
        target = el;
      }
    }
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.focus({ preventScroll: true });
  };

  const updateField = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setSucceeded(false);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitError(null);

    if (Object.keys(errors).length > 0) {
      focusFirstError();
      return;
    }
    if (rgpdMissing || submitting) return;

    setSubmitting(true);
    try {
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setForm({ name: "", email: "", message: "", rgpd: false });
      setSubmitAttempted(false);
      setSucceeded(true);
    } catch {
      setSubmitError("Le message n'a pas pu être envoyé. Réessaie dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border bg-surface-container px-4 py-3 text-sm font-light text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const labelCls = "block text-sm font-medium text-on-surface-variant";

  function borderClassFor(key: FieldKey) {
    return showError(key) ? "border-error focus-visible:ring-error" : "border-outline";
  }

  function errorHint(key: FieldKey) {
    if (!showError(key)) return null;
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-error" role="alert">
        <CircleAlert aria-hidden="true" size={14} className="shrink-0" />
        {errors[key]}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {succeeded && (
        <Alert
          type="success"
          title="Merci — message reçu."
          description="Je reviens vers vous sous 48 heures ouvrées."
        />
      )}
      {submitError && (
        <Alert type="error" title="Une erreur est survenue" description={submitError} />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="cf-name" className={labelCls}>
            Nom
          </label>
          <input
            id="cf-name"
            type="text"
            value={form.name}
            onChange={(e) => updateField({ name: e.target.value })}
            className={cn(inputCls, "mt-2", borderClassFor("name"))}
            placeholder="Prénom Nom"
          />
          {errorHint("name")}
        </div>

        <div>
          <label htmlFor="cf-email" className={labelCls}>
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            value={form.email}
            onChange={(e) => updateField({ email: e.target.value })}
            className={cn(inputCls, "mt-2", borderClassFor("email"))}
            placeholder="vous@entreprise.com"
          />
          {errorHint("email")}
        </div>

        <div>
          <label htmlFor="cf-message" className={labelCls}>
            Message
          </label>
          <textarea
            id="cf-message"
            rows={5}
            value={form.message}
            onChange={(e) => updateField({ message: e.target.value })}
            className={cn(inputCls, "mt-2 resize-y", borderClassFor("message"))}
            placeholder="Décrivez le contexte et l'échéance."
          />
          {errorHint("message")}
        </div>

        <label className="flex items-start gap-3 text-sm text-on-surface-variant">
          <Checkbox
            checked={form.rgpd}
            onChange={(e) => updateField({ rgpd: e.target.checked })}
            className="mt-0.5"
          />
          <span>
            J'accepte que mes données soient utilisées pour traiter ma demande, conformément à la{" "}
            <Link
              to="/politique-de-confidentialite"
              target="_blank"
              rel="noopener noreferrer"
              className={textLinkClass("default")}
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {submitAttempted && rgpdMissing && (
          <p className="-mt-3 flex items-center gap-1 text-xs text-error" role="alert">
            <CircleAlert aria-hidden="true" size={14} className="shrink-0" />
            Ce consentement est requis pour envoyer votre message.
          </p>
        )}

        <button
          type="submit"
          disabled={rgpdMissing || submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {submitting ? (
            <Loader2 aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <Send aria-hidden="true" size={18} />
          )}
          Envoyer
        </button>
      </form>
    </div>
  );
}
