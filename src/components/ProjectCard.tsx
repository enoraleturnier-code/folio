import { Link } from "react-router-dom";

import { designer } from "@/data/designer";
import type { Project } from "@/types/project";
import { StatusBadge } from "./StatusBadge";
import { TagBadge } from "./TagBadge";

type AccessState = "none" | "pending" | "granted" | "refused";

interface ProjectCardProps {
  project: Project;
  accessState?: AccessState;
  onRequestAccess?: (project: Project) => void;
}

/** "2024 — 4 mois" ; null si aucune date de début (rien à afficher). */
function formatYearDuration(start: string | null, end: string | null): string | null {
  if (!start) return null;
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const months = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
  );
  return `${startDate.getFullYear()} — ${months} mois`;
}

export function ProjectCard({ project, accessState = "none", onRequestAccess }: ProjectCardProps) {
  const isConfidential = project.status === "confidential";
  const isTeaser = isConfidential && accessState !== "granted";
  // Défense en profondeur : même si la vue renvoyait un jour ces champs pour
  // une ligne confidentielle non autorisée, on ne les affiche jamais côté
  // teaser — seule une entrée publique ou confidentielle "granted" les montre.
  // company_name reste visible même en teaser (cf. commentaire de la colonne
  // en base) ; la durée ne l'est pas (dates calculées).
  const showFullDetails = !isTeaser;
  const duration = showFullDetails
    ? formatYearDuration(project.start_date, project.end_date)
    : null;

  return (
    <article
      className="glass-card group relative flex flex-col overflow-hidden rounded-2xl transition-all
        duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-white/15
        hover:bg-surface-container-low"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.thumbnail_url ?? ""}
          alt={project.title}
          loading="lazy"
          className={
            "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 " +
            (isTeaser ? "blur-2xl scale-110" : "")
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        {isConfidential && (
          <div className="absolute right-4 top-4">
            <StatusBadge kind="confidential" />
          </div>
        )}
        {isTeaser && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              aria-hidden="true"
              className="material-symbols-outlined !text-8xl text-[#A78BFA]"
            >
              lock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-medium text-on-surface">
            <Link
              to={`/${designer.slug}/projects/${project.id}`}
              className="hover:text-primary transition-colors"
            >
              {project.title}
            </Link>
          </h3>
          {duration && (
            <span className="shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
              {duration}
            </span>
          )}
        </div>
        <p className="text-sm text-on-surface-variant">{project.short_desc}</p>
        {(project.company_name || project.role) && (
          <div className="space-y-2 border-t border-white/5 pt-3">
            {project.company_name && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Entreprise
                </span>
                <span className="text-xs text-on-surface">{project.company_name}</span>
              </div>
            )}
            {project.role && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Rôle
                </span>
                <span className="text-xs text-on-surface">{project.role}</span>
              </div>
            )}
          </div>
        )}

        {isTeaser && (
          <div className="mt-auto pt-2">
            {accessState === "pending" ? (
              <span className="block w-full rounded-full border border-[#FBB040]/30 bg-[#FBB040]/10 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#FBB040]">
                Demande en attente
              </span>
            ) : accessState === "refused" ? (
              <span className="block w-full rounded-full border border-[#F87171]/30 bg-[#F87171]/10 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#F87171]">
                Accès refusé
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onRequestAccess?.(project)}
                className="w-full rounded-full border border-primary py-3 text-[11px] font-bold tracking-[0.1em] text-primary
                  transition-all duration-300 hover:scale-[1.02] hover:bg-primary hover:text-on-primary
                  hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Demander l'accès
              </button>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.tags.types.slice(0, 1).map((l) => (
            <TagBadge key={l} category="designType" label={l} />
          ))}
          {project.secteur_activite && (
            <TagBadge category="sector" label={project.secteur_activite} />
          )}
          {project.tags.tools.slice(0, 1).map((l) => (
            <TagBadge key={l} category="tools" label={l} />
          ))}
        </div>
      </div>
    </article>
  );
}
