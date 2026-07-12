import { KeyRound, Loader2, Lock, LockOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { designer } from "@/data/designer";
import { formatSecteur } from "@/lib/secteurLabels";
import { SENSITIVITY_LABELS } from "@/lib/sensitivityLabels";
import type { Project } from "@/types/project";
import { Alert } from "./Alert";
import { StatusBadge } from "./StatusBadge";
import { TagBadge } from "./TagBadge";

export type AccessState = "none" | "pending" | "granted" | "refused";

interface ProjectCardProps {
  project: Project;
  accessState?: AccessState;
  /** access_requests.rejection_reason — affiché dans l'alerte quand accessState==="refused". */
  rejectionReason?: string | null;
  /** Ancre vers la section contact du profil designer, pour le lien "Contacter l'administrateur ?". */
  contactHref?: string;
  onRequestAccess?: (project: Project) => void;
  /** Admin (propriétaire du portfolio) : affiche le niveau de sensibilité dans le badge confidentiel. */
  isAdmin?: boolean;
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

export function ProjectCard({
  project,
  accessState = "none",
  rejectionReason,
  contactHref,
  onRequestAccess,
  isAdmin = false,
}: ProjectCardProps) {
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

  // Comportement d'interaction par état (F-12) : "link"/"modal" rendent toute
  // la carte cliquable (un seul point d'entrée — pas de <button> imbriqué dans
  // un élément interactif parent). "pending" est totalement inerte. "refused"
  // laisse la carte inerte mais garde un lien interne cliquable indépendant
  // (Contacter l'administrateur), dont le hover suit celui de la carte entière.
  const mode: "link" | "modal" | "pending" | "refused" = !isTeaser
    ? "link"
    : accessState === "pending"
      ? "pending"
      : accessState === "refused"
        ? "refused"
        : "modal";

  const detailHref = `/${designer.slug}/projects/${project.id}`;
  const resolvedContactHref = contactHref ?? `/${designer.slug}#contact`;

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRequestAccess?.(project);
    }
  };

  const isInteractive = mode === "link" || mode === "modal";
  const cardClasses =
    "glass-card group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] " +
    (isInteractive
      ? "hover:-translate-y-1 hover:border-white/15 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      : "cursor-default");

  const content = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.thumbnail_url ?? ""}
          alt={project.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className={
            "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 " +
            (isTeaser ? "blur-2xl scale-110" : "")
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        {isConfidential && (
          <div className="absolute right-4 top-4">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-secondary/80 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
                <LockOpen aria-hidden="true" size={14} />
                Confidentiel • {SENSITIVITY_LABELS[project.sensitivity_level]}
              </span>
            ) : accessState === "granted" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-secondary/80 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
                <LockOpen aria-hidden="true" size={14} />
                Confidentiel · Accès validé
              </span>
            ) : (
              <StatusBadge kind="confidential" />
            )}
          </div>
        )}
        {isTeaser && (
          <div className="absolute inset-0 flex items-center justify-center">
            {mode === "pending" ? (
              <Loader2 aria-hidden="true" className="animate-spin text-[#A78BFA]" size={45} />
            ) : (
              <Lock aria-hidden="true" className="text-[#A78BFA]" size={45} />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={
              "text-xl font-medium text-on-surface" +
              (isInteractive ? " transition-colors group-hover:text-primary" : "")
            }
          >
            {project.title}
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

        {mode === "modal" && (
          <div className="mt-auto pt-2">
            <span
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-container py-3
                text-[11px] font-bold tracking-[0.1em] text-on-primary-container transition-all duration-300
                group-hover:scale-[1.02] group-hover:brightness-110 group-focus-visible:scale-[1.02]
                group-focus-visible:brightness-110 group-active:scale-95"
            >
              <KeyRound aria-hidden="true" size={20} strokeWidth={1.5} />
              Demander l'accès
            </span>
          </div>
        )}

        {mode === "pending" && (
          <div className="mt-auto pt-2">
            <Alert
              type="info"
              title="Demande en cours de traitement"
              description="Vous recevrez une réponse dès que votre demande sera traitée."
            />
          </div>
        )}

        {mode === "refused" && (
          <div className="mt-auto pt-2">
            <Alert
              type="warning"
              title="Demande refusée"
              description={
                <>
                  {rejectionReason}
                  {rejectionReason && " "}
                  <Link
                    to={resolvedContactHref}
                    className="text-on-surface-variant no-underline underline-offset-2 transition-colors
                      group-hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    Contacter l'administrateur ?
                  </Link>
                </>
              }
            />
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.tags.types.slice(0, 1).map((l) => (
            <TagBadge key={l} category="designType" label={l} />
          ))}
          {project.secteur_activite && (
            <TagBadge category="sector" label={formatSecteur(project.secteur_activite)} />
          )}
          {project.tags.tools.slice(0, 1).map((l) => (
            <TagBadge key={l} category="tools" label={l} />
          ))}
          {project.tags.keywords.slice(0, 1).map((l) => (
            <TagBadge key={l} category="keywords" label={l} />
          ))}
        </div>
      </div>
    </>
  );

  if (mode === "link") {
    return (
      <Link to={detailHref} className={cardClasses}>
        {content}
      </Link>
    );
  }

  if (mode === "modal") {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Demander l'accès au projet ${project.title}`}
        onClick={() => onRequestAccess?.(project)}
        onKeyDown={handleCardKeyDown}
        className={cardClasses}
      >
        {content}
      </div>
    );
  }

  return <article className={cardClasses}>{content}</article>;
}
