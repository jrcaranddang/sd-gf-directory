import { supabase } from './supabase';

const INPUT_BUCKET = 'pet-uploads'; // private bucket, RLS-scoped to user folder
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB (spec §5)

/**
 * Uploads a local image (file:// uri) to the private uploads bucket under the
 * user's folder, returning the storage path to hand to create-job.
 */
export async function uploadInputImage(params: {
  userId: string;
  uri: string;
  mimeType?: string;
}): Promise<string> {
  const { userId, uri, mimeType = 'image/jpeg' } = params;

  const response = await fetch(uri);
  const blob = await response.blob();
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large (max 10MB). Try a smaller photo.');
  }

  const ext = mimeType.split('/')[1] ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const arrayBuffer = await new Response(blob).arrayBuffer();
  const { error } = await supabase.storage
    .from(INPUT_BUCKET)
    .upload(path, arrayBuffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}
