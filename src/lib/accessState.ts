import type { AccessState } from "@/components/ProjectCard";
import type { MyAccessRequest } from "@/data/accessRequests";
import type { Project } from "@/types/project";

/**
 * Statut d'accès du visiteur courant pour un projet confidentiel donné (F-12).
 * Extrait de `CataloguePage.tsx` (seul appelant jusqu'ici) pour être réutilisé
 * par `ProfilePage.tsx` (bouton d'accès par expérience liée à un projet).
 */
export function resolveAccess(
  project: Project,
  isEntitled: boolean,
  requestByProject: Map<string, MyAccessRequest>,
): { accessState: AccessState; rejectionReason?: string | null } {
  if (isEntitled) return { accessState: "granted" };
  const req = requestByProject.get(project.id);
  if (!req) return { accessState: "none" };
  if (req.status === "approved") return { accessState: "granted" };
  if (req.status === "pending") return { accessState: "pending" };
  return { accessState: "refused", rejectionReason: req.rejection_reason };
}
