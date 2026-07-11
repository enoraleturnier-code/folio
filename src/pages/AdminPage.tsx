import {
  ArchiveRestore,
  ArrowLeftRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Copy,
  Folder,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Mail,
  Pencil,
  Settings,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { Alert } from "@/components/Alert";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import { designer } from "@/data/designer";
import { contactMessages as seedContacts } from "@/data/contacts";
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
import type { ContactMessage, ContactStatus } from "@/data/types";
import type { Project } from "@/types/project";

const ALLOWED_TABS = ["dashboard", "projets", "demandes", "contacts", "parametres"] as const;
type TabKey = (typeof ALLOWED_TABS)[number];

function parseTab(value: string | null): TabKey {
  return (ALLOWED_TABS as readonly string[]).includes(value ?? "")
    ? (value as TabKey)
    : "dashboard";
}

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, loading, role, roleLoading } = useAuth();
  const tab: TabKey = parseTab(searchParams.get("tab"));
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [accessRequests, setAccessRequests] = useState<AdminAccessRequest[]>([]);
  const [accessRequestsLoading, setAccessRequestsLoading] = useState(true);

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

  const pendingCount = useMemo(
    () => accessRequests.filter((r) => r.status === "pending").length,
    [accessRequests],
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
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        pendingCount={pendingCount}
      />
      <main
        className={
          "flex-1 pb-16 pt-[80px] transition-[margin] " +
          (collapsed ? "ml-16 md:ml-20" : "ml-20 md:ml-56")
        }
      >
        <div className="mx-auto max-w-6xl px-6 pt-10 md:px-10">
          {tab === "dashboard" && (
            <DashboardTab setTab={setTab} projects={projects} accessRequests={accessRequests} />
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
          {tab === "contacts" && <ContactsTab />}
          {tab === "parametres" && <ParametresTab />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ---------- Sidebar ---------- */

function AdminSidebar({
  tab,
  setTab,
  collapsed,
  onToggleCollapsed,
  pendingCount,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  pendingCount: number;
}) {
  const items: {
    key: TabKey;
    icon: LucideIcon;
    label: string;
    badge?: number;
  }[] = [
    { key: "projets", icon: Folder, label: "Catalogue projets" },
    {
      key: "demandes",
      icon: KeyRound,
      label: "Accès",
      badge: pendingCount,
    },
    { key: "contacts", icon: Mail, label: "Messages" },
    { key: "parametres", icon: Settings, label: "Paramètres " },
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

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={
          collapsed ? "Agrandir la barre de navigation" : "Réduire la barre de navigation"
        }
        className={
          "mt-8 flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-on-surface-variant/65 transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
          (collapsed ? "" : "md:self-end")
        }
      >
        {collapsed ? (
          <ChevronRight aria-hidden="true" size={18} />
        ) : (
          <ChevronLeft aria-hidden="true" size={18} />
        )}
      </button>

      <div
        className={
          "mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-on-primary/10 text-sm font-bold text-primary " +
          (collapsed ? "" : "md:self-center")
        }
      >
        {designer.fullName
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")}
      </div>

      <nav
        className={
          "mt-8 flex flex-col gap-2 " +
          (collapsed ? "items-center" : "items-center md:items-stretch")
        }
      >
        <Link
          to="/admin"
          aria-label="Dashboard"
          aria-current={tab === "dashboard" ? "page" : undefined}
          className={
            "relative flex h-12 items-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
            (collapsed
              ? "w-12 justify-center"
              : "w-12 justify-center md:w-full md:justify-start md:px-3 md:gap-3") +
            " " +
            (tab === "dashboard"
              ? "bg-primary-container/10 text-primary"
              : "text-on-surface-variant/65 hover:text-on-surface")
          }
        >
          <LayoutDashboard aria-hidden="true" size={24} />
          {!collapsed && <span className="hidden text-sm md:inline">Dashboard</span>}
        </Link>
        {items.map((it) => {
          const active = tab === it.key;
          const ItemIcon = it.icon;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => setTab(it.key)}
              aria-label={
                it.badge && it.badge > 0
                  ? `${it.label} — ${it.badge} demandes en attente`
                  : it.label
              }
              aria-current={active ? "page" : undefined}
              className={
                "relative flex h-12 items-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
                (collapsed
                  ? "w-12 justify-center"
                  : "w-12 justify-center md:w-full md:justify-start md:px-3 md:gap-3") +
                " " +
                (active
                  ? "bg-primary-container/10 text-primary"
                  : "text-on-surface-variant/65 hover:text-on-surface")
              }
            >
              <ItemIcon aria-hidden="true" size={24} />
              {!collapsed && (
                <span className="hidden flex-1 text-left text-sm md:inline">{it.label}</span>
              )}
              {it.badge && it.badge > 0 ? (
                <span
                  aria-hidden="true"
                  className={
                    collapsed
                      ? "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-on-surface"
                      : "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-on-surface md:static md:ml-auto md:h-5 md:w-5"
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

function DashboardTab({
  setTab,
  projects,
  accessRequests,
}: {
  setTab: (t: TabKey) => void;
  projects: Project[];
  accessRequests: AdminAccessRequest[];
}) {
  const pendingRequests = accessRequests.filter((r) => r.status === "pending");
  const newMessages = seedContacts.filter((c) => c.status === "nouveau");
  const activeProjects = projects.filter((p) => !p.deleted_at);
  const publishedProjects = activeProjects.filter(
    (p) => p.status === "public" || p.status === "confidential",
  );
  const draftProjects = activeProjects.filter((p) => p.status === "draft");

  return (
    <>
      <TabHeader
        eyebrow="00 — Vue d'ensemble"
        title="Tableau de "
        emphasis="bord"
        subtitle="Récapitulatif de vos projets, demandes d'accès et messages en un coup d'œil."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setTab("projets")}
          className="flex flex-col items-start rounded-2xl border border-white/5 bg-surface-container-low p-5 text-left transition-colors hover:border-primary/20"
        >
          <Folder aria-hidden="true" className="text-primary" size={24} />
          <span className="mt-4 text-3xl font-bold text-on-surface">{activeProjects.length}</span>
          <span className="mt-1 text-sm text-on-surface-variant">Projets</span>
          <span className="mt-2 text-xs text-primary">
            {publishedProjects.length} publiés · {draftProjects.length} brouillon
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("demandes")}
          className="flex flex-col items-start rounded-2xl border border-white/5 bg-surface-container-low p-5 text-left transition-colors hover:border-primary/20"
        >
          <KeyRound aria-hidden="true" className="text-primary" size={24} />
          <span className="mt-4 text-3xl font-bold text-on-surface">{pendingRequests.length}</span>
          <span className="mt-1 text-sm text-on-surface-variant">Demandes en attente</span>
          <span className="mt-2 text-xs text-primary">À valider ou refuser</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("contacts")}
          className="flex flex-col items-start rounded-2xl border border-white/5 bg-surface-container-low p-5 text-left transition-colors hover:border-primary/20"
        >
          <Mail aria-hidden="true" className="text-primary" size={24} />
          <span className="mt-4 text-3xl font-bold text-on-surface">{newMessages.length}</span>
          <span className="mt-1 text-sm text-on-surface-variant">Messages nouveaux</span>
          <span className="mt-2 text-xs text-primary">À traiter</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("parametres")}
          className="flex flex-col items-start rounded-2xl border border-white/5 bg-surface-container-low p-5 text-left transition-colors hover:border-primary/20"
        >
          <Settings aria-hidden="true" className="text-primary" size={24} />
          <span className="mt-4 text-3xl font-bold text-on-surface">1</span>
          <span className="mt-1 text-sm text-on-surface-variant">Paramètres</span>
          <span className="mt-2 text-xs text-primary">Profil public</span>
        </button>
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
                  className="shrink-0 rounded-full bg-primary-container px-5 py-2 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
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
                  <p className="font-medium text-on-surface">{m.fullName}</p>
                  <p className="text-sm text-on-surface-variant">{m.email} — Nouveau message</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("contacts")}
                  className="shrink-0 rounded-full bg-primary-container px-5 py-2 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
                >
                  Lire
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
    <>
      <header className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
        <h1 className="text-4xl font-bold text-on-surface md:text-[44px]">
          Mon catalogue <span className="font-display-accent italic text-primary">Projets</span>
        </h1>
        <button
          type="button"
          onClick={openNew}
          className="rounded-full bg-primary-container px-6 py-3 text-sm font-bold text-background shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
        >
          + Créer un nouveau projet
        </button>
      </header>

      {loading ? (
        <p className="mt-10 text-sm text-on-surface-variant">Chargement des projets…</p>
      ) : (
        <ul className="mt-10 space-y-6">
          {projects.map((p, i) => {
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
                  <h3
                    className={
                      "truncate text-xl font-bold text-on-surface " + (deleted ? "opacity-60" : "")
                    }
                  >
                    {p.title}
                  </h3>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                    {deleted && p.deleted_at
                      ? `Supprimé le ${new Date(p.deleted_at).toLocaleDateString("fr-FR")}`
                      : formatPeriod(p.start_date, p.end_date)}
                  </p>
                </div>

                <div className="shrink-0">
                  <StatusBadge kind={statusKind} />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {deleted ? (
                    <button
                      type="button"
                      onClick={() => restore(p.id)}
                      disabled={busyId === p.id}
                      aria-label={`Restaurer le projet ${p.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-primary disabled:opacity-50"
                    >
                      <ArchiveRestore aria-hidden="true" size={18} />
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        disabled={busyId === p.id}
                        aria-label={`Éditer ${p.title}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-primary disabled:opacity-50"
                      >
                        <Pencil aria-hidden="true" size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(p.id)}
                        disabled={busyId === p.id}
                        aria-label={`Supprimer ${p.title}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-error disabled:opacity-50"
                      >
                        <Trash2 aria-hidden="true" size={18} />
                      </button>
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
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-md rounded-2xl border border-white/10 bg-surface-container-lowest p-6">
            <h3 className="text-lg font-medium text-on-surface">Supprimer ce projet ?</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Le projet sera masqué du catalogue public. Vous pourrez le restaurer plus tard.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-on-surface"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = confirmDelete;
                  setConfirmDelete(null);
                  softDelete(id);
                }}
                className="rounded-full border border-[#F87171]/30 bg-[#F87171]/10 px-6 py-2.5 text-sm font-bold text-[#F87171]"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Demandes Tab ---------- */

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

  const update = (id: string, patch: Partial<AdminAccessRequest>) =>
    onItemsChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const approve = async (id: string) => {
    setError(null);
    setBusyId(id);
    try {
      await approveAccessRequest(id);
      update(id, { status: "approved", validatedAt: new Date().toISOString() });
    } catch {
      setError("Impossible de valider cette demande. Réessayez.");
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
      setError("Impossible de refuser cette demande. Réessayez.");
    } finally {
      setBusyId(null);
    }
  };

  const sorted = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <>
      <TabHeader
        eyebrow="02 — Accès"
        title="Demandes d'"
        emphasis="accès"
        subtitle="Validez ou refusez l'accès aux projets confidentiels — chaque refus doit être motivé."
      />
      {error && (
        <div className="mt-6">
          <Alert type="error" title="Une erreur est survenue" description={error} />
        </div>
      )}
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
                    <div className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/5 p-4">
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
                        placeholder="Expliquez brièvement le refus."
                      />
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRejecting(null);
                            setReason("");
                          }}
                          className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-on-surface"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(r.id)}
                          disabled={!reason.trim() || busyId === r.id}
                          className="rounded-full border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-2 text-xs font-bold text-[#F87171] disabled:opacity-50"
                        >
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
                        className="rounded-full border border-[#F87171]/30 px-5 py-2 text-sm font-medium text-[#F87171] hover:bg-[#F87171]/10 disabled:opacity-50"
                      >
                        Refuser
                      </button>
                      <button
                        type="button"
                        onClick={() => approve(r.id)}
                        disabled={busyId === r.id}
                        className="rounded-full bg-primary-container px-5 py-2 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:opacity-50"
                      >
                        Valider
                      </button>
                    </div>
                  )}
                </div>
              )}

              {r.status === "rejected" && r.rejectionReason && (
                <p className="rounded-xl border border-white/5 bg-surface-container p-3 text-xs text-on-surface-variant">
                  <span className="font-medium text-[#F87171]">Motif du refus :</span>{" "}
                  {r.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Contacts Tab ---------- */

const nextContactStatus: Record<ContactStatus, ContactStatus> = {
  nouveau: "traite",
  traite: "archive",
  archive: "nouveau",
};

function ContactsTab() {
  const [items, setItems] = useState<ContactMessage[]>(() =>
    [...seedContacts].sort((a, b) => (a.date < b.date ? 1 : -1)),
  );

  const cycle = (id: string) =>
    setItems((xs) =>
      xs.map((x) => (x.id === id ? { ...x, status: nextContactStatus[x.status] } : x)),
    );

  return (
    <>
      <TabHeader
        eyebrow="03 — Contacts"
        title="Messages"
        emphasis="reçus"
        subtitle="Traitez, archivez, revenez-y. Le statut se met à jour d'un clic."
      />
      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3">
          <Inbox aria-hidden="true" className="text-on-surface-variant/40" size={60} />
          <p className="text-sm font-light text-on-surface-variant">Aucun message reçu</p>
        </div>
      ) : (
        <ul role="list" className="mt-10 space-y-4">
          {items.map((m) => (
            <li
              key={m.id}
              className="glass-panel flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface-container-low p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-medium text-on-surface">{m.fullName}</p>
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
                  {new Date(m.date)
                    .toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                    .toUpperCase()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3" aria-live="polite">
                <StatusBadge kind={m.status} />
                <button
                  type="button"
                  onClick={() => cycle(m.id)}
                  aria-label={`Changer le statut du message de ${m.fullName}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant transition-all hover:bg-white/10 hover:text-primary"
                >
                  <ArrowLeftRight aria-hidden="true" size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------- Paramètres Tab ---------- */

function ParametresTab() {
  const [form, setForm] = useState({
    avatar: designer.avatar,
    bio: designer.bio,
    linkedin: designer.linkedin,
    twitter: designer.twitter,
    website: designer.website,
    calUsername: designer.calUsername,
  });
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

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
    "w-full rounded-xl border border-white/5 bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const labelCls = "block text-sm font-medium text-on-surface-variant";

  return (
    <>
      <TabHeader
        eyebrow="04 — Profil"
        title="Vos"
        emphasis="paramètres"
        subtitle="Mise à jour de votre profil public — visible à l'adresse ci-dessous."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="mt-10 space-y-6"
      >
        <div>
          <p className={labelCls}>Avatar</p>
          <div className="mt-2 flex items-center gap-4">
            <img
              src={form.avatar}
              alt="Avatar"
              className="h-20 w-20 rounded-full border border-white/10 object-cover"
            />
            <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 bg-surface-container px-6 py-6 text-center">
              <CloudUpload aria-hidden="true" className="text-on-surface-variant" size={24} />
              <p className="text-sm text-on-surface-variant">
                Glissez-déposez une image ou <span className="text-primary">parcourir</span>
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="s-bio" className={labelCls}>
            Bio
          </label>
          <textarea
            id="s-bio"
            rows={5}
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
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              className={inputCls + " mt-2"}
            />
          </div>
          <div>
            <label htmlFor="s-twitter" className={labelCls}>
              Twitter
            </label>
            <input
              id="s-twitter"
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              className={inputCls + " mt-2"}
            />
          </div>
          <div>
            <label htmlFor="s-website" className={labelCls}>
              Site web
            </label>
            <input
              id="s-website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className={inputCls + " mt-2"}
            />
          </div>
          <div>
            <label htmlFor="s-cal" className={labelCls}>
              Nom d'utilisateur Cal.com
            </label>
            <input
              id="s-cal"
              value={form.calUsername}
              onChange={(e) => setForm({ ...form, calUsername: e.target.value })}
              className={inputCls + " mt-2"}
              placeholder="ex : lea-martin"
            />
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
            <button
              type="button"
              onClick={copy}
              aria-label="Copier le lien du profil"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-on-surface hover:border-primary hover:text-primary"
            >
              {copied ? (
                <Check aria-hidden="true" size={18} />
              ) : (
                <Copy aria-hidden="true" size={18} />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant/70">
            Le slug est en lecture seule pour cette version.{" "}
            <Link to={`/${designer.slug}`} className="text-primary hover:underline">
              Voir le profil public
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {saved && <p className="text-sm text-[#34D399]">Modifications enregistrées.</p>}
          <button
            type="submit"
            className="ml-auto rounded-full bg-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </>
  );
}

/* ---------- Shared ---------- */

function TabHeader({
  eyebrow,
  title,
  emphasis,
  subtitle,
  cta,
}: {
  eyebrow: string;
  title: string;
  emphasis: string;
  subtitle: string;
  cta?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-medium text-on-surface md:text-5xl">
          {title}
          <span className="font-display-accent italic text-primary">{emphasis}</span>.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-on-surface-variant">{subtitle}</p>
      </div>
      {cta}
    </header>
  );
}
