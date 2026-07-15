import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { designer } from "@/data/designer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
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
                to={`/${designer.slug}`}
                className="text-2xl font-medium tracking-tight text-on-surface"
              >
                Folio<span className="text-primary">+</span>
              </Link>
              <div className="h-3.5 w-px bg-white/15" />
              <span className="whitespace-nowrap text-sm font-medium text-on-surface md:text-base">
                {designer.fullName}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden items-center gap-6 md:flex">
            <VisitorLink to={`/${designer.slug}`} label="Profil" end />
            <VisitorLink to={`/${designer.slug}/projects`} label="Projets" />
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session && <NotificationBell />}
            {session && <AccountMenu fullName={fullName} role={role} roleLoading={roleLoading} />}
          </div>

          {!session && (
            <Link
              to="/auth"
              aria-label="Se connecter"
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-on-surface transition-colors hover:border-primary"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function VisitorLink({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive
          ? "text-sm font-bold text-primary"
          : "text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
      }
    >
      {label}
    </NavLink>
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
    navigate("/", { replace: true });
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
        className="flex items-center gap-2 rounded-full text-sm font-light text-on-surface transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-on-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary-container/20">
          {fullName ? initials(fullName) : "?"}
        </span>
        {fullName ?? "Mon compte"}
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
                role="menuitem"
                aria-label="Dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-white/5"
              >
                <LayoutDashboard aria-hidden="true" className="text-on-surface-variant" size={18} />
                Dashboard
              </Link>
            )}
            {!roleLoading && isAdmin && (
              <Link
                to="/admin?tab=parametres"
                role="menuitem"
                aria-label="Paramètres"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-white/5"
              >
                <Settings aria-hidden="true" className="text-on-surface-variant" size={18} />
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
                <User aria-hidden="true" className="text-on-surface-variant" size={18} />
                Mon profil
              </Link>
            )}
            <div className="my-1 border-t border-white/8" />
            <button
              type="button"
              role="menuitem"
              aria-label="Se déconnecter"
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-primary transition-colors hover:bg-primary-container/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            >
              <LogOut aria-hidden="true" size={18} />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
