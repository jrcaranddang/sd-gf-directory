// Edge Function: delete-account (POST) — App Store requirement (spec §3/§7).
// Removes the user's storage objects, job rows, profile, and auth user.
import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getUserId } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const userId = await getUserId(req);
  if (!userId) return json({ error: 'Unauthenticated' }, 401);

  const db = adminClient();

  // Best-effort storage cleanup (user-scoped folders).
  for (const bucket of ['pet-uploads', 'pet-results']) {
    const { data: files } = await db.storage.from(bucket).list(userId);
    if (files?.length) {
      await db.storage
        .from(bucket)
        .remove(files.map((f) => `${userId}/${f.name}`));
    }
  }

  // Rows cascade from profiles -> jobs via FK on delete cascade.
  await db.from('profiles').delete().eq('id', userId);

  // Finally remove the auth user.
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true });
});
