import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { MarkdownContent } from "@/components/MarkdownContent";
import { StatusBadge } from "@/components/StatusBadge";
import { TagBadge } from "@/components/TagBadge";
import { designer } from "@/data/designer";
import { getProjectById } from "@/data/projects";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatSecteur } from "@/lib/secteurLabels";
import type { ProjectImage, SizeVariant } from "@/types/project";

/** Mapping taille -> nombre de colonnes occupées (largeur uniquement -- la
 * hauteur/row-span n'est plus fixe par taille, cf. `computeGalleryRowSpan`
 * plus bas : elle est recalculée par image à partir de son vrai ratio, pour
 * ne plus jamais recadrer ni laisser de bande vide). `tall` partage donc la
 * même largeur que `small`, `large` la même que `wide` -- la distinction de
 * hauteur qu'ils suggéraient auparavant est désormais automatique. */
const SIZE_VARIANT_COL_SPAN: Record<SizeVariant, number> = {
  small: 1,
  tall: 1,
  wide: 2,
  large: 2,
  full: Infinity, // traité comme "toutes les colonnes" dans computeGalleryRowSpan
};

const SIZE_VARIANT_COL_CLASS: Record<SizeVariant, string> = {
  small: "col-span-1",
  tall: "col-span-1",
  wide: "col-span-2",
  large: "col-span-2",
  full: "col-span-full",
};

/** Unité de ligne très fine (8px) pour que `grid-row: span N` (calculé par
 * image ci-dessous) approxime la vraie hauteur de chaque image à quelques
 * pixels près -- remplace l'ancien row-span fixe par taille, qui forçait
 * soit un recadrage (`object-cover`), soit des bandes vides (`object-contain`)
 * dès que le ratio réel de la photo ne correspondait pas exactement à la
 * cellule. Cf. DESIGN.md pour la dérivation complète. */
const GALLERY_ROW_UNIT = 8;
/** Ratio largeur/hauteur clampé pour qu'un format extrême (panorama, bannière
 * très haute) ne produise pas une cellule disproportionnée -- couvre large
 * tous les ratios photo courants (portrait 4:5 à paysage 16:9). */
const GALLERY_MIN_RATIO = 1 / 2.2;
const GALLERY_MAX_RATIO = 2.2;

function computeGalleryRowSpan(
  ratio: number | null,
  sizeVariant: SizeVariant,
  gridWidth: number,
  totalCols: number,
  gapPx: number,
): number {
  const clampedRatio = Math.min(GALLERY_MAX_RATIO, Math.max(GALLERY_MIN_RATIO, ratio ?? 1));
  const colSpan = Math.min(totalCols, SIZE_VARIANT_COL_SPAN[sizeVariant]);
  const colWidth = (gridWidth - (totalCols - 1) * gapPx) / totalCols;
  const itemWidth = colWidth * colSpan + (colSpan - 1) * gapPx;
  const idealHeight = itemWidth / clampedRatio;
  return Math.max(1, Math.round((idealHeight + gapPx) / (GALLERY_ROW_UNIT + gapPx)));
}

/** Une instance par disposition (mobile/desktop, cf. ProjectDetailPage) --
 * chacune mesure sa propre largeur de grille via ResizeObserver (fluide,
 * hors de `max-w-[1440px]`, cf. gallerySection*) pour calculer le row-span
 * de chaque image d'après son ratio réel. Avant le chargement d'une image
 * (`ratios[id]` absent), ratio=1 (carré) sert de placeholder raisonnable --
 * corrigé sans à-coup dès que l'image réelle charge (`onLoad`). */
