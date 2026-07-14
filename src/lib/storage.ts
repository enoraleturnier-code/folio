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
