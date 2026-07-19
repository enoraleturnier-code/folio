import { Folder, KeyRound, LayoutDashboard, Mail, Newspaper, type LucideIcon } from "lucide-react";

import { NotificationCountBadge } from "@/components/NotificationCountBadge";

type TabKey = "dashboard" | "projets" | "demandes" | "contacts" | "veille" | "parametres";

const NAV_ACTIVE_CLASSES = {
  teal: { bg: "bg-primary-container/10", icon: "text-primary" },
  fuchsia: { bg: "bg-tag-design-type/15", icon: "text-tag-design-type" },
  violet: { bg: "bg-secondary/10", icon: "text-secondary" },
  nouveau: { bg: "bg-indigo-500/10", icon: "text-tag-keywords" },
  cyan: { bg: "bg-tag-sector/10", icon: "text-tag-sector" },
} as const;

const ITEMS: {
  key: Exclude<TabKey, "parametres">;
  icon: LucideIcon;
  label: string;
  fullLabel: string;
  color: keyof typeof NAV_ACTIVE_CLASSES;
}[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", fullLabel: "Dashboard", color: "teal" },
  { key: "projets", icon: Folder, label: "Projets", fullLabel: "Catalogue projets", color: "fuchsia" },
  { key: "demandes", icon: KeyRound, label: "Accès", fullLabel: "Demandes d'accès", color: "violet" },
  { key: "contacts", icon: Mail, label: "Messages", fullLabel: "Messages", color: "nouveau" },
  { key: "veille", icon: Newspaper, label: "Veille", fullLabel: "Veille Hebdo", color: "cyan" },
];

/** Barre de navigation mobile du dashboard admin -- remplace la sidebar sur
 * petit écran (Paramètres en est exclu, déplacé dans la feuille compte sous
 * "Préférences"). Couleurs, badges et libellés repris tels quels de
 * AdminSidebar (NAV_ACTIVE_CLASSES) pour rester visuellement cohérent. */
export function AdminMobileBottomNav({
  tab,
  setTab,
  pendingCount,
  contactsCount,
  veilleCount,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  pendingCount: number;
  contactsCount: number;
  veilleCount: number;
}) {
  const badges: Partial<Record<(typeof ITEMS)[number]["key"], number>> = {
    demandes: pendingCount,
    contacts: contactsCount,
    veille: veilleCount,
  };

  return (
    <nav
      aria-label="Navigation du dashboard (mobile)"
      className="fixed inset-x-0 bottom-0 z-[70] flex rounded-t-2xl border-t border-white/10 bg-background/80 p-1.5 backdrop-blur-md md:hidden"
    >
      {ITEMS.map((it) => {
        const active = tab === it.key;
        const ItemIcon = it.icon;
        const badge = badges[it.key];
        const activeStyle = NAV_ACTIVE_CLASSES[it.color];
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => setTab(it.key)}
            aria-current={active ? "page" : undefined}
            aria-label={badge ? `${it.fullLabel} • ${badge} nouveaux éléments` : it.fullLabel}
            className={
              "relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset " +
              (active ? activeStyle.bg : "")
            }
          >
            <span className="relative">
              <ItemIcon
                aria-hidden="true"
                size={22}
                className={active ? activeStyle.icon : "text-on-surface-variant"}
              />
              {Boolean(badge) && (
                <NotificationCountBadge
                  count={badge!}
                  className="absolute -right-2 -top-1.5 h-5 w-5 text-[10px]"
                />
              )}
            </span>
            <span className="text-[10px] font-medium text-on-surface">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
