import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

import { MarkdownContent } from "@/components/MarkdownContent";
import { StatusBadge } from "@/components/StatusBadge";
import { TagBadge } from "@/components/TagBadge";
import { designer } from "@/data/designer";
import { getProjectById } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { formatSecteur } from "@/lib/secteurLabels";

type ProjectDetailLoaderData =
  | { deleted: false; title: null; project: NonNullable<Awaited<ReturnType<typeof getProjectById>>> }
  | { deleted: true; title: string; project: null };

function formatPeriod(start: string | null, end: string | null): string {
  const startYear = start ? new Date(start).getFullYear() : null;
  const endYear = end ? new Date(end).getFullYear() : null;
  if (startYear && endYear && startYear !== endYear) return `${startYear} — ${endYear}`;
  return String(startYear ?? endYear ?? "");
}

export async function projectDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<ProjectDetailLoaderData> {
  if (params.slug !== designer.slug) throw new Response("Not Found", { status: 404 });
  const project = await getProjectById(params.id!);
  if (project) return { deleted: false, title: null, project };

  // Distingue "jamais existe" (404 brute) de "existait puis a ete supprime"
  // (etat "Projet supprime" dedie) via un RPC SECURITY DEFINER controle --
  // la RLS normale n'expose jamais une ligne deleted_at IS NOT NULL a un
  // non-admin, donc impossible de faire cette distinction autrement.
  const { data, error } = await supabase.rpc("project_deletion_status", { p_id: params.id! });
  if (error) throw error;
  const deletedRow = data?.[0];
  if (deletedRow) return { deleted: true, title: deletedRow.title, project: null };

  throw new Response("Not Found", { status: 404 });
}

export function ProjectDetailPage() {
  const { deleted, title, project } = useLoaderData() as ProjectDetailLoaderData;

  if (deleted) {
    return (
      <main className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-5 pb-24 pt-40 text-center md:px-16">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
          <Trash2 aria-hidden="true" className="text-error" size={28} />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
          Projet supprimé
        </p>
        <h1 className="mt-3 text-3xl font-medium text-on-surface md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-md text-sm text-on-surface-variant">
          Ce projet a été retiré du catalogue et n'est plus consultable.
        </p>
        <Link
          to={`/${designer.slug}/projects`}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-5 py-2.5 text-sm font-medium text-on-surface hover:border-primary hover:text-primary"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Tous les projets
        </Link>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-28 md:px-16">
      <Link
        to={`/${designer.slug}/projects`}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-4 py-2 text-xs font-medium text-on-surface hover:border-primary hover:text-primary"
      >
        <ArrowLeft aria-hidden="true" size={18} />
        Tous les projets
      </Link>

      <section className="relative mt-8 aspect-[21/9] overflow-hidden rounded-2xl">
        <img
          src={project.thumbnail_url ?? ""}
          alt={project.title}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute right-6 top-6">
          <StatusBadge kind={project.status === "confidential" ? "confidential" : "public"} />
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            {project.company_name}
          </p>
          <h1 className="mt-3 text-4xl font-medium text-on-surface md:text-6xl">{project.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-on-surface-variant">{project.short_desc}</p>
        </div>
      </section>

      <div className="mt-16 grid gap-12 md:grid-cols-12">
        <div className="space-y-14 md:col-span-8">
          {project.long_desc && (
            <section>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                Le projet
              </p>
              <h2 className="text-3xl font-medium text-on-surface">
                Une vue <span className="font-display-accent italic text-primary">d'ensemble</span>.
              </h2>
              <div className="mt-4">
                <MarkdownContent content={project.long_desc} />
              </div>
            </section>
          )}
          <section>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#A78BFA]">
              01 — Problème
            </p>
            <h2 className="text-3xl font-medium text-on-surface">
              Un défi <span className="font-display-accent italic text-primary">clair</span>.
            </h2>
            <div className="mt-4">
              <MarkdownContent content={project.ai_structured_desc?.probleme} />
            </div>
          </section>
          <section>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary">
              02 — Décisions
            </p>
            <h2 className="text-3xl font-medium text-on-surface">
              Les choix{" "}
              <span className="font-display-accent italic text-primary">structurants</span>.
            </h2>
            <div className="mt-4">
              <MarkdownContent content={project.ai_structured_desc?.decisions} />
            </div>
          </section>
          <section>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#A78BFA]">
              03 — Résultat
            </p>
            <h2 className="text-3xl font-medium text-on-surface">
              L'impact <span className="font-display-accent italic text-primary">mesuré</span>.
            </h2>
            <div className="mt-4">
              <MarkdownContent content={project.ai_structured_desc?.resultat} />
            </div>
          </section>
        </div>

        <aside className="md:col-span-4">
          <div className="sticky top-28 space-y-5 rounded-2xl border border-white/5 bg-surface-container-low p-6">
            <MetaRow label="Entreprise" value={project.company_name} />
            <MetaRow label="Client" value={project.client_name} />
            <MetaRow label="Rôle" value={project.role} />
            <MetaRow label="Équipe" value={project.team} />
            <MetaRow label="Période" value={formatPeriod(project.start_date, project.end_date)} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Étiquettes
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.types.map((l) => (
                  <TagBadge key={"d" + l} category="designType" label={l} />
                ))}
                {project.secteur_activite && (
                  <TagBadge category="sector" label={formatSecteur(project.secteur_activite)} />
                )}
                {project.tags.tools.map((l) => (
                  <TagBadge key={"t" + l} category="tools" label={l} />
                ))}
                {project.tags.keywords.map((l) => (
                  <TagBadge key={"k" + l} category="keywords" label={l} />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function MetaRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-on-surface">{value}</p>
    </div>
  );
}
