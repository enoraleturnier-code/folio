// TODO: add Supabase session guard at step 2 — redirect to /login if no active session
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { designer } from "@/data/designer";
import { projects as seedProjects } from "@/data/projects";
import type { Project } from "@/data/types";

const searchSchema = z.object({
  tab: z.enum(["projets", "parametres"]).catch("projets").default("projets"),
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setTab = (t: TabKey) => navigate({ search: { tab: t } });

  return (
    <div className="relative min-h-screen bg-background">
      <Header role="admin" />
      <div className="flex pt-20">
        <AdminSidebar
          tab={tab}
          setTab={setTab}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 px-6 pb-16 pt-10 md:px-12">
          <div className="mx-auto max-w-6xl">
            {tab === "projets" && <ProjetsTab />}
            {tab === "parametres" && <ParametresTab />}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

/* ---------- Sidebar ---------- */

function AdminSidebar({
  tab,
  setTab,
  open,
  onToggle,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const items: { key: TabKey; icon: string; label: string }[] = [
    { key: "projets", icon: "folder_special", label: "Mon catalogue projets" },
    { key: "parametres", icon: "settings", label: "Paramètres" },
  ];
  return (
    <aside
      className={
        "sticky top-20 hidden h-[calc(100vh-5rem)] shrink-0 border-r border-white/5 transition-[width] duration-300 md:block " +
        (open ? "w-64" : "w-24")
      }
    >
      <div className="flex flex-col items-stretch gap-2 py-8">
        <div className={"mb-4 flex " + (open ? "justify-end pr-4" : "justify-center")}>
          <button
            type="button"
            onClick={onToggle}
            aria-label={open ? "Réduire la barre de navigation" : "Étendre la barre de navigation"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-on-surface-variant/65 transition-all hover:bg-white/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
              {open ? "chevron_left" : "chevron_right"}
            </span>
          </button>
        </div>
        <nav className={"flex flex-col " + (open ? "gap-2 px-3" : "items-center gap-4")}>
          {items.map((it) => {
            const active = tab === it.key;
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => setTab(it.key)}
                aria-label={it.label}
                aria-current={active ? "page" : undefined}
                className={
                  "flex items-center rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
                  (open ? "w-full gap-3 px-3 py-3 text-sm " : "h-12 w-12 justify-center ") +
                  (active
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant/65 hover:bg-white/5 hover:text-on-surface")
                }
              >
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[24px]"
                  style={active ? { fontVariationSettings: '"FILL" 1' } : undefined}
                >
                  {it.icon}
                </span>
                {open && <span className="truncate font-medium">{it.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
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
    setItems((xs) =>
      xs.map((x) => (x.id === id ? { ...x, status: "deleted", published: false } : x)),
    );
  const restore = (id: string) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "draft" } : x)));
  const togglePublish = (id: string) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, published: !x.published } : x)));

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <h1 className="text-[44px] font-bold tracking-tight text-on-surface">Mon catalogue</h1>
          <span className="font-display-accent text-[44px] italic text-primary">Projets</span>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-background shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
            add
          </span>
          Créer un nouveau projet
        </button>
      </header>

      <ul className="mt-10 space-y-6">
        {items.map((p, i) => {
          const deleted = p.status === "deleted";
          const isFirst = i === 0 && !deleted;
          return (
            <li
              key={p.id}
              className={
                "flex items-center justify-between rounded-2xl border bg-surface-container-low p-6 backdrop-blur-md " +
                (isFirst ? "border-primary/30" : "border-white/5")
              }
            >
              <div className="flex items-center gap-8">
                <span
                  className={
                    "text-3xl font-medium " +
                    (isFirst ? "text-primary" : "text-on-surface-variant/90")
                  }
                >
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <div>
                  <h3
                    className={
                      "text-xl font-bold text-on-surface " + (deleted ? "opacity-60" : "")
                    }
                  >
                    {p.title}
                  </h3>
                  <p className="mt-1 text-[10px] tracking-widest text-on-surface-variant">
                    {deleted ? "Supprimé il y a 1 semaine" : "Dernière mise à jour : il y a 2 jours"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <StatusPill status={deleted ? "deleted" : p.status} />
                <div className="flex items-center gap-4">
                  {deleted ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => restore(p.id)}
                        aria-label={`Restaurer le projet ${p.title}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant transition-all hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                          settings_backup_restore
                        </span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.published}
                        aria-label={p.published ? "Dépublier le projet" : "Publier le projet"}
                        onClick={() => togglePublish(p.id)}
                        className={
                          "relative h-5 w-9 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
                          (p.published ? "bg-primary" : "bg-white/10")
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={
                            "absolute top-[3px] h-3.5 w-3.5 rounded-full transition-all " +
                            (p.published
                              ? "left-[19px] bg-background"
                              : "left-[3px] bg-on-surface-variant")
                          }
                        />
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          aria-label={`Éditer le projet ${p.title}`}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant transition-all hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(p.id)}
                          aria-label={`Supprimer le projet ${p.title}`}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface-variant transition-all hover:bg-white/10 hover:text-error focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                            delete_sweep
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
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
          <div className="relative z-10 max-w-md rounded-2xl border border-white/10 bg-surface-container-low p-6">
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
                className="rounded-full border border-error/30 bg-error/10 px-6 py-2.5 text-sm font-bold text-error"
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

/* ---------- Status Pill ---------- */

function StatusPill({ status }: { status: Project["status"] }) {
  if (status === "public") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-4 py-1.5">
        <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-primary">
          check
        </span>
        <span className="text-[10px] font-bold tracking-widest text-primary">Public</span>
      </div>
    );
  }
  if (status === "confidential") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-secondary/80 px-4 py-1.5">
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[12px] text-on-surface"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          lock
        </span>
        <span className="text-[10px] font-bold tracking-widest text-on-surface">Confidentiel</span>
      </div>
    );
  }
  if (status === "deleted") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-error/30 bg-error/10 px-4 py-1.5 text-error">
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[12px]"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          delete
        </span>
        <span className="text-[10px] font-bold tracking-widest">Supprimé</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/20" />
      <span className="text-[10px] font-bold tracking-widest text-on-surface-variant">
        Brouillon
      </span>
    </div>
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
      <header className="flex items-baseline gap-4">
        <h1 className="text-[44px] font-bold tracking-tight text-on-surface">Vos</h1>
        <span className="font-display-accent text-[44px] italic text-primary">paramètres</span>
      </header>
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
          {saved && <p className="text-sm text-[#34D399]">Modifications enregistrées.</p>}
          <button
            type="submit"
            className="ml-auto rounded-full bg-primary px-6 py-3 text-sm font-bold text-background hover:opacity-90"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </>
  );
}
