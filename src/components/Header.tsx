import { LayoutDashboard, LogOut, Menu, Moon, Settings, User } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { BurgerMenu } from "@/components/BurgerMenu";
import { MobileAccountSheet } from "@/components/MobileAccountSheet";
import { MobileThemeSheet } from "@/components/MobileThemeSheet";
import { NotificationCountBadge } from "@/components/NotificationCountBadge";
import { designer } from "@/data/designer";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const location = useLocation();
  const { session, role, roleLoading, fullName } = useAuth();
  const unreadCount = useUnreadNotificationCount();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-16">
        {/* Desktop */}
        <div
          className={`hidden items-center gap-4 md:flex md:gap-6 ${isAdminRoute ? "md:ml-24" : ""}`}
        >
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

        <div className="hidden items-center gap-4 md:flex md:gap-8">
          <nav className="flex items-center gap-6">
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

        {/* Mobile -- pages publiques et dashboard admin (le burger y contient les mêmes
         * liens Profil/Projets, seul le centre change : titre fixe "Dashboard"). */}
        <div className="flex w-full items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setBurgerOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-md:h-11 max-md:w-11"
          >
            <Menu aria-hidden="true" size={24} />
          </button>

          {isAdminRoute ? (
            <span className="text-lg font-medium text-on-surface">Dashboard</span>
          ) : (
            <Link
              to={`/${designer.slug}`}
              className="text-xl font-medium tracking-tight text-on-surface"
            >
              Folio<span className="text-primary">+</span>
            </Link>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setThemeSheetOpen(true)}
              aria-label="Choisir le thème d'affichage"
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-md:h-11 max-md:w-11"
            >
              <Moon aria-hidden="true" size={22} />
            </button>

            {session ? (
              <button
                type="button"
                onClick={() => setAccountSheetOpen(true)}
                aria-label="Mon compte"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-on-primary/10 text-sm font-bold text-primary transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-md:h-11 max-md:w-11"
              >
                {fullName ? initials(fullName) : "?"}
                <NotificationCountBadge count={unreadCount} className="absolute -right-0.5 -top-0.5" />
              </button>
            ) : (
              <Link
                to="/auth"
                aria-label="Se connecter"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:border-primary"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      <BurgerMenu open={burgerOpen} onClose={() => setBurgerOpen(false)} />
      <MobileThemeSheet open={themeSheetOpen} onClose={() => setThemeSheetOpen(false)} />
      {session && (
        <MobileAccountSheet
          open={accountSheetOpen}
          onClose={() => setAccountSheetOpen(false)}
          fullName={fullName}
          role={role}
          roleLoading={roleLoading}
          unreadCount={unreadCount}
        />
      )}
    </header>
  );
}

function VisitorLink({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "rounded-full px-3 py-1.5 text-sm transition-all active:scale-95 " +
        (isActive
          ? "bg-white/10 font-bold text-primary"
          : "font-medium text-on-surface-variant hover:text-primary")
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
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const items = Array.from(
        ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      );
      if (items.length === 0) return;
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const nextIndex =
        currentIndex === -1
          ? e.key === "ArrowDown"
            ? 0
            : items.length - 1
          : e.key === "ArrowDown"
            ? (currentIndex + 1) % items.length
            : (currentIndex - 1 + items.length) % items.length;
      items[nextIndex].focus();
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
