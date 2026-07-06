// TODO: add Supabase session guard at step 2 — redirect to /login if no active session
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import { designer } from "@/data/designer";
import { contactMessages as seedContacts } from "@/data/contacts";
import { projects as seedProjects } from "@/data/projects";
import { accessRequests as seedRequests } from "@/data/requests";
import type {
  ContactMessage,
  ContactStatus,
  Project,
  AccessRequest,
  RequestStatus,
} from "@/data/types";

const searchSchema = z.object({
  tab: z
    .enum(["projets", "demandes", "contacts", "parametres"])
    .catch("projets")
    .default("projets"),
});

type TabKey = z.infer<typeof searchSchema>["tab"];

export const Route = createFileRoute("/admin")({
  validateSearch: searchSchema,
  component: AdminPage,
});

function AdminPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab: TabKey = search.tab;
  const [collapsed, setCollapsed] = useState(false);

  const setTab = (t: TabKey) => navigate({ search: { tab: t } });

  const pendingCount = useMemo(
    () => seedRequests.filter((r) => r.status === "pending").length,
    [],
  );

  return (
    <div className="relative min-h-screen bg-background">
      <Header role="admin" />
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
          (collapsed ? "ml-16 md:ml-20" : "ml-20 md:ml-24")
        }
      >
        <div className="mx-auto max-w-6xl px-6 pt-10 md:px-10">
          {tab === "projets" && <ProjetsTab />}
          {tab === "demandes" && <DemandesTab />}
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
    icon: string;
    label: string;
    badge?: number;
  }[] = [
    { key: "projets", icon: "folder", label: "Projets" },
    {
      key: "demandes",
      icon: "vpn_key",
      label: "Accès et Clés",
      badge: pendingCount,
    },
    { key: "contacts", icon: "mail", label: "Messages" },
    { key: "parametres", icon: "settings", label: "Paramètres système" },
  ];
  return (
    <aside
      className={
        "fixed left-0 top-0 z-[70] flex h-screen flex-col items-center border-r border-white/5 bg-background py-10 transition-[width] " +
        (collapsed ? "w-16 md:w-20" : "w-20 md:w-24")
      }
    >
      <Link
        to="/admin"
        className="text-2xl font-black tracking-tighter text-primary"
        aria-label="Folio+ — Accéder au dashboard"
      >
        F<span className="text-on-surface">+</span>
      </Link>

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Agrandir la barre de navigation" : "Réduire la barre de navigation"}
        className="mt-8 flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-on-surface-variant/65 transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base">
          {collapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>

      <div className="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
        {designer.fullName
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")}
      </div>

      <nav className="mt-8 flex flex-col items-center gap-3">
        <Link
          to="/admin"
          aria-label="Dashboard"
          className="flex h-12 w-12 items-center justify-center rounded-xl text-on-surface-variant/65 transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            dashboard
          </span>
        </Link>
        {items.map((it) => {
          const active = tab === it.key;
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
                "relative flex h-12 w-12 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
                (active
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant/65 hover:text-on-surface")
              }
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                {it.icon}
              </span>
              {it.badge && it.badge > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-on-surface"
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


/* ---------- Projets Tab ---------- */

function ProjetsTab() {
  const [items, setItems] = useState<Project[]>(seedProjects);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p);
    setDrawerOpen(true);
  };
  const save = (p: Project) => {
    setItems((xs) => {
      const idx = xs.findIndex((x) => x.id === p.id);
      if (idx === -1) return [...xs, p];
      const next = [...xs];
      next[idx] = p;
      return next;
    });
    setDrawerOpen(false);
  };
  const softDelete = (id: string) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "deleted", published: false } : x)));
  const restore = (id: string) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "draft" } : x)));
  const togglePublish = (id: string) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, published: !x.published } : x)));

  return (
    <>
      <header className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
        <h1 className="text-4xl font-bold text-on-surface md:text-[44px]">
          Mon catalogue{" "}
          <span className="font-display-accent italic text-primary">Projets</span>
        </h1>
        <button
          type="button"
          onClick={openNew}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-background shadow-lg shadow-primary/20 transition-transform hover:scale-105"
        >
          + Créer un nouveau projet
        </button>
      </header>

      <ul className="mt-10 space-y-6">
        {items.map((p, i) => {
          const deleted = p.status === "deleted";
          const num = String(i + 1).padStart(2, "0");
          const statusKind = deleted
            ? "deleted"
            : p.status === "public"
              ? "public"
              : p.status === "confidential"
                ? "confidential"
                : "draft";
          const rowBorder = p.published
            ? "border-primary/30"
            : "border-white/5";
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
                  (statusKind === "public"
                    ? "text-primary"
                    : "text-on-surface-variant opacity-90")
                }
              >
                {num}.
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  className={
                    "truncate text-xl font-bold text-on-surface " +
                    (deleted ? "opacity-60" : "")
                  }
                >
                  {p.title}
                </h3>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                  {deleted ? "Supprimé il y a 1 semaine" : p.period}
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
                    aria-label={`Restaurer le projet ${p.title}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-primary"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-base">
                      restore_from_trash
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p.published}
                      aria-label={p.published ? "Dépublier le projet" : "Publier le projet"}
                      onClick={() => togglePublish(p.id)}
                      className={
                        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition-colors " +
                        (p.published
                          ? "border-primary/40 bg-primary/30"
                          : "border-white/15 bg-white/5")
                      }
                    >
                      <span
                        aria-hidden="true"
                        className={
                          "block h-5 w-5 rounded-full shadow-sm transition-transform " +
                          (p.published
                            ? "translate-x-5 bg-primary"
                            : "translate-x-0 bg-on-surface-variant/60")
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      aria-label={`Éditer ${p.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-primary"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(p.id)}
                      aria-label={`Supprimer ${p.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant hover:text-error"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">
                        delete
                      </span>
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>


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
              Le projet passera en statut « Supprimé ». Vous pourrez le restaurer plus tard.
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
                  softDelete(confirmDelete);
                  setConfirmDelete(null);
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

function DemandesTab() {
  const [items, setItems] = useState<AccessRequest[]>(() =>
    [...seedRequests].sort((a, b) => (a.date < b.date ? 1 : -1)),
  );
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const update = (id: string, patch: Partial<AccessRequest>) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const approve = (id: string) => update(id, { status: "approved" as RequestStatus });
  const reject = (id: string) => {
    if (!reason.trim()) return;
    update(id, { status: "rejected" as RequestStatus, rejectionReason: reason.trim() });
    setRejecting(null);
    setReason("");
  };

  return (
    <>
      <TabHeader
        eyebrow="02 — Accès"
        title="Demandes d'"
        emphasis="accès"
        subtitle="Validez ou refusez l'accès aux projets confidentiels — chaque refus doit être motivé."
      />
      <div className="mt-10 space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface-container-low p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-base font-medium text-on-surface">{r.fullName}</p>
                <p className="text-sm text-on-surface-variant">
                  {r.company} · <span className="text-primary">{r.email}</span>
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  <span className="text-on-surface">Projets :</span>{" "}
                  {r.projectTitles.join(", ")}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant/70">
                  {new Date(r.date).toLocaleDateString("fr-FR", {
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
                        disabled={!reason.trim()}
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
                      className="rounded-full border border-[#F87171]/30 px-5 py-2 text-sm font-medium text-[#F87171] hover:bg-[#F87171]/10"
                    >
                      Refuser
                    </button>
                    <button
                      type="button"
                      onClick={() => approve(r.id)}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary hover:opacity-90"
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
      <div className="mt-10 space-y-3">
        {items.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface-container-low p-5 md:flex-row md:items-start"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-base font-medium text-on-surface">{m.fullName}</p>
                <span className="text-sm text-on-surface-variant">{m.email}</span>
              </div>
              <p
                className="mt-2 text-sm text-on-surface-variant"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                {m.message}
              </p>
              <p className="mt-2 text-xs text-on-surface-variant/70">
                {new Date(m.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge kind={m.status} />
              <button
                type="button"
                onClick={() => cycle(m.id)}
                aria-label="Changer le statut du message"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-on-surface hover:border-primary hover:text-primary"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  sync
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
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
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://folio.plus";
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
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-2xl text-on-surface-variant"
              >
                cloud_upload
              </span>
              <p className="text-sm text-on-surface-variant">
                Glissez-déposez une image ou{" "}
                <span className="text-primary">parcourir</span>
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
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                {copied ? "check" : "content_copy"}
              </span>
            </button>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant/70">
            Le slug est en lecture seule pour cette version.{" "}
            <Link to="/$slug" params={{ slug: designer.slug }} className="text-primary hover:underline">
              Voir le profil public
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {saved && (
            <p className="text-sm text-[#34D399]">Modifications enregistrées.</p>
          )}
          <button
            type="submit"
            className="ml-auto rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:opacity-90"
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
