import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AccessRequestModal } from "@/components/AccessRequestModal";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FilterBar, type FilterState } from "@/components/FilterBar";
import { ProjectCard } from "@/components/ProjectCard";
import { designer } from "@/data/designer";
import { getProjects } from "@/data/projects";
import type { Project } from "@/types/project";

export const Route = createFileRoute("/$slug/projects/")({
  loader: async ({ params }) => {
    if (params.slug !== designer.slug) throw notFound();
    const projects = await getProjects();
    return { designer, projects };
  },
  component: CataloguePage,
});

function uniq(xs: string[]) {
  return Array.from(new Set(xs)).sort();
}

function CataloguePage() {
  const { designer, projects } = Route.useLoaderData();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
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
        list
          .map((p) => p.secteur_activite)
          .filter((s): s is NonNullable<typeof s> => Boolean(s)),
      ),
      tools: uniq(list.flatMap((p) => p.tags.tools)),
      keywords: uniq(list.flatMap((p) => p.tags.keywords)),
    }),
    [list],
  );

  const filtered = list.filter((p) => {
    if (filters.designType && !p.tags.types.includes(filters.designType)) return false;
    if (filters.sector && p.secteur_activite !== filters.sector) return false;
    if (filters.tools && !p.tags.tools.includes(filters.tools)) return false;
    if (filters.keywords && !p.tags.keywords.includes(filters.keywords)) return false;
    return true;
  });

  const openRequest = (p: Project) => {
    setModalProject(p);
    setModalOpen(true);
  };

  const publicCount = list.filter((p) => p.status === "public").length;
  const confidentialCount = list.filter((p) => p.status === "confidential").length;

  return (
    <>
      <AuroraBackground />
      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-16">
        <header className="mb-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Catalogue
          </p>
          <h1 className="text-5xl font-medium text-on-surface md:text-7xl">
            La galerie{" "}
            <span className="font-display-accent italic text-primary">complète</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-on-surface-variant">
            {list.length} projet{list.length > 1 ? "s" : ""} — {publicCount} public
            {publicCount > 1 ? "s" : ""}, {confidentialCount} confidentiel
            {confidentialCount > 1 ? "s" : ""}. Filtrez par type, secteur, outil ou mot-clé.
          </p>
        </header>

        <FilterBar options={options} value={filters} onChange={setFilters} />

        <div className="mt-10">
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            {filtered.length} projet{filtered.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} onRequestAccess={openRequest} />
            ))}
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
      />
    </>
  );
}
