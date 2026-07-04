import { supabase } from './supabase';
import { uploadInputImage } from './storage';
import { createJob } from './api';
import { track } from './analytics';

/**
 * End-to-end "start a generation" used by both the upload screen (paid users)
 * and the paywall (right after a purchase). Uploads the image, calls
 * create-job, and returns the new job id.
 */
export async function beginGeneration(params: {
  templateId: string;
  uri: string;
  mimeType?: string;
}): Promise<string> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  if (!userId) throw new Error('Not signed in');

  const imagePath = await uploadInputImage({
    userId,
    uri: params.uri,
    mimeType: params.mimeType,
  });
  const { job_id } = await createJob({ templateId: params.templateId, imagePath });
  track('job_created', { job_id, template_id: params.templateId });
  return job_id;
}
