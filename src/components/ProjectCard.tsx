import { Link, useParams } from "@tanstack/react-router";

import { DEFAULT_DESIGNER_SLUG } from "@/hooks/useDesigner";
import type { Project } from "@/data/types";
import { StatusBadge } from "./StatusBadge";
import { TagBadge } from "./TagBadge";

type AccessState = "none" | "pending" | "granted" | "refused";

interface ProjectCardProps {
  project: Project;
  index: number;
  accessState?: AccessState;
  onRequestAccess?: (project: Project) => void;
}

export function ProjectCard({ project, index, accessState = "none", onRequestAccess }: ProjectCardProps) {
  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug ?? DEFAULT_DESIGNER_SLUG;
  const isConfidential = project.sensitivity === "confidentielle";
  const isTeaser = isConfidential && accessState !== "granted";

  return (
    <article className="glass-card group relative overflow-hidden rounded-2xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.cover}
          alt={project.title}
          loading="lazy"
          className={
            "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 " +
            (isTeaser ? "blur-2xl scale-110" : "")
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute left-4 top-4">
          <StatusBadge kind={project.sensitivity === "confidentielle" ? "confidential" : "public"} />
        </div>
        <div className="absolute right-4 top-4 text-xs font-medium tracking-[0.2em] text-on-surface/60">
          {String(index + 1).padStart(2, "0")}
        </div>
        {isTeaser && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-4xl text-[#A78BFA]">
              lock
            </span>
            <p className="text-sm font-medium text-on-surface">Projet confidentiel</p>
            {accessState === "pending" ? (
              <span className="rounded-full border border-[#FBB040]/30 bg-[#FBB040]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FBB040]">
                Demande en attente
              </span>
            ) : accessState === "refused" ? (
              <span className="rounded-full border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#F87171]">
                Accès refusé
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onRequestAccess?.(project)}
                className="mt-1 rounded-full bg-secondary px-6 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Demander l'accès
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 p-6">
        <h3 className="text-lg font-medium text-on-surface">
          <Link
            to="/$slug/projects/$id"
            params={{ slug, id: project.id }}
            className="hover:text-primary transition-colors"
          >
            {project.title}
          </Link>
        </h3>
        <p className="text-sm text-on-surface-variant">{project.subtitle}</p>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {project.tags.designType.slice(0, 1).map((l) => (
            <TagBadge key={l} category="designType" label={l} />
          ))}
          {project.tags.sector.slice(0, 1).map((l) => (
            <TagBadge key={l} category="sector" label={l} />
          ))}
          {project.tags.tools.slice(0, 1).map((l) => (
            <TagBadge key={l} category="tools" label={l} />
          ))}
        </div>
      </div>
    </article>
  );
}
