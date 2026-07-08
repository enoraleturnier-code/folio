import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { designer } from "@/data/designer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const location = useLocation();
  const { session, role, roleLoading, fullName } = useAuth();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-16">
        <div className={`flex items-center gap-4 md:gap-6 ${isAdminRoute ? "ml-20 md:ml-24" : ""}`}>
          {!isAdminRoute && (
            <>
              <Link
                to="/$slug"
                params={{ slug: designer.slug }}
                className="text-2xl font-medium tracking-tight text-on-surface"
              >
                Folio<span className="text-primary">+</span>
              </Link>
              <div className="h-3.5 w-px bg-white/15" />
            </>
          )}
          <span className="whitespace-nowrap text-sm font-medium text-on-surface md:text-base">
            {designer.fullName}
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <nav className="hidden items-center gap-6 md:flex">
            <VisitorLink to="/$slug" params={{ slug: designer.slug }} label="Profil" />
            <VisitorLink to="/$slug/projects" params={{ slug: designer.slug }} label="Projets" />
          </nav>

          <ThemeToggle />

          {!session && (
            <Link
              to="/auth"
              aria-label="Se connecter"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-on-surface transition-colors hover:border-primary"
            >
              Se connecter
            </Link>
          )}

          {session && (
            <AccountMenu fullName={fullName} role={role} roleLoading={roleLoading} />
          )}
        </div>
      </div>
    </header>
  );
}

function VisitorLink({
  to,
  params,
  label,
}: {
  to: "/$slug" | "/$slug/projects";
  params: { slug: string };
  label: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
      activeProps={{ className: "text-primary font-bold text-sm" }}
      activeOptions={{ exact: true }}
    >
      {label}
    </Link>
  );
}

function AccountMenu({
  fullName,
  role,
  roleLoading,
}: {
  fullName: string | null;
  role: string | null;
  roleLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isAdmin = role === "admin";

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Mon compte"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={
            "flex items-center justify-center rounded-full font-bold text-primary " +
            (isAdmin
              ? "h-6 w-6 border border-primary/30 bg-on-primary/20 text-[10px]"
              : "h-8 w-8 bg-on-primary/10 text-xs")
          }
        >
          {fullName ? initials(fullName) : "?"}
        </span>
        {fullName ?? "Mon compte"}
        <span aria-hidden="true" className="material-symbols-outlined text-sm">
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu du compte"
          className="absolute right-0 z-[80] mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low shadow-2xl"
        >
          <div className="flex flex-col py-2">
            {!roleLoading && isAdmin && (
              <Link
                to="/admin"
                search={{ tab: "parametres" }}
                role="menuitem"
                aria-label="Paramètres"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-white/5"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant">
                  settings
                </span>
                Paramètres
              </Link>
            )}
            {!roleLoading && (role === "pending" || role === "validated_visitor") && (
              <Link
                to="/account"
                role="menuitem"
                aria-label="Mon profil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-white/5"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant">
                  person
                </span>
                Mon profil
              </Link>
            )}
            <div className="my-1 border-t border-white/8" />
            <button
              type="button"
              role="menuitem"
              aria-label="Se déconnecter"
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-primary transition-colors hover:bg-primary-container/10"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                logout
              </span>
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
