import { ArrowLeft, CircleAlert, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { AuroraBackground } from "@/components/AuroraBackground";
import { IconTooltip } from "@/components/IconTooltip";
import { designer } from "@/data/designer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { supabase } from "@/integrations/supabase/client";
import { textLinkClass } from "@/lib/linkStyles";

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function redirectByRole(userId: string, navigate: (path: string) => void) {
  const { data } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  navigate(data?.role === "admin" ? "/admin" : `/${designer.slug}/projects`);
}

export function AuthPage() {
  useDocumentTitle("Connexion");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) redirectByRole(data.session.user.id, navigate);
    });
  }, [navigate]);

  const emailInvalid = touched.email && !EMAIL_RULE.test(email);
  const passwordInvalid = touched.password && !password;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError(null);
    if (!EMAIL_RULE.test(email) || !password) return;
    setSubmitting(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);
    if (err || !data.user) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    await redirectByRole(data.user.id, navigate);
  };

  const inputCls =
    "rounded-full border bg-transparent px-5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-screen items-center justify-center bg-background px-5 py-12"
    >
      <AuroraBackground variant="modal" />

      <Link
        to={`/${designer.slug}`}
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 text-sm text-on-surface-variant no-underline transition-colors hover:text-on-surface md:left-8 md:top-8"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Retour au portfolio
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-surface-container-lowest p-8 shadow-2xl shadow-black/40">
        <h1 className="mb-2 text-2xl font-medium tracking-tight text-on-surface">
          Folio<span className="text-primary">+</span>
        </h1>
        <h2 className="mb-2 text-xl font-medium text-on-surface">Content de vous revoir</h2>
        <p className="mb-8 text-sm text-on-surface-variant">
          Connectez-vous pour accéder à votre espace — administration ou projets confidentiels
          validés.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-on-surface">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={Boolean(emailInvalid)}
              aria-describedby={emailInvalid ? "auth-email-hint" : undefined}
              className={
                inputCls + " " + (emailInvalid ? "border-error" : "border-outline focus:border-primary")
              }
              placeholder="vous@exemple.com"
            />
            {emailInvalid && (
              <p id="auth-email-hint" className="flex items-center gap-1 text-xs text-error" role="alert">
                <CircleAlert aria-hidden="true" size={14} />
                Adresse email invalide.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-on-surface">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={Boolean(passwordInvalid)}
                aria-describedby={passwordInvalid ? "auth-password-hint" : undefined}
                className={
                  inputCls +
                  " w-full pr-12 " +
                  (passwordInvalid ? "border-error" : "border-outline focus:border-primary")
                }
                placeholder="••••••••"
              />
              <IconTooltip label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" size={18} />
                  ) : (
                    <Eye aria-hidden="true" size={18} />
                  )}
                </button>
              </IconTooltip>
            </div>
            {passwordInvalid && (
              <p id="auth-password-hint" className="flex items-center gap-1 text-xs text-error" role="alert">
                <CircleAlert aria-hidden="true" size={14} />
                Ce champ est requis.
              </p>
            )}
          </div>

          {error && <Alert type="error" title="Connexion impossible" description={error} />}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:brightness-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Pas encore de compte ?{" "}
          <Link to={`/${designer.slug}/projects`} className={textLinkClass("default")}>
            Demandez l'accès à un projet
          </Link>
        </p>
      </div>
    </main>
  );
}
