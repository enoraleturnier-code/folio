import {
  ArrowRight,
  AtSign,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  LockOpen,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { Link, useLoaderData, useLocation, type LoaderFunctionArgs } from "react-router-dom";

import { AccessRequestModal } from "@/components/AccessRequestModal";
import { Alert } from "@/components/Alert";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import { ContactForm } from "@/components/ContactForm";
import { IconTooltip } from "@/components/IconTooltip";
import type { AccessState } from "@/components/ProjectCard";
import { getMyAccessRequests, type MyAccessRequest } from "@/data/accessRequests";
import { designer, getDesignerProfile } from "@/data/designer";
import { getExperiences, type Experience } from "@/data/experiences";
import { getProjectsByIds } from "@/data/projects";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { resolveAccess } from "@/lib/accessState";
import { cn, prefersReducedMotion } from "@/lib/utils";
import type { Project } from "@/types/project";

export async function profileLoader({ params }: LoaderFunctionArgs) {
  // params.slug est absent sur la route "/" (index racine) -- seul un slug
  // présent mais différent du designer réel est une vraie 404.
  if (params.slug && params.slug !== designer.slug) {
    throw new Response("Not Found", { status: 404 });
  }
  const [profile, experiences] = await Promise.all([getDesignerProfile(), getExperiences()]);
  // Sous-ensemble ciblé (pas tout le catalogue, cf. `getProjectsByIds`) des
  // projets liés à au moins une expérience -- généralement une poignée de
  // lignes, souvent aucune.
  const projectIds = Array.from(
    new Set(experiences.map((e) => e.projectId).filter((id): id is string => Boolean(id))),
  );
  const linkedProjects = await getProjectsByIds(projectIds);
  return { designer: profile, experiences, linkedProjects };
}

/** Numéro + filet des sections numérotées de la page -- "Expériences" n'apparaît
 * que si au moins une expérience existe, auquel cas "Contact" redevient
 * automatiquement "02"/"03" sans intervention manuelle. */
const SECTION_NUMBER_CLASSES = {
  hero: { number: "text-primary/90", rule: "bg-on-primary/20" },
  experiences: { number: "text-secondary/90", rule: "bg-secondary/20" },
  contact: { number: "text-tag-keywords/90", rule: "bg-tag-keywords/20" },
} as const;

const formatExperienceDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(new Date(iso));

/** "Févr. 2022 - Janv. 2024" (mois abrégé, capitalisé via CSS `capitalize`,
 * année complète) ; "Aujourd'hui" si `end` est absente (poste actuel). Format
 * mobile (une ligne, `md:hidden`). */
function formatExperiencePeriod(start: string, end: string | null): string {
  return `${formatExperienceDate(start)} - ${end ? formatExperienceDate(end) : "Aujourd'hui"}`;
}

/** Bornes séparées ("Févr. 2022" / "Janv. 2024") pour l'affichage desktop sur
 * deux lignes (colonne date fixe, `md:block`) -- pas de tiret entre les deux,
 * le saut de ligne suffit à indiquer l'intervalle. */
function formatExperiencePeriodParts(start: string, end: string | null): [string, string] {
  return [formatExperienceDate(start), end ? formatExperienceDate(end) : "Aujourd'hui"];
}

/** Fond + arrondi + débord horizontal appliqués au wrapper de tout l'item
 * (en-tête + contenu déplié) -- et non au seul bouton d'en-tête -- pour que
 * le fond et les filets `divide-y` du parent restent alignés (même boîte,
 * même débord des deux côtés) et que le fond couvre aussi le contenu
 * déplié. Le débord (`-mx`) est calé sur le padding de la card
 * (`p-8 md:p-12`, cf. plus bas) : le fond de l'item va ainsi jusqu'au bord
 * réel de la card, sans marge résiduelle entre les deux (`px` compense à
 * l'identique, aucun déplacement du texte). Le survol ne s'applique qu'aux
 * items fermés. */
const ITEM_WRAPPER_BASE =
  "-mx-8 px-8 md:-mx-12 md:px-12 transition-colors duration-[var(--duration-fast)] ease-out";
function itemWrapperCls(open: boolean): string {
  return cn(ITEM_WRAPPER_BASE, open ? "bg-surface-container" : "hover:bg-surface-container-low");
}

const HEADER_BUTTON_CLASSES =
  "group flex w-full items-start gap-6 py-8 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:gap-10";

/** Colonne dates -- largeur fixe desktop, masquée en mobile (répliquée inline
 * au-dessus du rôle à la place, cf. `ExperienceAccordionItem`). */
const DATE_COLUMN_CLASSES =
  "hidden md:block w-[140px] shrink-0 pt-0.5 text-sm text-on-surface-variant";

interface ProjectActionProps {
  project: Project | undefined;
  accessResult: { accessState: AccessState; rejectionReason?: string | null } | null;
  onRequestAccess: (project: Project) => void;
}

/** Pied d'item : "Voir le projet" (public ou accès confidentiel déjà accordé,
 * bouton primary), "Accéder au projet confidentiel" (F-12, état "none" --
 * ouvre la modale de demande d'accès pré-sélectionnée sur CE projet, même
 * gabarit que "Voir le projet"), une alerte inerte pour "pending"/"refused",
 * ou rien si `project_id` est vide/introuvable. */
function ProjectAction({ project, accessResult, onRequestAccess }: ProjectActionProps) {
  if (!project) return null;

  const detailHref = `/${designer.slug}/projects/${project.id}`;
  const viewProjectLink = (
    <div className="flex justify-center">
      <Link
        to={detailHref}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-md:min-h-11 max-md:w-[70%]"
      >
        Détails du projet
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </div>
  );

  if (project.status !== "confidential") return viewProjectLink;
  if (!accessResult) return null;

  if (accessResult.accessState === "granted") return viewProjectLink;

  if (accessResult.accessState === "none") {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onRequestAccess(project)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-secondary px-5 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-md:min-h-11 max-md:w-full"
        >
          <LockOpen aria-hidden="true" size={16} />
          Accéder au projet confidentiel
        </button>
      </div>
    );
  }

  if (accessResult.accessState === "pending") {
    return (
      <Alert
        type="info"
        title="Demande en cours de traitement"
        description="Vous recevrez une réponse dès que votre demande sera traitée."
      />
    );
  }

  return (
    <Alert
      type="warning"
      title="Demande refusée"
      description={
        <>
          {accessResult.rejectionReason}{" "}
          <Link to={`/${designer.slug}#contact`} className="font-bold hover:underline">
            Contacter l'administrateur ?
          </Link>
        </>
      }
    />
  );
}

