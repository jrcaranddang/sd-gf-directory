// Edge Function: get-job (GET ?id=) — spec §5
// Returns the job. When the provider has finished, downloads the result video
// into the public pet-results bucket (provider URLs expire ~24h), updates the
// row, increments usage on success, and fires a push notification. Idempotent:
// once a job is terminal we just return it.
import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getUserId } from '../_shared/supabaseAdmin.ts';
import { getProvider } from '../_shared/providers/index.ts';
import { notifyJobComplete } from '../_shared/push.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const userId = await getUserId(req);
  if (!userId) return json({ error: 'Unauthenticated', code: 'UNAUTHENTICATED' }, 401);

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return json({ error: 'id required' }, 400);

  const db = adminClient();
  const { data: job, error } = await db
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId) // never leak another user's job
    .single();

  if (error || !job) return json({ error: 'Job not found' }, 404);

  // Already terminal — return as-is.
  if (job.status === 'succeeded' || job.status === 'failed') {
    return json(job);
  }

  // Poll the provider.
  const provider = getProvider();
  const poll = await provider.poll(job.provider_task_id);

  if (poll.status === 'processing') {
    if (job.status !== 'processing') {
      await db.from('jobs').update({ status: 'processing' }).eq('id', id);
      job.status = 'processing';
    }
    return json(job);
  }

  if (poll.status === 'failed') {
    const updated = await markFailed(db, id, poll.error ?? 'Generation failed');
    await notifyJobComplete(db, userId, false);
    return json(updated ?? job);
  }

  // Succeeded: copy the video into our storage before the provider URL expires.
  try {
    const storagePath = `${userId}/${id}.mp4`;
    const videoRes = await fetch(poll.videoUrl!);
    if (!videoRes.ok) throw new Error(`download ${videoRes.status}`);
    const bytes = new Uint8Array(await videoRes.arrayBuffer());

    const up = await db.storage
      .from('pet-results')
      .upload(storagePath, bytes, { contentType: 'video/mp4', upsert: true });
    if (up.error) throw up.error;

    const publicUrl = db.storage.from('pet-results').getPublicUrl(storagePath)
      .data.publicUrl;

    const { data: updated } = await db
      .from('jobs')
      .update({
        status: 'succeeded',
        output_video_url: publicUrl,
        output_storage_path: storagePath,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    // Only bill quota on success (spec §5).
    await db.rpc('increment_usage', { p_user: userId });
    await notifyJobComplete(db, userId, true);
    return json(updated ?? job);
  } catch (e) {
    console.error('finalize failed', e);
    const updated = await markFailed(db, id, 'Could not save video');
    await notifyJobComplete(db, userId, false);
    return json(updated ?? job);
  }
});

async function markFailed(
  db: ReturnType<typeof adminClient>,
  id: string,
  message: string,
) {
  const { data } = await db
    .from('jobs')
    .update({ status: 'failed', error: message, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  return data;
}
