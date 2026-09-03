import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  deleteProjectGalleryImage,
  GALLERY_BUCKET,
  uploadProjectGalleryImage,
} from "@/lib/storage";
import type { ProjectImage, SizeVariant } from "@/types/project";

type ProjectImageRow = Tables<"project_images">;

function mapRow(row: ProjectImageRow): ProjectImage {
  return {
    id: row.id,
    storage_path: row.storage_path,
    url: supabase.storage.from(GALLERY_BUCKET).getPublicUrl(row.storage_path).data.publicUrl,
    display_order: row.display_order,
    size_variant: row.size_variant as SizeVariant,
    caption: row.caption,
    created_at: row.created_at,
  };
}

/**
 * Ecritures admin sur la galerie d'un projet -- upload/suppression/mise a
 * jour d'ordre et de largeur. La lecture complete (jointe a `getProjectById`)
 * vit dans src/data/projects.ts ; ce module ne gere que les mutations
 * declenchees depuis ProjectDrawer.tsx. Toutes s'appuient uniquement sur la
 * policy `project_images_admin` (RLS) -- jamais de verification de role cote
 * client, comme le reste de l'app.
 */
export async function addProjectImage(
  projectId: string,
  file: File,
  displayOrder: number,
  sizeVariant: SizeVariant,
  caption: string | null,
): Promise<ProjectImage> {
  const storagePath = await uploadProjectGalleryImage(file, projectId);

  const { data, error } = await supabase
    .from("project_images")
    .insert({
      project_id: projectId,
      storage_path: storagePath,
      display_order: displayOrder,
      size_variant: sizeVariant,
      caption,
    })
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error(`addProjectImage: insert returned no row (project ${projectId})`);

  return mapRow(data);
}

export async function deleteProjectImage(image: ProjectImage): Promise<void> {
  const { data, error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", image.id)
    .select("id");
  if (error) throw error;
  if ((data?.length ?? 0) !== 1) {
    throw new Error(
      `deleteProjectImage: expected 1 row deleted, got ${data?.length ?? 0} (id=${image.id})`,
    );
  }

  try {
    await deleteProjectGalleryImage(image.storage_path);
  } catch (err) {
    console.error("deleteProjectImage: failed to clean up Storage file", err);
  }
}

/** Met a jour ordre, taille ET legende en un seul aller-retour -- les trois
 * peuvent changer dans la meme session d'edition du drawer. */
export async function updateProjectImage(
  id: string,
  displayOrder: number,
  sizeVariant: SizeVariant,
  caption: string | null,
): Promise<void> {
  const { data, error } = await supabase
    .from("project_images")
    .update({ display_order: displayOrder, size_variant: sizeVariant, caption })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if ((data?.length ?? 0) !== 1) {
    throw new Error(
      `updateProjectImage: expected 1 row updated, got ${data?.length ?? 0} (id=${id})`,
    );
  }
}

interface SyncProjectImagesChanges {
  toDelete: ProjectImage[];
  toUpload: {
    file: File;
    sizeVariant: SizeVariant;
    caption: string | null;
    displayOrder: number;
  }[];
  toUpdate: {
    id: string;
    displayOrder: number;
    sizeVariant: SizeVariant;
    caption: string | null;
  }[];
}

/**
 * Orchestration appelee une seule fois depuis ProjectDrawer.persist() --
 * miroir de syncProjectTags (projects.ts), appelee une fois depuis
 * createProject/updateProject. Sequentiel, echoue au premier probleme (pas
 * de tentative de continuer apres une erreur) : ces ecritures ne sont pas
 * transactionnelles (contrairement a soft_delete_project) -- un upload de
 * fichier binaire ne peut de toute facon pas se faire depuis une fonction
 * plpgsql, donc une vraie atomicite "fichiers + lignes" n'est pas atteignable
 * ici quelle que soit l'architecture choisie. Un re-enregistrement apres
 * erreur est sur (le diff se recalcule proprement a partir de l'etat reel).
 */
export async function syncProjectImages(
  projectId: string,
  { toDelete, toUpload, toUpdate }: SyncProjectImagesChanges,
): Promise<void> {
  for (const image of toDelete) {
    await deleteProjectImage(image);
  }
  for (const { file, sizeVariant, caption, displayOrder } of toUpload) {
    await addProjectImage(projectId, file, displayOrder, sizeVariant, caption);
  }
  for (const { id, displayOrder, sizeVariant, caption } of toUpdate) {
    await updateProjectImage(id, displayOrder, sizeVariant, caption);
  }
}
