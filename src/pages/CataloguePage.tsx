import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router-dom";

import { AccessRequestModal } from "@/components/AccessRequestModal";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FilterBar, type FilterState } from "@/components/FilterBar";
import { ProjectCard, type AccessState } from "@/components/ProjectCard";
import { getMyAccessRequests, type MyAccessRequest } from "@/data/accessRequests";
import { designer } from "@/data/designer";
import { getProjects } from "@/data/projects";
import { useAuth } from "@/hooks/useAuth";
import type { Project } from "@/types/project";

export async function catalogueLoader({ params }: LoaderFunctionArgs) {
  if (params.slug !== designer.slug) throw new Response("Not Found", { status: 404 });
  const projects = await getProjects();
  return { designer, projects };
}

function uniq(xs: string[]) {
  return Array.from(new Set(xs)).sort();
}

export function CataloguePage() {
  const { designer, projects } = useLoaderData() as Awaited<ReturnType<typeof catalogueLoader>>;
  const { role, session } = useAuth();
  const [searchParams] = useSearchParams();
  const notifProjectId = searchParams.get("notif");
  // Un validated_visitor/admin a accès à tous les projets confidentiels (règle
  // RLS projects_select_unified) — pas de suivi par demande individuelle.
  const isEntitled = role === "validated_visitor" || role === "admin";
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [myRequests, setMyRequests] = useState<MyAccessRequest[]>([]);

  // Ne dépend d'aucun état React capturé en closure (ex. `session`) : un onSuccess
  // appelé depuis AccessRequestModal peut provenir d'un rendu antérieur à une
  // inscription anonyme réussie, où `session` valait encore null au moment où la
  // closure a été créée. getMyAccessRequests() interroge le client Supabase global
  // (toujours à jour), donc cette fonction reste correcte quel que soit l'âge de
  // la closure qui la retient.
  const refreshMyRequests = useCallback(() => {
    getMyAccessRequests()
      .then((rows) => setMyRequests(rows))
      .catch(() => setMyRequests([]));
  }, []);

  useEffect(() => {
    refreshMyRequests();
  }, [session, refreshMyRequests]);

  const requestByProject = useMemo(() => {
    const map = new Map<string, MyAccessRequest>();
    for (const r of myRequests) map.set(r.project_id, r);
    return map;
  }, [myRequests]);

  /** Statut d'accès du visiteur courant pour un projet confidentiel donné. */
  function resolveAccess(p: Project): { accessState: AccessState; rejectionReason?: string | null } {
    if (isEntitled) return { accessState: "granted" };
    const req = requestByProject.get(p.id);
    if (!req) return { accessState: "none" };
    if (req.status === "approved") return { accessState: "granted" };
    if (req.status === "pending") return { accessState: "pending" };
    return { accessState: "refused", rejectionReason: req.rejection_reason };
  }
  const [filters, setFilters] = useState<FilterState>({
    designType: "",
    sector: "",
    tools: "",
    keywords: "",
  });

  const list = projects.filter((p) => p.status !== "draft" && !p.deleted_at);

  const options = useMemo(
    () => ({
      designType: uniq(list.flatMap((p) => p.tags.types)),
      sector: uniq(
        list.map((p) => p.secteur_activite).filter((s): s is NonNullable<typeof s> => Boolean(s)),
      ),
      tools: uniq(list.flatMap((p) => p.tags.tools)),
      keywords: uniq(list.flatMap((p) => p.tags.keywords)),
    }),
    [list],
  );

  const filtered = list
    .filter((p) => {
      if (filters.designType && !p.tags.types.includes(filters.designType)) return false;
      if (filters.sector && p.secteur_activite !== filters.sector) return false;
      if (filters.tools && !p.tags.tools.includes(filters.tools)) return false;
      if (filters.keywords && !p.tags.keywords.includes(filters.keywords)) return false;
      return true;
    })
    // Venant d'une notification de résolution de demande d'accès : le projet concerné
    // remonte en tête de liste (tri, pas de scroll vers sa position).
    .sort((a, b) => {
      if (!notifProjectId) return 0;
      if (a.id === notifProjectId) return -1;
      if (b.id === notifProjectId) return 1;
      return 0;
    });

  const openRequest = (p: Project) => {
    setModalProject(p);
    setModalOpen(true);
  };

  return (
    <>
      <AuroraBackground variant="catalogue" />
      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-16">
        <header className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
              Projets
            </p>
            <h1 className="text-5xl font-medium text-on-surface md:text-6xl">
              {designer.fullName}
              <br />
              <span className="font-display-accent text-5xl italic font-normal text-primary md:text-6xl">
                Catalogue de projets
              </span>
            </h1>
          </div>
          <Link
            to={`/${designer.slug}#contact`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
          >
            Contacter
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </header>

        <FilterBar options={options} value={filters} onChange={setFilters} />

        <div className="mt-10">
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            {filtered.length} projet{filtered.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const { accessState, rejectionReason } = resolveAccess(p);
              return (
                <ProjectCard
                  key={p.id}
                  project={p}
                  accessState={accessState}
                  rejectionReason={rejectionReason}
                  onRequestAccess={openRequest}
                  isAdmin={role === "admin"}
                />
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-white/5 bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
              Aucun projet ne correspond à ce filtre.
            </p>
          )}
        </div>
      </main>
      <AccessRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProject={modalProject}
        onSuccess={refreshMyRequests}
        excludeProjectIds={myRequests.map((r) => r.project_id)}
      />
    </>
  );
}
