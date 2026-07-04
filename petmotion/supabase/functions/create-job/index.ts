// Edge Function: create-job (POST) — spec §5
// 1. Verify JWT   2. Verify entitlement (403 PAYWALL)   3. Check quotas (429)
// 4. Validate image   5. Fetch server-side prompt   6. Submit to provider
// 7. Insert jobs row, return job id.
import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getUserId } from '../_shared/supabaseAdmin.ts';
import { hasProEntitlement } from '../_shared/entitlement.ts';
import { getProvider } from '../_shared/providers/index.ts';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const WEEKLY_QUOTA = Number(Deno.env.get('WEEKLY_QUOTA') ?? '30');
const MAX_DAILY_JOBS = Number(Deno.env.get('MAX_DAILY_JOBS') ?? '10');
const GLOBAL_MAX_DAILY_JOBS = Number(Deno.env.get('GLOBAL_MAX_DAILY_JOBS') ?? '500');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const userId = await getUserId(req);
  if (!userId) return json({ error: 'Unauthenticated', code: 'UNAUTHENTICATED' }, 401);

  const { template_id, input_image_path } = await req.json().catch(() => ({}));
  if (!template_id || !input_image_path) {
    return json({ error: 'template_id and input_image_path required' }, 400);
  }

  const db = adminClient();

  // 2. Entitlement.
  if (!(await hasProEntitlement(userId))) {
    return json({ error: 'Subscription required', code: 'PAYWALL' }, 403);
  }

  // 3. Global kill-switch, then per-user weekly + daily quotas.
  const globalToday = await db.rpc('global_jobs_today');
  if ((globalToday.data ?? 0) >= GLOBAL_MAX_DAILY_JOBS) {
    return json({ error: 'Service is busy, try again tomorrow', code: 'KILL_SWITCH' }, 503);
  }

  const counters = await db.rpc('roll_and_get_counters', { p_user: userId });
  const row = Array.isArray(counters.data) ? counters.data[0] : counters.data;
  if ((row?.generations_this_week ?? 0) >= WEEKLY_QUOTA) {
    return json({ error: 'Weekly limit reached', code: 'QUOTA' }, 429);
  }
  if ((row?.generations_today ?? 0) >= MAX_DAILY_JOBS) {
    return json({ error: 'Daily limit reached', code: 'DAILY_CAP' }, 429);
  }

  // 4. Validate + download the uploaded image from the private bucket.
  const download = await db.storage.from('pet-uploads').download(input_image_path);
  if (download.error || !download.data) {
    return json({ error: 'Image not found', code: 'INVALID_IMAGE' }, 400);
  }
  const blob = download.data;
  if (blob.size > MAX_IMAGE_BYTES) {
    return json({ error: 'Image too large', code: 'INVALID_IMAGE' }, 400);
  }
  if (blob.type && !ALLOWED_TYPES.includes(blob.type)) {
    return json({ error: 'Unsupported image type', code: 'INVALID_IMAGE' }, 400);
  }
  const imageBytes = new Uint8Array(await blob.arrayBuffer());

  // 5. Server-side prompt (never trusts the client).
  const tpl = await db
    .from('templates')
    .select('*')
    .eq('id', template_id)
    .eq('is_active', true)
    .single();
  if (tpl.error || !tpl.data) return json({ error: 'Template not found' }, 400);

  const provider = getProvider();
  const prompt = tpl.data.prompt.replaceAll('{SUBJECT}', 'the pet in the photo');

  // 6. Submit to provider.
  let providerTaskId: string;
  try {
    const submit = await provider.submit({
      imageBytes,
      imageContentType: blob.type || 'image/jpeg',
      prompt,
      durationSeconds: tpl.data.duration_seconds,
      aspectRatio: tpl.data.aspect_ratio,
      audioEnabled: tpl.data.audio_enabled,
    });
    providerTaskId = submit.providerTaskId;
  } catch (e) {
    console.error('provider submit failed', e);
    return json({ error: 'Generation service unavailable' }, 502);
  }

  // 7. Insert job row (service role — no client insert policy exists).
  const insert = await db
    .from('jobs')
    .insert({
      user_id: userId,
      template_id,
      status: 'submitted',
      input_image_path,
      provider: provider.name,
      provider_task_id: providerTaskId,
    })
    .select('id, status')
    .single();

  if (insert.error || !insert.data) {
    return json({ error: 'Could not create job' }, 500);
  }

  return json({ job_id: insert.data.id, status: insert.data.status }, 201);
});
