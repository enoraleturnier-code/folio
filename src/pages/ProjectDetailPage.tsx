import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

import { IconTooltip } from "@/components/IconTooltip";
import { MarkdownContent } from "@/components/MarkdownContent";
import { StatusBadge } from "@/components/StatusBadge";
import { TagBadge } from "@/components/TagBadge";
import { designer } from "@/data/designer";
import { getProjectById } from "@/data/projects";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
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

/** Numéro + filet — reprend exactement le style "01"/"02" de ProfilePage.tsx (hero + contact),
 * "03" ajouté ici en indigo (tag-keywords) pour le 3e bloc narratif. */
const BLOCK_NUMBER_CLASSES = [
  { number: "text-primary/90", rule: "bg-on-primary/20" },
  { number: "text-secondary/90", rule: "bg-secondary/20" },
  { number: "text-tag-keywords/90", rule: "bg-tag-keywords/20" },
] as const;

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
  useDocumentTitle(deleted ? title : project.title);

  if (deleted) {
    return (
      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-5 pb-24 pt-40 text-center md:px-16">
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

  const blocks = [
    { label: "Problème", content: project.ai_structured_desc?.probleme },
    { label: "Décisions", content: project.ai_structured_desc?.decisions },
    { label: "Résultat", content: project.ai_structured_desc?.resultat },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-28 md:px-16">
      <section className="relative aspect-[3/1] overflow-hidden rounded-2xl max-md:-mx-5 max-md:-mt-28 max-md:aspect-[4/3] max-md:rounded-none">
        <img
          src={project.thumbnail_url ?? ""}
          alt={project.title}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute left-6 top-6 z-10 max-md:top-24">
          <IconTooltip label="Retour à la liste">
            <Link
              to={`/${designer.slug}/projects`}
              aria-label="Retour à la liste"
              className="glass-card flex h-10 w-10 items-center justify-center rounded-full text-on-surface hover:border-primary hover:text-primary max-md:h-11 max-md:w-11"
            >
              <ArrowLeft aria-hidden="true" size={18} />
            </Link>
          </IconTooltip>
        </div>
        {project.status === "confidential" && (
          <div className="absolute right-6 top-6 z-10 max-md:top-24">
            <StatusBadge kind="confidential" size="md" />
          </div>
        )}
      </section>

      <div className="mt-16 grid gap-12 md:grid-cols-12">
        <div className="space-y-14 md:col-span-8">
          <header className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Détails du projet
            </p>
            <h1 className="text-5xl font-medium text-on-surface md:text-6xl">{project.title}</h1>
            {project.client_name && (
              <p className="font-display-accent text-5xl italic text-primary md:text-6xl">
                {project.client_name}
              </p>
            )}
            {project.short_desc && (
              <p className="max-w-2xl text-lg text-on-surface-variant">{project.short_desc}</p>
            )}
          </header>

          {project.long_desc && (
            <section>
              <div className="flex items-end gap-8">
                <div aria-hidden="true" className="hidden shrink-0 flex-col md:flex">
                  <span className="text-6xl font-medium opacity-0">01</span>
                  <div className="mt-2 h-px w-8" />
                </div>
                <h2 className="text-4xl font-medium text-on-surface">Vue d'ensemble du projet</h2>
              </div>
              <div className="mt-4 md:pl-24">
                <MarkdownContent content={project.long_desc} />
              </div>
            </section>
          )}

          <div className="space-y-16">
            {blocks.map((block, i) => (
              <div key={block.label} className="space-y-4">
                <div className="flex items-end gap-8">
                  <div className="hidden shrink-0 flex-col md:flex">
                    <span className={"text-6xl font-medium " + BLOCK_NUMBER_CLASSES[i].number}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={"mt-2 h-px w-8 " + BLOCK_NUMBER_CLASSES[i].rule} />
                  </div>
                  <h2 className="text-4xl font-medium text-on-surface">{block.label}</h2>
                </div>
                <div className="md:pl-24">
                  <MarkdownContent content={block.content} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="md:col-span-4">
          <div className="sticky top-28 space-y-8 rounded-2xl border border-white/5 bg-surface-container-low p-6">
            <div className="divide-y divide-white/5">
              <MetaRow label="Entreprise" value={project.company_name} />
              <MetaRow label="Client" value={project.client_name} />
              <MetaRow label="Rôle" value={project.role} />
              <MetaRow label="Équipe" value={project.team} />
              <MetaRow label="Période" value={formatPeriod(project.start_date, project.end_date)} />
            </div>
            <div className="space-y-6 border-t border-white/5 pt-8">
              {project.tags.types.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Type
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.tags.types.map((l) => (
                      <TagBadge key={l} category="designType" label={l} size="md" />
                    ))}
                  </div>
                </div>
              )}
              {project.secteur_activite && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Secteur
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <TagBadge
                      category="sector"
                      label={formatSecteur(project.secteur_activite)}
                      size="md"
                    />
                  </div>
                </div>
              )}
              {project.tags.tools.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Outils
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.tags.tools.map((l) => (
                      <TagBadge key={l} category="tools" label={l} size="md" />
                    ))}
                  </div>
                </div>
              )}
              {project.tags.keywords.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Mots-clés
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.tags.keywords.map((l) => (
                      <TagBadge key={l} category="keywords" label={l} size="md" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function MetaRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-on-surface">{value}</p>
    </div>
  );
}