function ProjectGallery({
  images,
  title,
  totalCols,
  gapPx,
  gridClassName,
}: {
  images: ProjectImage[];
  title: string;
  totalCols: number;
  gapPx: number;
  gridClassName: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    setGridWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setGridWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-5 py-8 sm:py-10 md:px-16">
      <div
        ref={gridRef}
        className={cn("grid grid-flow-dense", gridClassName)}
        style={{ gridAutoRows: `${GALLERY_ROW_UNIT}px` }}
      >
        {images.map((img, i) => {
          const rowSpan = computeGalleryRowSpan(
            ratios[img.id] ?? null,
            img.size_variant,
            gridWidth,
            totalCols,
            gapPx,
          );
          return (
            <div
              key={img.id}
              className={cn("relative overflow-hidden", SIZE_VARIANT_COL_CLASS[img.size_variant])}
              style={{ gridRow: `span ${rowSpan}` }}
            >
              <img
                src={img.url}
                alt={`${title} — vue ${i + 1}`}
                onLoad={(e) => {
                  const t = e.currentTarget;
                  if (!t.naturalWidth || !t.naturalHeight) return;
                  const ratio = t.naturalWidth / t.naturalHeight;
                  setRatios((prev) =>
                    prev[img.id] === ratio ? prev : { ...prev, [img.id]: ratio },
                  );
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {img.caption && (
                <p className="absolute bottom-0 right-0 max-w-[80%] bg-surface-container-lowest/75 px-3 py-1.5 text-xs text-white">
                  {img.caption}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ProjectDetailLoaderData =
  | {
      deleted: false;
      title: null;
      project: NonNullable<Awaited<ReturnType<typeof getProjectById>>>;
    }
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
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-5 pb-24 pt-40 text-center md:px-16"
      >
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
    { label: "Résultats", content: project.ai_structured_desc?.resultat },
  ];

  const headerBlock = (
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
  );

  const thumbnailBlock = project.thumbnail_url && (
    <div className="relative w-full overflow-hidden rounded-2xl">
      <img
        src={project.thumbnail_url}
        alt={project.title}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
        className="h-auto w-full"
      />
      {project.status === "confidential" && (
        <div className="absolute right-4 top-4">
          <StatusBadge kind="confidential" size="md" />
        </div>
      )}
    </div>
  );

  const resultsBlock = (
    <div className="space-y-14">
      {project.show_long_desc && project.long_desc && (
        <section className="flex items-start gap-8">
          <div aria-hidden="true" className="hidden shrink-0 flex-col md:flex">
            <span className="text-6xl font-medium opacity-0">01</span>
            <div className="mt-2 h-px w-8" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-medium text-on-surface">Vue d'ensemble du projet</h2>
            <MarkdownContent content={project.long_desc} />
          </div>
        </section>
      )}

      <div className="space-y-16">
        {blocks.map((block, i) => (
          <div key={block.label} className="flex items-start gap-8">
            <div className="hidden shrink-0 flex-col md:flex">
              <span className={"text-6xl font-medium " + BLOCK_NUMBER_CLASSES[i].number}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={"mt-2 h-px w-8 " + BLOCK_NUMBER_CLASSES[i].rule} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-medium text-on-surface">{block.label}</h2>
              <MarkdownContent content={block.content} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const asideCard = (
    <div className="space-y-8 rounded-2xl border border-white/5 bg-surface-container-low p-6 md:sticky md:top-28">
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
  );

  // Deux instances distinctes (largeur/colonnes/gap propres à chaque
  // disposition mobile/desktop, cf. usages plus bas) -- chacune mesure sa
  // propre largeur de grille (fluide, hors de `max-w-[1440px]`) pour calculer
  // le row-span de chaque image.
  const gallerySectionMobile = project.images && project.images.length > 0 && (
    <ProjectGallery
      images={project.images}
      title={project.title}
      totalCols={2}
      gapPx={8}
      gridClassName="grid-cols-2 gap-2"
    />
  );
  const gallerySectionDesktop = project.images && project.images.length > 0 && (
    <ProjectGallery
      images={project.images}
      title={project.title}
      totalCols={4}
      gapPx={12}
      gridClassName="grid-cols-4 gap-3"
    />
  );

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-16"
    >
      {/* Mobile (< md) : empilé -- détails + titre, thumbnail, bloc info,
       * problème/décisions/résultats, galerie en dernier. */}
      <div className="flex flex-col gap-14 md:hidden">
        {headerBlock}
        {thumbnailBlock}
        <aside>{asideCard}</aside>
        {resultsBlock}
        {gallerySectionMobile}
      </div>

      {/* Desktop (md+) : grille 2 colonnes -- contenu (détails + thumbnail +
       * problème/décisions/résultats) à gauche, bloc info sticky à droite. La
       * galerie est un sibling APRÈS cette grille (pas un membre), pour que le
       * "containing block" du sticky s'arrête net à la fin du contenu et ne
       * s'étende pas jusque dans la galerie. */}
      <div className="hidden gap-12 md:grid md:grid-cols-12">
        <div className="space-y-14 md:col-span-8">
          {headerBlock}
          {thumbnailBlock}
          {resultsBlock}
        </div>
        <aside className="md:col-span-4">{asideCard}</aside>
      </div>
      <div className="hidden md:block">{gallerySectionDesktop}</div>
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
