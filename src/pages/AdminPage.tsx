import {
  ArchiveRestore,
  ArrowLeftRight,
  ArrowRight,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CloudUpload,
  Copy,
  Folder,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Newspaper,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Session } from "@supabase/supabase-js";

import { useAuth } from "@/hooks/useAuth";

import { Alert } from "@/components/Alert";
import { AdminFilterBar, type AdminFilterGroup } from "@/components/AdminFilterBar";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import { IconTooltip } from "@/components/IconTooltip";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarkdownContent } from "@/components/MarkdownContent";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import {
  designer,
  getDesignerProfile,
  updateDesignerProfile,
  type DesignerProfileInput,
} from "@/data/designer";
import { textLinkClass } from "@/lib/linkStyles";
import { SENSITIVITY_LABELS } from "@/lib/sensitivityLabels";
import { uploadDesignerPhoto } from "@/lib/storage";
import { cn } from "@/lib/utils";
import {
  getAllContacts,
  updateContactStatus,
  type AdminContactMessage,
  type ContactDbStatus,
} from "@/data/contacts";
import {
  createProject,
  getProjectById,
  getProjects,
  restoreProject,
  softDeleteProject,
  updateProject,
  type ProjectInput,
} from "@/data/projects";
import {
  approveAccessRequest,
  getAllAccessRequests,
  rejectAccessRequest,
  type AdminAccessRequest,
} from "@/data/accessRequests";
import {
  getDesignWatchEntries,
  triggerNotionSync,
  type DesignWatchEntry,
} from "@/data/designWatch";
import type { Project } from "@/types/project";

const ALLOWED_TABS = [
  "dashboard",
  "projets",
  "demandes",
  "contacts",
  "veille",
  "parametres",
] as const;
type TabKey = (typeof ALLOWED_TABS)[number];

function parseTab(value: string | null): TabKey {
  return (ALLOWED_TABS as readonly string[]).includes(value ?? "")
    ? (value as TabKey)
    : "dashboard";
}

// Convention identique à ThemeToggle.tsx (readStoredMode) : clé plate préfixée,
// valeur string simple (pas de JSON), guard SSR + try/catch.
const VEILLE_LAST_VIEWED_KEY = "folio-veille-last-viewed";

function readVeilleLastViewed(): string {
  if (typeof window === "undefined") return new Date(0).toISOString();
  try {
    return localStorage.getItem(VEILLE_LAST_VIEWED_KEY) ?? new Date(0).toISOString();
  } catch {
    return new Date(0).toISOString();
  }
}

const SIDEBAR_COLLAPSED_KEY = "folio-admin-sidebar-collapsed";

function readStoredSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, loading, role, roleLoading } = useAuth();
  const tab: TabKey = parseTab(searchParams.get("tab"));
  const [collapsed, setCollapsed] = useState(readStoredSidebarCollapsed);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [accessRequests, setAccessRequests] = useState<AdminAccessRequest[]>([]);
  const [accessRequestsLoading, setAccessRequestsLoading] = useState(true);
  const [contacts, setContacts] = useState<AdminContactMessage[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [designWatchEntries, setDesignWatchEntries] = useState<DesignWatchEntry[]>([]);
  const [designWatchLoading, setDesignWatchLoading] = useState(true);
  const [veilleLastViewed, setVeilleLastViewed] = useState<string>(readVeilleLastViewed);

  useEffect(() => {
    if (loading || roleLoading) return;
    if (!session) {
      navigate("/auth");
      return;
    }
    if (role !== "admin") {
      navigate("/");
    }
  }, [loading, roleLoading, session, role, navigate]);

  useEffect(() => {
    if (loading || roleLoading || !session || role !== "admin") return;
    let cancelled = false;
    setProjectsLoading(true);
    getProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, session, role]);

  useEffect(() => {
    if (loading || roleLoading || !session || role !== "admin") return;
    let cancelled = false;
    setAccessRequestsLoading(true);
    getAllAccessRequests()
      .then((data) => {
        if (!cancelled) setAccessRequests(data);
      })
      .finally(() => {
        if (!cancelled) setAccessRequestsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, session, role]);

  useEffect(() => {
    if (loading || roleLoading || !session || role !== "admin") return;
    let cancelled = false;
    setContactsLoading(true);
    getAllContacts()
      .then((data) => {
        if (!cancelled) setContacts(data);
      })
      .finally(() => {
        if (!cancelled) setContactsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, session, role]);

  const refreshDesignWatch = () => {
    setDesignWatchLoading(true);
    return getDesignWatchEntries()
      .then(setDesignWatchEntries)
      .finally(() => setDesignWatchLoading(false));
  };

  useEffect(() => {
    if (loading || roleLoading || !session || role !== "admin") return;
    let cancelled = false;
    setDesignWatchLoading(true);
    getDesignWatchEntries()
      .then((data) => {
        if (!cancelled) setDesignWatchEntries(data);
      })
      .finally(() => {
        if (!cancelled) setDesignWatchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, session, role]);

  // Marque l'onglet "vu" à l'ouverture -- le badge repasse à 0 immédiatement.
  const markVeilleViewed = () => {
    const now = new Date().toISOString();
    setVeilleLastViewed(now);
    try {
      localStorage.setItem(VEILLE_LAST_VIEWED_KEY, now);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (tab === "veille") markVeilleViewed();
  }, [tab]);

  const pendingCount = useMemo(
    () => accessRequests.filter((r) => r.status === "pending").length,
    [accessRequests],
  );

  const newContactsCount = useMemo(
    () => contacts.filter((c) => c.status === "new").length,
    [contacts],
  );

  // Compare synced_at (moment technique de la synchro) à la dernière consultation --
  // jamais periode_fin (moment couvert par le contenu), ce sont deux dates distinctes :
  // le badge doit réagir à la synchro, pas au contenu qu'elle rapporte.
  const veilleNewCount = useMemo(
    () => designWatchEntries.filter((e) => e.synced_at > veilleLastViewed).length,
    [designWatchEntries, veilleLastViewed],
  );

  if (loading || roleLoading || !session || role !== "admin") {
    return <div className="min-h-screen bg-background" />;
  }

  const setTab = (t: TabKey) => setSearchParams({ tab: t });

  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <AdminSidebar
        tab={tab}
        setTab={setTab}
        collapsed={collapsed}
        onToggleCollapsed={() =>
          setCollapsed((v) => {
            const next = !v;
            try {
              localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
            } catch {
              /* ignore */
            }
            return next;
          })
        }
        pendingCount={pendingCount}
        contactsCount={newContactsCount}
        veilleCount={veilleNewCount}
      />
      <main
        className={
          "flex-1 pb-16 pt-[80px] transition-[margin] " +
          (collapsed ? "ml-16 md:ml-20" : "ml-20 md:ml-56")
        }
      >
        <div className="mx-auto max-w-6xl px-6 pt-10 md:px-10">
          {tab === "dashboard" && (
            <DashboardTab
              setTab={setTab}
              projects={projects}
              accessRequests={accessRequests}
              contacts={contacts}
              designWatchEntries={designWatchEntries}
              veilleNewCount={veilleNewCount}
            />
          )}
          {tab === "projets" && (
            <ProjetsTab
              projects={projects}
              loading={projectsLoading}
              onProjectsChange={setProjects}
            />
          )}
          {tab === "demandes" && (
            <DemandesTab
              items={accessRequests}
              loading={accessRequestsLoading}
              onItemsChange={setAccessRequests}
            />
          )}
          {tab === "contacts" && (
            <ContactsTab items={contacts} loading={contactsLoading} onItemsChange={setContacts} />
          )}
          {tab === "veille" && (
            <VeilleDesignTab
              entries={designWatchEntries}
              loading={designWatchLoading}
              session={session}
              onSynced={() => {
                markVeilleViewed();
                return refreshDesignWatch();
              }}
            />
          )}
          {tab === "parametres" && <ParametresTab />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ---------- Sidebar ---------- */

/** Couleur active par section de nav (cf. DESIGN.md). `badgeBg`/`badgeText`
 * sont la paire "conteneur solide" utilisée par le badge de notification de
 * cette même catégorie — jamais un dérivé de `bg`/`icon` (souvent une teinte
 * translucide, pas assez de contraste pour porter un chiffre en petit texte).
 * ⚠️ Depuis la redéfinition du 13/07, ces couleurs ne correspondent plus
 * forcément à celle du halo `SectionAurora` de la même section (ex. Contacts :
 * nav en tertiary-container, halo toujours cyan) — décision explicite,
 * périmètres volontairement dissociés. */
const NAV_ACTIVE_CLASSES = {
  teal: {
    bg: "bg-primary-container/10",
    icon: "text-primary",
    badgeBg: "bg-primary-container",
    badgeText: "text-on-primary-container",
  },
  fuchsia: {
    bg: "bg-tag-design-type/15",
    icon: "text-tag-design-type",
    badgeBg: "bg-tag-design-type",
    badgeText: "text-background",
  },
  violet: {
    bg: "bg-secondary/10",
    icon: "text-secondary",
    badgeBg: "bg-secondary-container",
    badgeText: "text-on-secondary-container",
  },
  cyan: {
    bg: "bg-tag-sector/10",
    icon: "text-tag-sector",
    badgeBg: "bg-tag-sector",
    badgeText: "text-on-primary",
  },
  nouveau: {
    bg: "bg-indigo-500/10",
    icon: "text-tag-keywords",
    badgeBg: "bg-indigo-500",
    badgeText: "text-black",
  },
  indigo: {
    bg: "bg-tag-keywords/10",
    icon: "text-tag-keywords",
    badgeBg: "bg-tag-keywords",
    badgeText: "text-on-primary",
  },
} as const;

function AdminSidebar({
  tab,
  setTab,
  collapsed,
  onToggleCollapsed,
  pendingCount,
  contactsCount,
  veilleCount,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  pendingCount: number;
  contactsCount: number;
  veilleCount: number;
}) {
  const items: {
    key: TabKey;
    icon: LucideIcon;
    label: string;
    badge?: number;
    badgeLabel?: string;
    /** Couleur dominante de la section (cf. DESIGN.md) — reprise sur le fond
     * boréal du dashboard et sur l'état actif de ce lien de nav. */
    color: keyof typeof NAV_ACTIVE_CLASSES;
  }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", color: "teal" },
    { key: "projets", icon: Folder, label: "Catalogue projets", color: "fuchsia" },
    {
      key: "demandes",
      icon: KeyRound,
      label: "Accès",
      badge: pendingCount,
      badgeLabel: "demandes en attente",
      color: "violet",
    },
    {
      key: "contacts",
      icon: Mail,
      label: "Messages",
      badge: contactsCount,
      badgeLabel: "nouveaux messages",
      color: "nouveau",
    },
    {
      key: "veille",
      icon: Newspaper,
      label: "Veille Hebdo",
      badge: veilleCount,
      badgeLabel: "nouvelles entrées",
      color: "cyan",
    },
    { key: "parametres", icon: Settings, label: "Paramètres", color: "teal" },
  ];
  return (
    <aside
      className={
        "fixed left-0 top-0 z-[70] flex h-screen flex-col border-r border-white/5 bg-background py-10 transition-[width] " +
        (collapsed
          ? "w-16 items-center md:w-20"
          : "w-20 items-center px-3 md:w-56 md:items-stretch md:px-5")
      }
    >
      <Link
        to="/admin"
        className={
          collapsed
            ? "text-2xl font-black tracking-tighter text-primary"
            : "text-2xl font-black tracking-tighter text-primary md:text-xl md:font-medium md:text-on-surface"
        }
        aria-label="Folio+ — Accéder au dashboard"
      >
        {collapsed ? (
          <>
            F<span className="text-on-surface">+</span>
          </>
        ) : (
          <>
            <span className="md:hidden">
              F<span className="text-on-surface">+</span>
            </span>
            <span className="hidden md:inline">
              Folio<span className="text-primary">+</span>
            </span>
          </>
        )}
      </Link>

      {/* `aside` est déjà `fixed` (positioned), donc contexte suffisant pour cet
       * `absolute` — pas besoin d'un wrapper `relative` supplémentaire. Ancré sur
       * la bordure droite du panneau (`right-0 translate-x-1/2`, à cheval sur le
       * `border-r` de l'aside), indépendant de la largeur collapsed/expanded. */}
      <IconTooltip label={collapsed ? "Agrandir la barre de navigation" : "Réduire la barre de navigation"}>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={
            collapsed ? "Agrandir la barre de navigation" : "Réduire la barre de navigation"
          }
          className="absolute right-0 top-10 flex h-[30px] w-[30px] -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white/5 text-on-surface transition-all hover:bg-primary-container/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {collapsed ? (
            <ChevronRight aria-hidden="true" size={16} />
          ) : (
            <ChevronLeft aria-hidden="true" size={16} />
          )}
        </button>
      </IconTooltip>

      <nav
        aria-label="Navigation du dashboard"
        className={
          "mt-8 flex flex-col gap-2 " +
          (collapsed ? "items-center" : "items-center md:items-stretch")
        }
      >
        {items.map((it) => {
          const active = tab === it.key;
          const ItemIcon = it.icon;
          const activeStyle = NAV_ACTIVE_CLASSES[it.color];
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => setTab(it.key)}
              aria-label={
                it.badge && it.badge > 0
                  ? `${it.label} — ${it.badge} ${it.badgeLabel ?? "nouveaux éléments"}`
                  : it.label
              }
              aria-current={active ? "page" : undefined}
              className={
                "group relative flex h-12 items-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
                (collapsed
                  ? "w-12 justify-center"
                  : "w-12 justify-center md:w-full md:justify-start md:px-3 md:gap-3") +
                " " +
                (active
                  ? activeStyle.bg + " font-medium text-on-surface"
                  : "text-on-surface-variant/65 hover:bg-white/5 hover:text-on-surface")
              }
            >
              <ItemIcon aria-hidden="true" size={24} className={active ? activeStyle.icon : ""} />
              {!collapsed && (
                <span className="hidden flex-1 text-left text-sm md:inline">{it.label}</span>
              )}
              <span
                aria-hidden="true"
                className={
                  "pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-surface-container-lowest px-2.5 py-1.5 text-xs font-medium text-on-surface opacity-0 shadow-xl shadow-black/40 transition-opacity delay-150 group-hover:opacity-100 " +
                  (collapsed ? "" : "md:hidden")
                }
              >
                {it.label}
              </span>
              {it.badge && it.badge > 0 ? (
                <span
                  aria-hidden="true"
                  className={
                    "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold " +
                    activeStyle.badgeBg +
                    " " +
                    activeStyle.badgeText +
                    (collapsed ? "" : " md:static md:ml-auto md:h-5 md:w-5")
                  }
                >
                  {it.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
/* ---------- Dashboard Tab ---------- */

const CONTACTS_UNIFIED_KIND_OPTIONS: AdminFilterGroup["options"] = [
  { value: "message", label: "Message" },
  { value: "demande", label: "Demande d'accès" },
];

/** Libellés pour les deux vocabulaires de statut réunis dans "Mes contacts" (messages + demandes) -- pas de fusion forcée en un seul jeu de valeurs. */
const UNIFIED_CONTACT_STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  traite: "Traité",
  archive: "Archivé",
  pending: "En attente",
  approved: "Accordé",
  rejected: "Refusé",
};

/** Une carte "accès rapide" du dashboard -- reprend la couleur nav de l'onglet ciblé (NAV_ACTIVE_CLASSES), pas une teinte unique partagée. */
function QuickAccessCard({
  icon: Icon,
  color,
  count,
  label,
  hint,
  onClick,
}: {
  icon: LucideIcon;
  color: keyof typeof NAV_ACTIVE_CLASSES;
  count: number;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  const classes = NAV_ACTIVE_CLASSES[color];
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start rounded-2xl border border-white/5 bg-surface-container-low p-5 text-left transition-colors hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Icon aria-hidden="true" className={classes.icon} size={24} />
      <span className="mt-4 text-3xl font-bold text-on-surface">{count}</span>
      <span className="mt-1 text-sm text-on-surface-variant">{label}</span>
      <span className={"mt-2 text-xs " + classes.icon}>{hint}</span>
    </button>
  );
}

function DashboardTab({
  setTab,
  projects,
  accessRequests,
  contacts,
  designWatchEntries,
  veilleNewCount,
}: {
  setTab: (t: TabKey) => void;
  projects: Project[];
  accessRequests: AdminAccessRequest[];
  contacts: AdminContactMessage[];
  designWatchEntries: DesignWatchEntry[];
  veilleNewCount: number;
}) {
  const pendingRequests = accessRequests.filter((r) => r.status === "pending");
  const newMessages = contacts.filter((c) => c.status === "new");
  const activeProjects = projects.filter((p) => !p.deleted_at);
  const publishedProjects = activeProjects.filter(
    (p) => p.status === "public" || p.status === "confidential",
  );
  const draftProjects = activeProjects.filter((p) => p.status === "draft");

  const [veilleMonthFilter, setVeilleMonthFilter] = useState("");
  const publishedVeille = designWatchEntries.filter((e) => e.statut === "Publié");
  const veilleMonthOptions = useMemo(
    () =>
      Array.from(
        new Set(
          publishedVeille
            .filter((e): e is DesignWatchEntry & { periode_fin: string } => !!e.periode_fin)
            .map((e) => e.periode_fin.slice(0, 7)),
        ),
      ).sort((a, b) => (a < b ? 1 : -1)),
    [publishedVeille],
  );
  const filteredVeille = publishedVeille
    .filter((e) => !veilleMonthFilter || e.periode_fin?.slice(0, 7) === veilleMonthFilter)
    .sort((a, b) => ((a.periode_fin ?? "") < (b.periode_fin ?? "") ? 1 : -1));

  const [visibilityFilters, setVisibilityFilters] = useState<Record<string, string>>({
    niveau: "",
    person: "",
  });

  const visibilityRows = useMemo(
    () =>
      publishedProjects.map((p) => {
        const niveau: "public" | "confidentiel_sensible" | "confidentiel_critique" =
          p.status === "public"
            ? "public"
            : p.sensitivity_level === "tres_sensible"
              ? "confidentiel_critique"
              : "confidentiel_sensible";
        const grantees = accessRequests
          .filter((r) => r.project?.id === p.id && r.status === "approved")
          .map((r) => ({
            name: r.visitor?.fullName ?? r.visitor?.email ?? "Visiteur",
            requestedAt: r.createdAt,
            validatedAt: r.validatedAt,
          }));
        return { project: p, niveau, grantees };
      }),
    [publishedProjects, accessRequests],
  );

  const visibilityPersonOptions = useMemo(
    () =>
      Array.from(new Set(visibilityRows.flatMap((r) => r.grantees.map((g) => g.name))))
        .sort()
        .map((name) => ({ value: name, label: name })),
    [visibilityRows],
  );

  const visibilityFilterGroups: AdminFilterGroup[] = [
    { key: "niveau", label: "Niveau", primary: true, options: PROJETS_NIVEAU_OPTIONS },
    { key: "person", label: "Personne", options: visibilityPersonOptions },
  ];

  const filteredVisibilityRows = visibilityRows
    .filter((r) => !visibilityFilters.niveau || r.niveau === visibilityFilters.niveau)
    .filter(
      (r) => !visibilityFilters.person || r.grantees.some((g) => g.name === visibilityFilters.person),
    );

  const [contactsUnifiedFilters, setContactsUnifiedFilters] = useState<Record<string, string>>({
    kind: "",
    status: "",
  });

  const unifiedContacts = useMemo(() => {
    const fromMessages = contacts.map((c) => ({
      id: `msg-${c.id}`,
      name: c.name,
      email: c.email,
      company: c.company,
      kind: "message" as const,
      status: CONTACT_STATUS_KIND[c.status],
      createdAt: c.createdAt,
    }));
    const fromRequests = accessRequests.map((r) => ({
      id: `req-${r.id}`,
      name: r.visitor?.fullName ?? "Visiteur",
      email: r.visitor?.email ?? "—",
      company: r.visitor?.company ?? null,
      kind: "demande" as const,
      status: r.status,
      createdAt: r.createdAt,
    }));
    return [...fromMessages, ...fromRequests].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [contacts, accessRequests]);

  const contactsUnifiedStatusOptions = useMemo(
    () =>
      Array.from(new Set(unifiedContacts.map((r) => r.status))).map((s) => ({
        value: s,
        label: UNIFIED_CONTACT_STATUS_LABELS[s],
      })),
    [unifiedContacts],
  );

  const contactsUnifiedFilterGroups: AdminFilterGroup[] = [
    { key: "kind", label: "Type", primary: true, options: CONTACTS_UNIFIED_KIND_OPTIONS },
    { key: "status", label: "Statut", options: contactsUnifiedStatusOptions },
  ];

  const filteredUnifiedContacts = unifiedContacts
    .filter((r) => !contactsUnifiedFilters.kind || r.kind === contactsUnifiedFilters.kind)
    .filter((r) => !contactsUnifiedFilters.status || r.status === contactsUnifiedFilters.status);

  return (
    <>
      <TabHeader
        title="Tableau de "
        emphasis="bord"
        subtitle="Récapitulatif de tes projets, demandes d'accès et messages en un coup d'œil."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <QuickAccessCard
          icon={Folder}
          color="fuchsia"
          count={activeProjects.length}
          label="Projets"
          hint={`${publishedProjects.length} publiés · ${draftProjects.length} brouillon`}
          onClick={() => setTab("projets")}
        />
        <QuickAccessCard
          icon={KeyRound}
          color="violet"
          count={pendingRequests.length}
          label="Demandes en attente"
          hint="À valider ou refuser"
          onClick={() => setTab("demandes")}
        />
        <QuickAccessCard
          icon={Mail}
          color="nouveau"
          count={newMessages.length}
          label="Messages nouveaux"
          hint="À traiter"
          onClick={() => setTab("contacts")}
        />
        <QuickAccessCard
          icon={Newspaper}
          color="cyan"
          count={veilleNewCount}
          label="Veille Hebdo"
          hint="Nouveaux contenus"
          onClick={() => setTab("veille")}
        />
        <QuickAccessCard
          icon={Settings}
          color="teal"
          count={1}
          label="Paramètres"
          hint="Profil public"
          onClick={() => setTab("parametres")}
        />
      </div>

      {(pendingRequests.length > 0 || newMessages.length > 0) && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-on-surface">Actions en attente</h2>
          <div className="mt-4 space-y-3">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/5 bg-surface-container-low p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="font-medium text-on-surface">
                    {r.visitor?.fullName ?? r.visitor?.email ?? "Visiteur"}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {r.visitor?.company ?? "—"} — Demande d'accès
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("demandes")}
                  className="shrink-0 rounded-full bg-primary-container px-4 py-1.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Traiter
                </button>
              </div>
            ))}
            {newMessages.map((m) => (
              <div
                key={m.id}
                className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/5 bg-surface-container-low p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="font-medium text-on-surface">{m.name}</p>
                  <p className="text-sm text-on-surface-variant">{m.email} — Nouveau message</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("contacts")}
                  className="shrink-0 rounded-full bg-primary-container px-4 py-1.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Lire
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {publishedVeille.length > 0 && (
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-on-surface">Veille Hebdo</h2>
            {veilleMonthOptions.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setVeilleMonthFilter("")}
                  className={veillePillCls(veilleMonthFilter === "", "sector")}
                >
                  Toutes les périodes
                </button>
                {veilleMonthOptions.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setVeilleMonthFilter(veilleMonthFilter === key ? "" : key)}
                    className={veillePillCls(veilleMonthFilter === key, "sector")}
                  >
                    {new Date(`${key}-01`).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/5 bg-aurora-cyan">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Titre</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                    Période
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                    Sources
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredVeille.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-on-surface-variant/70">
                      Aucune veille publiée pour cette période.
                    </td>
                  </tr>
                ) : (
                  filteredVeille.map((e) => (
                    <tr key={e.id}>
                      <td className="px-5 py-3 font-medium text-on-surface">{e.titre}</td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {formatPeriode(e.periode_debut, e.periode_fin)}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">{e.nb_sources ?? "—"}</td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/admin?tab=veille&entry=${e.notion_page_id}`}
                          className={textLinkClass()}
                        >
                          Voir le contenu
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-bold text-on-surface">
          Suivi visibilité — projets confidentiels
        </h2>
        <div className="mt-4">
          <AdminFilterBar
            groups={visibilityFilterGroups}
            value={visibilityFilters}
            onChange={setVisibilityFilters}
          />
        </div>
        {filteredVisibilityRows.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/5 bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
            Aucun projet pour ce filtre.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {filteredVisibilityRows.map(({ project: p, niveau, grantees }) => (
              <li
                key={p.id}
                className="rounded-2xl border border-white/5 bg-surface-container-low p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-on-surface">{p.title}</p>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      kind={p.status === "public" ? "public" : "confidential"}
                      suffix={niveau !== "public" ? SENSITIVITY_LABELS[p.sensitivity_level] : undefined}
                    />
                    <span className="text-xs text-on-surface-variant">
                      {grantees.length} accès accordé{grantees.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                {grantees.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                    {grantees.map((g, i) => (
                      <li
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant"
                      >
                        <span className="font-medium text-on-surface">{g.name}</span>
                        <span>
                          Demandé le{" "}
                          {new Date(g.requestedAt).toLocaleDateString("fr-FR")}
                          {g.validatedAt &&
                            ` · Validé le ${new Date(g.validatedAt).toLocaleDateString("fr-FR")}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-on-surface">Mes contacts</h2>
        <div className="mt-4">
          <AdminFilterBar
            groups={contactsUnifiedFilterGroups}
            value={contactsUnifiedFilters}
            onChange={setContactsUnifiedFilters}
          />
        </div>
        {filteredUnifiedContacts.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/5 bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
            Aucun contact pour ce filtre.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {filteredUnifiedContacts.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-on-surface">{r.name}</p>
                  <p className="text-sm text-on-surface-variant">
                    {r.email} · {r.company ?? "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-on-surface-variant">
                    {r.kind === "message" ? "Message" : "Demande d'accès"}
                  </span>
                  <StatusBadge kind={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ---------- Projets Tab ---------- */

function formatPeriod(start: string | null, end: string | null): string {
  const startYear = start ? new Date(start).getFullYear() : null;
  const endYear = end ? new Date(end).getFullYear() : null;
  if (startYear && endYear && startYear !== endYear) return `${startYear} — ${endYear}`;
  return String(startYear ?? endYear ?? "");
}

const PROJETS_NIVEAU_OPTIONS: AdminFilterGroup["options"] = [
  { value: "public", label: "Public" },
  { value: "confidentiel_sensible", label: "Confidentiel-Sensible" },
  { value: "confidentiel_critique", label: "Confidentiel-Critique" },
];

const PROJETS_STATUT_OPTIONS: AdminFilterGroup["options"] = [
  { value: "publie", label: "Publié" },
  { value: "brouillon", label: "Brouillon" },
];

function ProjetsTab({
  projects,
  loading,
  onProjectsChange,
}: {
  projects: Project[];
  loading: boolean;
  onProjectsChange: (projects: Project[]) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({ niveau: "", statut: "" });

  const filterGroups: AdminFilterGroup[] = [
    { key: "niveau", label: "Niveau", primary: true, options: PROJETS_NIVEAU_OPTIONS },
    { key: "statut", label: "Statut", options: PROJETS_STATUT_OPTIONS },
  ];

  const filteredProjects = projects
    .filter((p) => {
      if (!filters.niveau) return true;
      if (filters.niveau === "public") return p.status === "public";
      if (filters.niveau === "confidentiel_sensible")
        return p.status === "confidential" && p.sensitivity_level === "sensible";
      return p.status === "confidential" && p.sensitivity_level === "tres_sensible";
    })
    .filter((p) => {
      if (!filters.statut) return true;
      const published = p.status === "public" || p.status === "confidential";
      return filters.statut === "publie" ? published : !published;
    });

  const openNew = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  // getProjects() alimente la liste via projects_catalog_view, qui n'expose
  // pas long_desc/ai_structured_desc/team (cf. commentaires du type Project) --
  // ouvrir le drawer directement avec cette ligne laisserait ces champs
  // obligatoires vides et bloquerait toute sauvegarde sur un projet existant.
  // On récupère donc la fiche complète avant d'ouvrir le formulaire d'édition.
  const openEdit = async (p: Project) => {
    setBusyId(p.id);
    try {
      const full = await getProjectById(p.id, { includeDeleted: true });
      setEditing(full ?? p);
      setDrawerOpen(true);
    } finally {
      setBusyId(null);
    }
  };

  const save = async (id: string, input: ProjectInput, isNew: boolean) => {
    const saved = isNew ? await createProject(id, input) : await updateProject(id, input);
    onProjectsChange(
      projects.some((x) => x.id === saved.id)
        ? projects.map((x) => (x.id === saved.id ? saved : x))
        : [saved, ...projects],
    );
  };

  const softDelete = async (id: string) => {
    setBusyId(id);
    try {
      await softDeleteProject(id);
      onProjectsChange(
        projects.map((x) => (x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x)),
      );
    } finally {
      setBusyId(null);
    }
  };

  const restore = async (id: string) => {
    setBusyId(id);
    try {
      await restoreProject(id);
      onProjectsChange(projects.map((x) => (x.id === id ? { ...x, deleted_at: null } : x)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative">
      <SectionAurora color="teal" />
      <header className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-4xl font-medium text-on-surface md:text-5xl">
            Mon catalogue <span className="font-display-accent italic text-primary">Projets</span>
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Crée tes projets publics et confidentiels en un clin d'œil à l'aide de l'IA.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus aria-hidden="true" size={18} />
          Créer un nouveau projet
        </button>
      </header>

      <div className="mt-8">
        <AdminFilterBar groups={filterGroups} value={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-on-surface-variant">Chargement des projets…</p>
      ) : (
        <ul className="mt-10 space-y-6">
          {filteredProjects.map((p, i) => {
            const deleted = Boolean(p.deleted_at);
            const num = String(i + 1).padStart(2, "0");
            const statusKind = deleted
              ? "deleted"
              : p.status === "public"
                ? "public"
                : p.status === "confidential"
                  ? "confidential"
                  : "draft";
            const published = p.status === "public" || p.status === "confidential";
            const rowBorder = published ? "border-primary/30" : "border-white/5";
            return (
              <li
                key={p.id}
                className={
                  "flex flex-col gap-4 rounded-2xl border bg-surface-container-low p-6 md:flex-row md:items-center " +
                  rowBorder +
                  " " +
                  (deleted ? "opacity-35" : "")
                }
              >
                <div
                  className={
                    "w-14 shrink-0 font-headline text-3xl font-medium " +
                    (published ? "text-primary" : "text-on-surface-variant opacity-90")
                  }
                >
                  {num}.
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xl font-bold text-on-surface">{p.title}</h3>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                    {deleted && p.deleted_at
                      ? `Supprimé le ${new Date(p.deleted_at).toLocaleDateString("fr-FR")}`
                      : formatPeriod(p.start_date, p.end_date)}
                  </p>
                </div>

                <div className="shrink-0">
                  <StatusBadge
                    kind={statusKind}
                    suffix={
                      !deleted && p.status === "confidential"
                        ? SENSITIVITY_LABELS[p.sensitivity_level]
                        : undefined
                    }
                  />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {deleted ? (
                    <IconTooltip label={`Restaurer le projet ${p.title}`}>
                      <button
                        type="button"
                        onClick={() => restore(p.id)}
                        disabled={busyId === p.id}
                        aria-label={`Restaurer le projet ${p.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-primary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <ArchiveRestore aria-hidden="true" size={16} />
                      </button>
                    </IconTooltip>
                  ) : (
                    <>
                      <IconTooltip label={`Éditer ${p.title}`}>
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          disabled={busyId === p.id}
                          aria-label={`Éditer ${p.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-primary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <Pencil aria-hidden="true" size={16} />
                        </button>
                      </IconTooltip>
                      <IconTooltip label={`Supprimer ${p.title}`}>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(p.id)}
                        disabled={busyId === p.id}
                        aria-label={`Supprimer ${p.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-error disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Trash2 aria-hidden="true" size={18} />
                      </button>
                      </IconTooltip>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ProjectDrawer
        open={drawerOpen}
        project={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={save}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <AuroraBackground variant="modal" />
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-md rounded-2xl border border-white/10 bg-surface-container-lowest p-6 shadow-2xl shadow-black/40">
            <h3 className="text-lg font-medium text-on-surface">Supprimer ce projet ?</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Le projet sera masqué du catalogue public. Tu pourras le restaurer plus tard.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X aria-hidden="true" size={16} />
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = confirmDelete;
                  setConfirmDelete(null);
                  softDelete(id);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-2 text-sm font-bold text-[#F87171] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Trash2 aria-hidden="true" size={16} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Demandes Tab ---------- */

const DEMANDES_STATUS_OPTIONS: AdminFilterGroup["options"] = [
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Validées" },
  { value: "rejected", label: "Refusées" },
];

function DemandesTab({
  items,
  loading,
  onItemsChange,
}: {
  items: AdminAccessRequest[];
  loading: boolean;
  onItemsChange: (items: AdminAccessRequest[]) => void;
}) {
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "",
    period: "",
    person: "",
  });

  const periodOptions = useMemo(
    () =>
      Array.from(new Set(items.map((r) => r.createdAt.slice(0, 7))))
        .sort((a, b) => (a < b ? 1 : -1))
        .map((key) => ({
          value: key,
          label: new Date(`${key}-01`).toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          }),
        })),
    [items],
  );
  const personOptions = useMemo(
    () =>
      Array.from(new Set(items.map((r) => r.visitor?.fullName).filter((n): n is string => !!n)))
        .sort()
        .map((name) => ({ value: name, label: name })),
    [items],
  );
  const filterGroups: AdminFilterGroup[] = [
    { key: "status", label: "Statut", primary: true, options: DEMANDES_STATUS_OPTIONS },
    { key: "period", label: "Date", options: periodOptions },
    { key: "person", label: "Personne", options: personOptions },
  ];

  const update = (id: string, patch: Partial<AdminAccessRequest>) =>
    onItemsChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const approve = async (id: string) => {
    setError(null);
    setBusyId(id);
    try {
      await approveAccessRequest(id);
      update(id, { status: "approved", validatedAt: new Date().toISOString() });
    } catch {
      setError("Impossible de valider cette demande. Réessaie.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    if (!reason.trim()) return;
    setError(null);
    setBusyId(id);
    try {
      await rejectAccessRequest(id, reason.trim());
      update(id, {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason.trim(),
      });
      setRejecting(null);
      setReason("");
    } catch {
      setError("Impossible de refuser cette demande. Réessaie.");
    } finally {
      setBusyId(null);
    }
  };

  const sorted = [...items]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .filter((r) => !filters.status || r.status === filters.status)
    .filter((r) => !filters.period || r.createdAt.slice(0, 7) === filters.period)
    .filter((r) => !filters.person || r.visitor?.fullName === filters.person);

  return (
    <div className="relative">
      <SectionAurora color="violet" />
      <TabHeader
        title="Demandes d'"
        emphasis="accès"
        subtitle="Valide ou refuse l'accès aux projets confidentiels — chaque refus doit être motivé."
      />
      {error && (
        <div className="mt-6">
          <Alert type="error" title="Une erreur est survenue" description={error} />
        </div>
      )}
      <div className="mt-6">
        <AdminFilterBar groups={filterGroups} value={filters} onChange={setFilters} />
      </div>
      {loading ? (
        <p className="mt-10 text-sm text-on-surface-variant">Chargement des demandes…</p>
      ) : sorted.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3">
          <KeyRound aria-hidden="true" className="text-on-surface-variant/40" size={60} />
          <p className="text-sm font-light text-on-surface-variant">Aucune demande d'accès</p>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          {sorted.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface-container-low p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-medium text-on-surface">
                    {r.visitor?.fullName ?? "Visiteur"}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {r.visitor?.company ?? "—"} ·{" "}
                    <span className="text-primary">{r.visitor?.email ?? "—"}</span>
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    <span className="text-on-surface">Projet :</span>{" "}
                    {r.project?.title ?? "Projet supprimé"}
                  </p>
                  {r.message && (
                    <p className="mt-1 text-sm text-on-surface-variant">
                      <span className="text-on-surface">Message :</span> {r.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-on-surface-variant/70">
                    {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge kind={r.status} />
                </div>
              </div>

              {r.status === "pending" && (
                <div className="flex flex-col gap-3">
                  {rejecting === r.id ? (
                    <div className="rounded-xl border border-white/5 bg-surface-container p-4">
                      <label
                        htmlFor={`reason-${r.id}`}
                        className="block text-sm font-medium text-on-surface-variant"
                      >
                        Motif du refus (obligatoire)
                      </label>
                      <textarea
                        id={`reason-${r.id}`}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={2}
                        required
                        className="mt-2 w-full rounded-xl border border-white/5 bg-surface-container px-4 py-3 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        placeholder="Explique brièvement le refus."
                      />
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRejecting(null);
                            setReason("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <X aria-hidden="true" size={14} />
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(r.id)}
                          disabled={!reason.trim() || busyId === r.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-1.5 text-xs font-bold text-[#F87171] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <Ban aria-hidden="true" size={14} />
                          Confirmer le refus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRejecting(r.id)}
                        disabled={busyId === r.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#F87171]/30 px-4 py-1.5 text-sm font-medium text-[#F87171] hover:bg-[#F87171]/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Ban aria-hidden="true" size={14} />
                        Refuser
                      </button>
                      <button
                        type="button"
                        onClick={() => approve(r.id)}
                        disabled={busyId === r.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-4 py-1.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Check aria-hidden="true" size={14} />
                        Valider
                      </button>
                    </div>
                  )}
                </div>
              )}

              {r.status === "rejected" && r.rejectionReason && (
                <p className="rounded-xl border border-white/5 bg-surface-container p-3 text-xs text-on-surface-variant">
                  <span className="font-medium text-on-surface-variant">Motif du refus :</span>{" "}
                  {r.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Contacts Tab ---------- */

/** Progression à sens unique -- un message archivé ne redevient jamais "nouveau" (pas d'entrée pour "archived"). */
const nextContactStatus: Partial<Record<ContactDbStatus, ContactDbStatus>> = {
  new: "treated",
  treated: "archived",
};

const CONTACT_STATUS_KIND: Record<ContactDbStatus, "nouveau" | "traite" | "archive"> = {
  new: "nouveau",
  treated: "traite",
  archived: "archive",
};

const CONTACT_STATUS_OPTIONS: AdminFilterGroup["options"] = [
  { value: "new", label: "Nouveau" },
  { value: "treated", label: "Traité" },
  { value: "archived", label: "Archivé" },
];

function ContactsTab({
  items,
  loading,
  onItemsChange,
}: {
  items: AdminContactMessage[];
  loading: boolean;
  onItemsChange: (items: AdminContactMessage[]) => void;
}) {
  const [filters, setFilters] = useState<Record<string, string>>({ status: "" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filterGroups: AdminFilterGroup[] = [
    { key: "status", label: "Statut", primary: true, options: CONTACT_STATUS_OPTIONS },
  ];

  const sorted = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const filtered = sorted.filter((m) => !filters.status || m.status === filters.status);

  const cycle = async (m: AdminContactMessage) => {
    const next = nextContactStatus[m.status];
    if (!next) return;
    setError(null);
    setBusyId(m.id);
    try {
      await updateContactStatus(m.id, next);
      onItemsChange(items.map((x) => (x.id === m.id ? { ...x, status: next } : x)));
    } catch {
      setError("Impossible de changer le statut de ce message. Réessaie.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative">
      <SectionAurora color="cyan" />
      <TabHeader
        title="Messages"
        emphasis="reçus"
        subtitle="Traite, archive, reviens-y. Le statut se met à jour d'un clic."
      />

      {error && (
        <div className="mt-6">
          <Alert type="error" title="Une erreur est survenue" description={error} />
        </div>
      )}

      <div className="mt-10">
        <AdminFilterBar groups={filterGroups} value={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-on-surface-variant">Chargement des messages…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3">
          <Inbox aria-hidden="true" className="text-on-surface-variant/40" size={60} />
          <p className="text-sm font-light text-on-surface-variant">
            {items.length === 0 ? "Aucun message reçu" : "Aucun message pour ce filtre"}
          </p>
        </div>
      ) : (
        <ul role="list" className="mt-6 space-y-4">
          {filtered.map((m) => {
            const next = nextContactStatus[m.status];
            return (
              <li
                key={m.id}
                className="glass-panel flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface-container-low p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-base font-medium text-on-surface">{m.name}</p>
                    <span className="text-sm text-on-surface-variant">{m.email}</span>
                  </div>
                  <p
                    className="mt-2 text-sm font-light text-on-surface-variant"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                    }}
                  >
                    {m.message}
                  </p>
                  <p className="mt-2 text-[10px] tracking-widest text-on-surface-variant">
                    {new Date(m.createdAt)
                      .toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                      .toUpperCase()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3" aria-live="polite">
                  <StatusBadge kind={CONTACT_STATUS_KIND[m.status]} />
                  {next && (
                    <IconTooltip label={`Changer le statut du message de ${m.name}`}>
                      <button
                        type="button"
                        onClick={() => cycle(m)}
                        disabled={busyId === m.id}
                        aria-label={`Changer le statut du message de ${m.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-on-surface-variant transition-all hover:bg-white/10 hover:text-primary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <ArrowLeftRight aria-hidden="true" size={16} />
                      </button>
                    </IconTooltip>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Paramètres Tab ---------- */

type SocialFieldKey = "linkedin" | "twitter" | "website";

interface SocialFieldError {
  field: SocialFieldKey;
  message: string;
}

const SOCIAL_FIELD_LABELS: Record<SocialFieldKey, string> = {
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  website: "Site web",
};

/** Vide = optionnel, valide -- rempli mais mal formé ou protocole non http(s) = invalide. */
function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type ParametresForm = Omit<DesignerProfileInput, "photoUrl"> & { photoUrl: string };

function emptyParametresForm(): ParametresForm {
  return {
    photoUrl: "",
    profession: "",
    adjective: "",
    bio: "",
    linkedin: "",
    twitter: "",
    website: "",
    calUsername: "",
  };
}

function ParametresTab() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ParametresForm>(emptyParametresForm);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<SocialFieldError[]>([]);
  const [copied, setCopied] = useState(false);

  const loadProfile = () =>
    getDesignerProfile().then((profile) =>
      setForm({
        photoUrl: profile.avatar,
        profession: profile.profession,
        adjective: profile.adjective,
        bio: profile.bio,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        website: profile.website,
        calUsername: profile.calUsername,
      }),
    );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadProfile().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  const publicUrl = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://folio.plus";
    return `${base}/${designer.slug}`;
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/5 bg-surface-container px-4 py-3 text-sm font-light text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";
  const labelCls = "block text-sm font-medium text-on-surface-variant";

  const errorFor = (field: SocialFieldKey) => errors.find((e) => e.field === field);
  const errorRingCls = (field: SocialFieldKey, base: string) =>
    cn(base, errorFor(field) && "border-error focus-visible:ring-error");

  function fieldError(field: SocialFieldKey) {
    const err = errorFor(field);
    if (!err) return null;
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-error" role="alert">
        <CircleAlert aria-hidden="true" size={14} className="shrink-0" />
        {err.message}
      </p>
    );
  }

  const onFileSelected = (file: File) => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const startEditing = () => {
    setSaveSuccess(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setPendingFile(null);
    setPendingPreview(null);
    setErrors([]);
    setSaveError(null);
    setEditing(false);
    setLoading(true);
    loadProfile().finally(() => setLoading(false));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: SocialFieldError[] = (["linkedin", "twitter", "website"] as SocialFieldKey[])
      .filter((field) => !isValidUrl(form[field]))
      .map((field) => ({
        field,
        message: `Le lien ${SOCIAL_FIELD_LABELS[field]} n'est pas valide.`,
      }));
    setErrors(errs);
    if (errs.length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      let photoUrl = form.photoUrl;
      if (pendingFile) {
        photoUrl = await uploadDesignerPhoto(pendingFile);
      }
      await updateDesignerProfile({
        photoUrl,
        profession: form.profession.trim(),
        adjective: form.adjective.trim(),
        bio: form.bio.trim(),
        linkedin: form.linkedin.trim(),
        twitter: form.twitter.trim(),
        website: form.website.trim(),
        calUsername: form.calUsername.trim(),
      });
      setForm((f) => ({ ...f, photoUrl }));
      setPendingFile(null);
      setPendingPreview(null);
      setEditing(false);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Une erreur est survenue. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <SectionAurora color="teal" />
      <TabHeader
        title="Mes"
        emphasis="paramètres"
        subtitle="Mets à jour ton profil public ci-dessous."
        cta={
          !loading && !editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Pencil aria-hidden="true" size={16} />
              Modifier mes informations
            </button>
          ) : undefined
        }
      />

      {saveSuccess && (
        <div className="mt-6">
          <Alert type="success" title="Profil mis à jour." />
        </div>
      )}
      {saveError && (
        <div className="mt-6">
          <Alert type="error" title="Échec de l'enregistrement" description={saveError} />
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-on-surface-variant">Chargement de ton profil…</p>
      ) : (
        <form onSubmit={handleSave} className="mt-10 space-y-6">
          <div>
            <label htmlFor="s-photo-input" className={labelCls}>
              Photo de profil
            </label>
            <label
              onDragOver={(e) => {
                if (!editing) return;
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                if (!editing) return;
                const file = e.dataTransfer.files?.[0];
                if (file) onFileSelected(file);
              }}
              className={cn(
                "mt-2 flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed bg-surface-container text-center",
                editing ? "cursor-pointer hover:bg-white/5" : "cursor-default opacity-70",
                isDraggingOver ? "border-primary bg-primary/5" : "border-white/15",
              )}
            >
              {pendingPreview || form.photoUrl ? (
                <img
                  src={pendingPreview ?? form.photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <CloudUpload aria-hidden="true" className="text-on-surface-variant" size={30} />
                  <p className="text-sm text-on-surface-variant">
                    Glisse-dépose ou <span className="text-primary">parcourir</span>
                  </p>
                </>
              )}
              <input
                id="s-photo-input"
                type="file"
                disabled={!editing}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="s-profession" className={labelCls}>
                Profession
              </label>
              <input
                id="s-profession"
                disabled={!editing}
                value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
                className={inputCls + " mt-2"}
              />
            </div>
            <div>
              <label htmlFor="s-adjective" className={labelCls}>
                Adjectif qui te définit
              </label>
              <input
                id="s-adjective"
                disabled={!editing}
                value={form.adjective}
                onChange={(e) => setForm({ ...form, adjective: e.target.value })}
                className={inputCls + " mt-2"}
              />
            </div>
          </div>

          <div>
            <label htmlFor="s-bio" className={labelCls}>
              Bio
            </label>
            <textarea
              id="s-bio"
              rows={5}
              disabled={!editing}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className={inputCls + " mt-2 resize-y"}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="s-linkedin" className={labelCls}>
                LinkedIn
              </label>
              <input
                id="s-linkedin"
                disabled={!editing}
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className={errorRingCls("linkedin", inputCls + " mt-2")}
                placeholder="https://linkedin.com/in/votre-profil"
              />
              {fieldError("linkedin")}
            </div>
            <div>
              <label htmlFor="s-twitter" className={labelCls}>
                X (Twitter)
              </label>
              <input
                id="s-twitter"
                disabled={!editing}
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                className={errorRingCls("twitter", inputCls + " mt-2")}
                placeholder="https://x.com/votre-profil"
              />
              {fieldError("twitter")}
            </div>
            <div>
              <label htmlFor="s-website" className={labelCls}>
                Site web
              </label>
              <input
                id="s-website"
                disabled={!editing}
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className={errorRingCls("website", inputCls + " mt-2")}
                placeholder="https://votre-site.fr"
              />
              {fieldError("website")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="s-cal" className={labelCls}>
                  Nom d'utilisateur Cal.com
                </label>
                <ComingSoonBadge />
              </div>
              <input
                id="s-cal"
                disabled={!editing}
                value={form.calUsername}
                onChange={(e) => setForm({ ...form, calUsername: e.target.value })}
                className={inputCls + " mt-2"}
                placeholder="ex : lea-martin"
              />
              <p className="mt-1 text-xs text-on-surface-variant/70">
                Affiche le widget de prise de rendez-vous sur ton profil public si rempli, le masque
                totalement si laissé vide.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="s-url" className={labelCls}>
              URL publique du profil
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="s-url"
                readOnly
                value={publicUrl}
                className={inputCls + " cursor-default text-on-surface-variant"}
              />
              <IconTooltip label="Copier le lien du profil">
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copier le lien du profil"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-on-surface hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {copied ? (
                    <Check aria-hidden="true" size={18} />
                  ) : (
                    <Copy aria-hidden="true" size={18} />
                  )}
                </button>
              </IconTooltip>
            </div>
            <p className="mt-2 text-xs text-on-surface-variant/70">
              Le slug est en lecture seule pour cette version.{" "}
              <Link to={`/${designer.slug}`} className="text-primary hover:underline">
                Voir le profil public
              </Link>
            </p>
          </div>

          {editing && (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-on-surface disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {saving ? (
                  <Loader2 aria-hidden="true" className="animate-spin" size={18} />
                ) : (
                  <Check aria-hidden="true" size={18} />
                )}
                Enregistrer
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

/* ---------- Veille Design Tab ---------- */

// Meme forme pill que les tags categorie (TagBadge) plutot qu'un style ad hoc --
// statut est un miroir Notion, valeurs ouvertes, d'ou le fallback sur tag-keywords.
const VEILLE_STATUT_STYLES: Record<string, string> = {
  Publié: "border-tag-sector/30 bg-tag-sector/10 text-tag-sector",
  Nouveau: "border-tag-tools/30 bg-tag-tools/10 text-tag-tools",
  Brouillon: "border-tag-keywords/30 bg-tag-keywords/10 text-tag-keywords",
};

function veilleStatutClass(statut: string): string {
  return VEILLE_STATUT_STYLES[statut] ?? "border-tag-keywords/30 bg-tag-keywords/10 text-tag-keywords";
}

/** Formate periode_debut → periode_fin en français, ex. "3 – 9 juillet 2026". */
function formatPeriode(debut: string | null, fin: string | null): string {
  if (!debut && !fin) return "—";
  const longOpts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  if (debut && fin) {
    const d = new Date(debut);
    const f = new Date(fin);
    const sameMonth = d.getMonth() === f.getMonth() && d.getFullYear() === f.getFullYear();
    const startLabel = d.toLocaleDateString(
      "fr-FR",
      sameMonth ? { day: "numeric" } : { day: "numeric", month: "long" },
    );
    return `${startLabel} – ${f.toLocaleDateString("fr-FR", longOpts)}`;
  }
  return new Date((debut ?? fin) as string).toLocaleDateString("fr-FR", longOpts);
}

const veillePillCls = (active: boolean, color: "sector" | "keywords") =>
  "rounded-full border px-4 py-1.5 text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  (active
    ? `border-tag-${color}/40 bg-tag-${color}/15 text-tag-${color}`
    : `border-outline text-on-surface-variant hover:border-tag-${color}/40 hover:bg-tag-${color}/15 hover:text-tag-${color}`);

function VeilleDesignTab({
  entries,
  loading,
  session,
  onSynced,
}: {
  entries: DesignWatchEntry[];
  loading: boolean;
  session: Session | null;
  onSynced: () => Promise<void> | void;
}) {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string>>({ statut: "", tag: "" });
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  // Deep-link depuis le tableau "Veille Hebdo" du Dashboard (?entry=<notion_page_id>) --
  // ouvre directement le drawer de contenu de l'entrée visée.
  const [openEntryId, setOpenEntryId] = useState<string | null>(() => searchParams.get("entry"));
  const openEntry = entries.find((e) => e.notion_page_id === openEntryId) ?? null;

  // statut est un miroir direct du select Notion (valeurs vues en prod : Brouillon, Nouveau) --
  // liste dynamique, pas une énumération figée côté app (cf. commentaire migration table).
  const statutOptions = useMemo(
    () => Array.from(new Set(entries.map((e) => e.statut))).sort(),
    [entries],
  );
  const tagOptions = useMemo(
    () => Array.from(new Set(entries.flatMap((e) => e.tags))).sort(),
    [entries],
  );

  const filterGroups: AdminFilterGroup[] = [
    {
      key: "statut",
      label: "Statut",
      primary: true,
      options: statutOptions.map((s) => ({ value: s, label: s })),
    },
    {
      key: "tag",
      label: "Tags",
      options: tagOptions.map((t) => ({ value: t, label: t })),
    },
  ];

  const filtered = entries
    .filter((e) => !filters.statut || e.statut === filters.statut)
    .filter((e) => !filters.tag || e.tags.includes(filters.tag));

  const lastSync = useMemo(() => {
    if (entries.length === 0) return null;
    return entries.reduce(
      (max, e) => (e.synced_at > max ? e.synced_at : max),
      entries[0].synced_at,
    );
  }, [entries]);

  const handleSync = async () => {
    if (!session) return;
    setSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);
    try {
      await triggerNotionSync(session.access_token);
      await onSynced();
      // Le contenu synchronisé peut être identique d'une synchro à l'autre (rien de nouveau
      // côté Notion) -- la seule confirmation visible serait sinon la légère mise à jour de
      // la légende "dernière synchronisation", facile à manquer. D'où ce message explicite.
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "La synchronisation a échoué. Réessaie.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <TabHeader
        title="Veille "
        emphasis="Hebdo"
        subtitle="Synthèses hebdomadaires Design/Art/IA agrégées automatiquement depuis Notion."
        cta={
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RefreshCw aria-hidden="true" size={16} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Synchronisation…" : "Synchroniser à nouveau"}
            </button>
            <p className="max-w-xs text-right text-xs text-on-surface-variant/70">
              Synchronisation automatique hebdomadaire — dernière synchronisation :{" "}
              {lastSync
                ? formatDistanceToNow(new Date(lastSync), { addSuffix: true, locale: fr })
                : "jamais"}
              .
            </p>
          </div>
        }
      />

      {syncError && (
        <div className="mt-4">
          <Alert type="error" title="Échec de la synchronisation" description={syncError} />
        </div>
      )}
      {syncSuccess && (
        <div className="mt-4">
          <Alert type="success" title="Synchronisation réussie" description="La veille est à jour." />
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-aurora-cyan p-6">
        <div className="mb-6">
          <AdminFilterBar groups={filterGroups} value={filters} onChange={setFilters} />
        </div>

        {loading ? (
          <p className="text-sm text-on-surface-variant">Chargement de la veille…</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <Newspaper aria-hidden="true" className="text-on-surface-variant/40" size={60} />
            <p className="text-sm font-light text-on-surface-variant">
              {entries.length === 0
                ? "Aucune synchro pour le moment"
                : "Aucune entrée pour ces filtres"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-surface-container-low p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-on-surface">{e.titre}</p>
                    <p className="mt-1 text-xs text-on-surface-variant/70">
                      {formatPeriode(e.periode_debut, e.periode_fin)}
                      {typeof e.nb_sources === "number" && (
                        <span>
                          {" "}
                          · {e.nb_sources} source{e.nb_sources > 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={
                      "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[11px] font-medium " +
                      veilleStatutClass(e.statut)
                    }
                  >
                    {e.statut}
                  </span>
                </div>
                {e.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-tag-keywords/30 bg-tag-keywords/10 px-3 py-1 text-[11px] font-medium text-tag-keywords"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {e.contenu ? (
                  <button
                    type="button"
                    onClick={() => setOpenEntryId(e.notion_page_id)}
                    className="ml-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/40 px-4 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Voir le contenu
                    <ArrowRight aria-hidden="true" size={14} />
                  </button>
                ) : (
                  <p className="text-xs text-on-surface-variant/70">
                    Contenu indisponible — relance une synchro.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {openEntry && <VeilleContentDrawer entry={openEntry} onClose={() => setOpenEntryId(null)} />}
    </>
  );
}

function VeilleContentDrawer({
  entry,
  onClose,
}: {
  entry: DesignWatchEntry;
  onClose: () => void;
}) {
  // Meme shell que ProjectDrawer.tsx (overlay + aside w-[54vw], scroll unique,
  // fermeture Echap) -- ici en lecture seule, pas de confirmation de perte de
  // saisie necessaire, donc le clic sur l'overlay ferme aussi le drawer.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={entry.titre}>
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute right-0 top-0 flex h-screen w-[54vw] flex-col border-l border-white/10 bg-surface-container-lowest">
        <div className="border-b border-white/5 px-10 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                {formatPeriode(entry.periode_debut, entry.periode_fin)}
              </p>
              <h2 className="mt-1 text-xl font-medium text-on-surface">{entry.titre}</h2>
            </div>
            <IconTooltip label="Fermer">
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="shrink-0 rounded-full p-2 text-on-surface-variant hover:bg-white/5 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X aria-hidden="true" size={24} />
              </button>
            </IconTooltip>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-10 py-6">
          <MarkdownContent content={entry.contenu} />
        </div>
      </aside>
    </div>
  );
}

/* ---------- Shared ---------- */

/** Ajoute un espace avant l'accent italique, sauf si le titre se termine déjà
 * par une élision ("d'") où un espace romprait la liaison grammaticale. */
function titleWithSpacer(title: string): string {
  const trimmed = title.replace(/\s+$/, "");
  return /['’]$/.test(trimmed) ? trimmed : trimmed + " ";
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Couleur dominante par section du dashboard admin (cf. DESIGN.md) — un
 * seul halo discret, réutilise les teintes aurora déjà existantes. */
const SECTION_AURORA: Record<"teal" | "violet" | "cyan" | "indigo", string> = {
  teal: "var(--aurora-teal)",
  violet: "var(--aurora-purple)",
  cyan: "var(--aurora-cyan)",
  indigo: "var(--aurora-indigo)",
};

function SectionAurora({ color }: { color: keyof typeof SECTION_AURORA }) {
  return (
    <div
      aria-hidden="true"
      className="aurora-section"
      style={{ ["--aurora-section-color" as string]: SECTION_AURORA[color] }}
    />
  );
}

function TabHeader({
  title,
  emphasis,
  subtitle,
  cta,
}: {
  title: string;
  emphasis: string;
  subtitle: string;
  cta?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-4xl font-medium text-on-surface md:text-5xl">
          {titleWithSpacer(title)}
          <span className="font-display-accent text-5xl italic text-primary md:text-6xl">
            {capitalize(emphasis)}
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-on-surface-variant">{subtitle}</p>
      </div>
      {cta}
    </header>
  );
}
