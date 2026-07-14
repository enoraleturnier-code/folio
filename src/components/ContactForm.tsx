import { CircleAlert, MailCheck, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { textLinkClass } from "@/lib/linkStyles";

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = "name" | "email" | "message";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    rgpd: false,
  });
  const [touched, setTouched] = useState<Partial<Record<FieldKey | "rgpd", boolean>>>({});

  const fieldInvalid = (key: FieldKey) => {
    if (!touched[key]) return false;
    if (key === "email") return !EMAIL_RULE.test(form.email);
    return !form[key].trim();
  };
  const rgpdInvalid = touched.rgpd && !form.rgpd;

  const touch = (key: FieldKey | "rgpd") => setTouched((t) => ({ ...t, [key]: true }));

  const isValid =
    form.name.trim() !== "" && EMAIL_RULE.test(form.email) && form.message.trim() !== "" && form.rgpd;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true, rgpd: true });
    if (!isValid) return;
    setSubmitted(true);
  };

  const inputCls =
    "w-full rounded-xl border bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const labelCls = "block text-sm font-medium text-on-surface-variant";

  function borderClassFor(key: FieldKey) {
    return fieldInvalid(key) ? "border-error" : "border-white/5";
  }

  function errorHint(key: FieldKey, message: string) {
    if (!fieldInvalid(key)) return null;
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-error" role="alert">
        <CircleAlert aria-hidden="true" size={14} />
        {message}
      </p>
    );
  }

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <MailCheck aria-hidden="true" className="text-primary" size={30} />
        <h3 className="mt-3 text-lg font-medium text-on-surface">Merci — message reçu.</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Je reviens vers vous sous 48 heures ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="cf-name" className={labelCls}>
          Nom complet
        </label>
        <input
          id="cf-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onBlur={() => touch("name")}
          className={inputCls + " mt-2 " + borderClassFor("name")}
          placeholder="Prénom Nom"
        />
        {errorHint("name", "Ce champ est requis.")}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-email" className={labelCls}>
            Email professionnel
          </label>
          <input
            id="cf-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onBlur={() => touch("email")}
            className={inputCls + " mt-2 " + borderClassFor("email")}
            placeholder="vous@entreprise.com"
          />
          {errorHint("email", "Adresse email invalide.")}
        </div>
        <div>
          <label htmlFor="cf-company" className={labelCls}>
            Entreprise
          </label>
          <input
            id="cf-company"
            type="text"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className={inputCls + " mt-2 border-white/5"}
            placeholder="Nom de l'entreprise"
          />
        </div>
      </div>
      <div>
        <label htmlFor="cf-message" className={labelCls}>
          Message
        </label>
        <textarea
          id="cf-message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          onBlur={() => touch("message")}
          className={inputCls + " mt-2 resize-y " + borderClassFor("message")}
          placeholder="Décrivez le contexte et l'échéance."
        />
        {errorHint("message", "Ce champ est requis.")}
      </div>

      <label className="flex items-start gap-3 text-sm text-on-surface-variant">
        <input
          type="checkbox"
          checked={form.rgpd}
          onChange={(e) => setForm({ ...form, rgpd: e.target.checked })}
          onBlur={() => touch("rgpd")}
          className="mt-0.5 h-4 w-4 rounded border border-outline bg-surface-container text-primary focus:ring-primary"
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
      {rgpdInvalid && (
        <p className="-mt-3 flex items-center gap-1 text-xs text-error" role="alert">
          <CircleAlert aria-hidden="true" size={14} />
          Ce consentement est requis pour envoyer votre message.
        </p>
      )}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Envoyer le message
        <Send aria-hidden="true" size={18} />
      </button>
    </form>
  );
}
