import { supabase } from "@/integrations/supabase/client";

const BUCKET = "project-thumbnails";
const DESIGNER_PHOTOS_BUCKET = "designer-photos";

export async function uploadProjectThumbnail(file: File, projectId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${projectId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProjectThumbnail(url: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export async function uploadDesignerPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(DESIGNER_PHOTOS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(DESIGNER_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Politique d'upload de la galerie projet (ProjectDrawer) -- aucune validation
 * de ce type n'existe pour la miniature (juste un texte informatif) : ici
 * l'application est réelle, vérifiée au moment de la sélection du fichier. */
export const MAX_GALLERY_IMAGES = 12;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const GALLERY_BUCKET = "project-gallery";

/** Contrairement à `uploadProjectThumbnail`, le nom de fichier porte un
 * suffixe aléatoire : plusieurs images peuvent être sélectionnées dans le
 * même batch, potentiellement à la même milliseconde (`Date.now()` seul
 * collisionnerait). Retourne le `storage_path` brut, pas une URL publique --
 * résolue à la lecture (cf. `mapProjectRow`, src/data/projects.ts). */
export async function uploadProjectGalleryImage(file: File, projectId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${projectId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  return path;
}

/**
 * ⚠️ RLS Storage, piège vérifié en direct (28/09) : un bucket public n'a
 * volontairement aucune policy SELECT sur `storage.objects` (la lecture par
 * URL directe ne passe pas par RLS, une SELECT publique n'autoriserait que le
 * *listing* -- même pattern que project-thumbnails/designer-photos). Mais
 * l'API Storage a besoin d'une requête interne, elle soumise à RLS, pour
 * retrouver l'objet avant de le supprimer/modifier -- sans policy SELECT
 * (même admin-only), `.remove()` échoue silencieusement (aucune `error`
 * renvoyée, l'objet reste en place) au lieu de lever une erreur explicite.
 * Migration `20260901183035_project_gallery_select_admin_for_mutations.sql`
 * ajoute la policy SELECT admin-only manquante -- ne pas la retirer sans
 * revérifier ce comportement. Toujours vérifier `data` en plus de `error` ici
 * (pattern RLS-silencieuse déjà en place ailleurs dans ce projet, cf.
 * syncProjectTags) : `.remove()` peut renvoyer un tableau vide/partiel sans
 * `error` si RLS filtre le résultat.
 */
export async function deleteProjectGalleryImage(path: string): Promise<void> {
  const { data, error } = await supabase.storage.from(GALLERY_BUCKET).remove([path]);
  if (error) throw error;
  if (!data || data.length !== 1) {
    throw new Error(
      `deleteProjectGalleryImage: expected 1 file removed, got ${data?.length ?? 0} (path=${path})`,
    );
  }
}
