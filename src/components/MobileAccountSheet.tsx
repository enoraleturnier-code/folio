import { Bell, LayoutDashboard, LogOut, Settings, User, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { MobileNotificationsView } from "@/components/MobileNotificationsView";
import { SlideSheet } from "@/components/SlideSheet";
import { supabase } from "@/integrations/supabase/client";

type View = "menu" | "notifications";

/** Feuille compte plein écran mobile -- remplace le dropdown desktop AccountMenu. */
export function MobileAccountSheet({
  open,
  onClose,
  fullName,
  role,
  roleLoading,
}: {
  open: boolean;
  onClose: () => void;
  fullName: string | null;
  role: string | null;
  roleLoading: boolean;
}) {
  const [view, setView] = useState<View>("menu");
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const isVisitorWithAccount = role === "pending" || role === "validated_visitor";

  const close = () => {
    onClose();
    // Laisse l'animation de sortie se jouer avant de revenir au menu principal.
    setTimeout(() => setView("menu"), 300);
  };

  const go = (to: string) => {
    close();
    navigate(to);
  };

  const handleSignOut = async () => {
    close();
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  if (view === "notifications") {
    return (
      <SlideSheet open={open} onClose={close} from="bottom" ariaLabel="Notifications">
        <MobileNotificationsView
          isAdmin={isAdmin}
          onBack={() => setView("menu")}
          onNavigated={close}
        />
      </SlideSheet>
    );
  }

  return (
    <SlideSheet open={open} onClose={close} from="bottom" ariaLabel="Menu du compte">
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
        <h2 className="text-xl font-medium text-on-surface">{fullName ?? "Mon compte"}</h2>
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X aria-hidden="true" size={24} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {!roleLoading && isAdmin && (
          <button
            type="button"
            onClick={() => go("/admin")}
            className="flex items-center gap-3 px-6 py-4 text-left text-base font-medium text-on-surface transition-colors hover:bg-white/5"
          >
            <LayoutDashboard aria-hidden="true" className="text-on-surface-variant" size={20} />
            Dashboard
          </button>
        )}
        {!roleLoading && isVisitorWithAccount && (
          <button
            type="button"
            onClick={() => go("/account")}
            className="flex items-center gap-3 px-6 py-4 text-left text-base font-medium text-on-surface transition-colors hover:bg-white/5"
          >
            <User aria-hidden="true" className="text-on-surface-variant" size={20} />
            Mon compte
          </button>
        )}

        <div className="border-t border-outline-variant" />

        <button
          type="button"
          onClick={() => setView("notifications")}
          className="flex items-center gap-3 px-6 py-4 text-left text-base font-medium text-on-surface transition-colors hover:bg-white/5"
        >
          <Bell aria-hidden="true" className="text-on-surface-variant" size={20} />
          Notifications
        </button>

        <div className="border-t border-outline-variant" />

        {!roleLoading && isAdmin && (
          <button
            type="button"
            onClick={() => go("/admin?tab=parametres")}
            className="flex items-center gap-3 px-6 py-4 text-left text-base font-medium text-on-surface transition-colors hover:bg-white/5"
          >
            <Settings aria-hidden="true" className="text-on-surface-variant" size={20} />
            Préférences
          </button>
        )}

        <div className="border-t border-outline-variant" />

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-3 px-6 py-4 text-left text-base font-medium text-primary transition-colors hover:bg-primary-container/10"
        >
          <LogOut aria-hidden="true" size={20} />
          Déconnexion
        </button>
      </div>
    </SlideSheet>
  );
}
