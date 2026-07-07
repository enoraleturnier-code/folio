import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { designer } from "@/data/designer";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./ThemeToggle";

export type HeaderRole = "anon" | "visitor" | "admin";

interface HeaderProps {
  role: HeaderRole;
}

export function Header({ role }: HeaderProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const showVisitorNav = role === "visitor";

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
          {showVisitorNav && (
            <nav className="hidden items-center gap-6 md:flex">
              <VisitorLink
                to="/$slug"
                params={{ slug: designer.slug }}
                label="Profil"
              />
              <VisitorLink
                to="/$slug/projects"
                params={{ slug: designer.slug }}
                label="Projets"
              />
            </nav>
          )}

          {role === "admin" && (
            <nav className="hidden items-center gap-6 md:flex">
              <VisitorLink
                to="/$slug"
                params={{ slug: designer.slug }}
                label="Profil"
              />
              <VisitorLink
                to="/$slug/projects"
                params={{ slug: designer.slug }}
                label="Projets"
              />
            </nav>
          )}

          <ThemeToggle />

          {role === "anon" && (
            <button
              type="button"
              className="rounded-full border border-white/15 px-6 py-2 text-sm font-medium text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              Se connecter
            </button>
          )}

          {role === "visitor" && (
            <a
              href="#contact"
              className="rounded-full border border-white/15 px-6 py-2 text-sm font-bold text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              Réserver un appel
            </a>
          )}

          {role === "admin" && <AdminAccountMenu />}
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

function AdminAccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-[10px] font-bold text-primary">
          LM
        </span>
        Mon compte
        <span aria-hidden="true" className="material-symbols-outlined text-sm">
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-[70] mt-3 w-60 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-lowest shadow-2xl">
          <div className="flex flex-col py-2">
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-white/5"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant">
                dashboard
              </span>
              Accéder au dashboard
            </Link>
            <Link
              to="/admin"
              search={{ tab: "parametres" }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-white/5"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant">
                settings
              </span>
              Paramètres
            </Link>
            <div className="my-1 border-t border-white/5" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#F87171] transition-colors hover:bg-[#F87171]/10"
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