interface ExperienceAccordionItemProps {
  exp: Experience;
  isOpen: boolean;
  onToggle: () => void;
  project: Project | undefined;
  accessResult: { accessState: AccessState; rejectionReason?: string | null } | null;
  onRequestAccess: (project: Project) => void;
}

function ExperienceAccordionItem({
  exp,
  isOpen,
  onToggle,
  project,
  accessResult,
  onRequestAccess,
}: ExperienceAccordionItemProps) {
  const headerId = `exp-header-${exp.id}`;
  const panelId = `exp-panel-${exp.id}`;
  const period = formatExperiencePeriod(exp.startDate, exp.endDate);
  const [periodStart, periodEnd] = formatExperiencePeriodParts(exp.startDate, exp.endDate);

  return (
    <div className={itemWrapperCls(isOpen)}>
      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={HEADER_BUTTON_CLASSES}
      >
        <span className={cn(DATE_COLUMN_CLASSES, "capitalize leading-snug")} aria-hidden="true">
          <span className="block">{periodStart}</span>
          <span className="block">{periodEnd}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 block text-xs capitalize text-on-surface-variant md:hidden">
            {period}
          </span>
          <span className="block text-base md:text-lg">
            <span className="font-semibold text-on-surface">{exp.title}</span>
            <span className="text-on-surface-variant"> · </span>
            <span className="font-normal text-on-surface-variant">{exp.company}</span>
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-on-surface-variant">
            {exp.shortDesc}
          </span>
        </span>
        {isOpen ? (
          <ChevronUp
            aria-hidden="true"
            size={20}
            className="shrink-0 self-center text-on-surface-variant"
          />
        ) : (
          <ChevronDown
            aria-hidden="true"
            size={20}
            className="shrink-0 self-center text-on-surface-variant"
          />
        )}
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-[var(--duration-fast)] ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div id={panelId} role="region" aria-labelledby={headerId} className="space-y-4 pb-8">
            {exp.bullets.length > 0 && (
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-on-surface-variant">
                {exp.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
            {exp.impact && (
              <Alert type="success" icon={Zap} title="Impact" description={exp.impact} />
            )}
            <ProjectAction
              project={project}
              accessResult={accessResult}
              onRequestAccess={onRequestAccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { designer, experiences, linkedProjects } = useLoaderData() as Awaited<
    ReturnType<typeof profileLoader>
  >;
  useDocumentTitle(designer.fullName);
  const { hash } = useLocation();
  const { role, session } = useAuth();

  // Accordéon exclusif : ouvrir un item referme automatiquement celui déjà
  // ouvert. Aucun item déplié par défaut (revenu en arrière le 09/09 sur "la
  // première mission dépliée par défaut" du 08/09).
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAllExperiences, setShowAllExperiences] = useState(false);
  const [accessModalProject, setAccessModalProject] = useState<Project | null>(null);
  const [myRequests, setMyRequests] = useState<MyAccessRequest[]>([]);
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(designer.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  // Un validated_visitor/admin a accès à tous les projets confidentiels (règle
  // RLS projects_select_unified) — pas de suivi par demande individuelle.
  const isEntitled = role === "validated_visitor" || role === "admin";

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

  const projectById = useMemo(
    () => new Map(linkedProjects.map((p) => [p.id, p])),
    [linkedProjects],
  );

  const numberedSections: readonly ("hero" | "experiences" | "contact")[] =
    experiences.length > 0
      ? (["hero", "experiences", "contact"] as const)
      : (["hero", "contact"] as const);
  const sectionNumber = (key: (typeof numberedSections)[number]) =>
    String(numberedSections.indexOf(key) + 1).padStart(2, "0");

  // React Router ne scrolle pas automatiquement vers un #hash après une
  // navigation client-side (contrairement à un chargement de page classique) —
  // nécessaire pour le lien "Contacter" du catalogue (/${slug}#contact).
  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [hash]);

  const toggleItem = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const visibleExperiences = showAllExperiences ? experiences : experiences.slice(0, 4);
  const hasMoreExperiences = experiences.length > 4;

  return (
    <>
      <AuroraBackground variant="profile" />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-16"
      >
        {/* HERO — 01 */}
        <section className="mb-32 grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <div className="hidden md:col-span-1 md:block">
            <span className={"text-6xl font-medium " + SECTION_NUMBER_CLASSES.hero.number}>
              {sectionNumber("hero")}
            </span>
            <div className={"mt-2 h-px w-8 " + SECTION_NUMBER_CLASSES.hero.rule} />
          </div>

          <div className="glass-card rounded-[32px] p-8 md:col-span-7 md:p-12">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              {designer.profession}
            </p>
            <h1 className="text-5xl font-medium leading-[1.1] text-on-surface md:text-6xl">
              {designer.fullName}
            </h1>
            <p className="mt-2 font-display-accent text-5xl leading-tight text-primary md:text-6xl">
              {designer.adjective}
            </p>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-on-surface">
              {designer.bio}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:justify-start md:gap-12">
              <Link
                to={`/${designer.slug}/projects`}
                aria-label={`Voir les projets de ${designer.fullName}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-8 py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-[var(--duration-standard)] ease-signature hover:scale-105 hover:brightness-110 active:scale-95 max-md:min-h-11 max-md:w-full"
              >
                Voir les projets
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <div className="flex gap-3">
                {designer.linkedin && (
                  <IconTooltip label="Ouvrir le profil LinkedIn">
                    <a
                      href={designer.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ouvrir le profil LinkedIn"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-primary transition-colors duration-[var(--duration-fast)] ease-signature hover:border-primary max-md:h-11 max-md:w-11"
                    >
                      <FaLinkedin aria-hidden="true" size={18} />
                    </a>
                  </IconTooltip>
                )}
                {designer.email && (
                  <IconTooltip label={emailCopied ? "E-mail copié !" : "Copier l'e-mail"}>
                    <button
                      type="button"
                      onClick={copyEmail}
                      aria-label={emailCopied ? "E-mail copié" : "Copier l'e-mail"}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-primary transition-colors duration-[var(--duration-fast)] ease-signature hover:border-primary max-md:h-11 max-md:w-11"
                    >
                      {emailCopied ? (
                        <Check aria-hidden="true" size={18} />
                      ) : (
                        <AtSign aria-hidden="true" size={18} />
                      )}
                    </button>
                  </IconTooltip>
                )}
                {designer.website && (
                  <IconTooltip label={`Visiter le site web de ${designer.fullName}`}>
                    <a
                      href={designer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visiter le site web de ${designer.fullName}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-primary transition-colors duration-[var(--duration-fast)] ease-signature hover:border-primary max-md:h-11 max-md:w-11"
                    >
                      <Globe aria-hidden="true" size={18} />
                    </a>
                  </IconTooltip>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center md:col-span-4 md:justify-end">
            <div className="relative w-full max-w-[360px]">
              <div
                className="aspect-square overflow-hidden border border-white/10"
                style={{ borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%" }}
              >
                <img
                  src={designer.avatar}
                  alt={`Portrait professionnel de ${designer.fullName}`}
                  className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 hover:grayscale-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* EXPÉRIENCES */}
        {experiences.length > 0 && (
          <section id="experiences" className="mb-32 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="hidden lg:col-span-1 lg:block">
              <span
                className={
                  "whitespace-nowrap text-6xl font-medium " +
                  SECTION_NUMBER_CLASSES.experiences.number
                }
              >
                {sectionNumber("experiences")}
              </span>
              <div className={"mt-2 h-px w-8 " + SECTION_NUMBER_CLASSES.experiences.rule} />
            </div>

            <div className="lg:col-span-11">
              <div className="glass-card rounded-[32px] p-8 md:p-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_3fr] lg:gap-28">
                  {/* Colonne éditoriale — sticky desktop uniquement, alignée sur le
                      texte du premier item (pt-8 compense le py-8 du premier en-tête). */}
                  <div className="lg:sticky lg:top-28 lg:self-start lg:pt-8">
                    <h2 className="text-4xl font-medium text-on-surface">Parcours</h2>
                    {designer.experiencesIntro && (
                      <p className="mt-4 text-base leading-relaxed text-on-surface">
                        {designer.experiencesIntro}
                      </p>
                    )}
                    {designer.cvUrl && (
                      <a
                        href={designer.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-8 py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-[var(--duration-standard)] ease-signature hover:scale-105 hover:brightness-110 active:scale-95 max-md:min-h-11 max-md:w-full",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        )}
                      >
                        Afficher le CV en pdf
                        <ExternalLink aria-hidden="true" size={16} />
                      </a>
                    )}
                  </div>

                  <div>
                    {/* Accordéon — filets entre items uniquement (divide-y). */}
                    <div className="divide-y divide-outline-variant">
                      {visibleExperiences.map((exp) => {
                        const project = exp.projectId ? projectById.get(exp.projectId) : undefined;
                        const accessResult =
                          project && project.status === "confidential"
                            ? resolveAccess(project, isEntitled, requestByProject)
                            : null;
                        return (
                          <ExperienceAccordionItem
                            key={exp.id}
                            exp={exp}
                            isOpen={openId === exp.id}
                            onToggle={() => toggleItem(exp.id)}
                            project={project}
                            accessResult={accessResult}
                            onRequestAccess={setAccessModalProject}
                          />
                        );
                      })}
                    </div>

                    {hasMoreExperiences && (
                      <div className="mt-8 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowAllExperiences((v) => !v)}
                          aria-expanded={showAllExperiences}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-md:min-h-11 max-md:w-full"
                        >
                          {showAllExperiences ? "Réduire" : "Voir plus d'expériences"}
                          {showAllExperiences ? (
                            <ChevronUp aria-hidden="true" size={16} />
                          ) : (
                            <ChevronDown aria-hidden="true" size={16} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CONTACT & CALENDAR */}
        <section id="contact" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="hidden lg:col-span-1 lg:block">
            <span
              className={
                "whitespace-nowrap text-6xl font-medium " + SECTION_NUMBER_CLASSES.contact.number
              }
            >
              {sectionNumber("contact")}
            </span>
            <div className={"mt-2 h-px w-8 " + SECTION_NUMBER_CLASSES.contact.rule} />
          </div>

          {/* Contact form */}
          <div className="glass-card rounded-[32px] p-8 lg:col-span-5 md:p-12">
            <h2 className="mb-8 text-4xl font-medium text-on-surface">Collaborons ensemble</h2>
            <ContactForm />
          </div>

          {/* Calendar widget -- masqué totalement si cal_username n'est pas renseigné (ParametresTab) */}
          {designer.calUsername && (
            <div className="flex min-h-[500px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-surface-container-low backdrop-blur-md lg:col-span-6">
              <div className="border-b border-white/5 p-8 md:p-12">
                <h2 className="mb-4 text-4xl font-medium text-on-surface">Réserver un créneau</h2>
                <p className="text-base leading-relaxed text-on-surface">
                  Discutons de vos besoins lors d'un appel découverte de 15 minutes pour explorer
                  votre vision.
                </p>
              </div>
              <div className="relative flex-grow bg-background/30">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-on-primary/10">
                    <Calendar aria-hidden="true" className="text-primary" size={36} />
                  </div>
                  <p className="mb-2 text-base text-on-surface">
                    Chargement du calendrier interactif…
                  </p>
                  <p className="flex items-center gap-2 text-xs text-on-surface-variant">
                    cal.com/<span className="text-primary">{designer.calUsername}</span>
                    <ComingSoonBadge />
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <AccessRequestModal
        open={!!accessModalProject}
        onClose={() => setAccessModalProject(null)}
        initialProject={accessModalProject}
        onSuccess={refreshMyRequests}
      />
    </>
  );
}
