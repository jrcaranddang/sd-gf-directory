import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

// Fire an Expo push notification when a generation completes (spec §5).
// Best-effort: failures never block the job pipeline.
export async function notifyJobComplete(
  db: SupabaseClient,
  userId: string,
  ok: boolean,
): Promise<void> {
  try {
    const { data } = await db
      .from('profiles')
      .select('expo_push_token')
      .eq('id', userId)
      .single();
    const token = data?.expo_push_token;
    if (!token) return;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: ok ? 'Your video is ready! 🎉' : 'Generation failed 😿',
        body: ok
          ? 'Tap to watch and share your PetMotion video.'
          : "We couldn't finish this one — it didn't count against your quota.",
      }),
    });
  } catch (e) {
    console.error('push notify failed', e);
  }
}
