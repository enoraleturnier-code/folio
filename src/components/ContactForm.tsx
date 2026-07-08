import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    rgpd: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rgpd) return;
    setSubmitted(true);
  };

  const inputCls =
    "w-full rounded-xl border border-white/5 bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const labelCls = "block text-sm font-medium text-on-surface-variant";

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <span aria-hidden="true" className="material-symbols-outlined text-3xl text-primary">
          mark_email_read
        </span>
        <h3 className="mt-3 text-lg font-medium text-on-surface">Merci — message reçu.</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Je reviens vers vous sous 48 heures ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="cf-name" className={labelCls}>
          Nom complet
        </label>
        <input
          id="cf-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputCls + " mt-2"}
          placeholder="Prénom Nom"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-email" className={labelCls}>
            Email professionnel
          </label>
          <input
            id="cf-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls + " mt-2"}
            placeholder="vous@entreprise.com"
          />
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
            className={inputCls + " mt-2"}
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
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputCls + " mt-2 resize-y"}
          placeholder="Décrivez le contexte et l'échéance."
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
          J'accepte que mes données soient utilisées pour traiter ma demande, conformément à la
          politique de confidentialité.
        </span>
      </label>

      <button
        type="submit"
        disabled={!form.rgpd}
        className="w-full rounded-full bg-primary-container px-6 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white/4 disabled:text-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Envoyer le message
      </button>
    </form>
  );
}
