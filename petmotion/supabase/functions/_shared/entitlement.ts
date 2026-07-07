// Server-side entitlement check via the RevenueCat REST API (spec §6).
// Cached in-memory for 5 minutes per app user id to keep create-job fast and
// avoid hammering RevenueCat. In mock/dev (no RC_SECRET_KEY) we treat everyone
// as entitled so the pipeline is testable without payments wired.

const ENTITLEMENT = 'pro';
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { pro: boolean; at: number }>();

export async function hasProEntitlement(appUserId: string): Promise<boolean> {
  const secret = Deno.env.get('RC_SECRET_KEY');
  if (!secret) return true; // dev/mock bypass

  const cached = cache.get(appUserId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.pro;

  try {
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    if (!res.ok) return false;
    const json = await res.json();
    const ent = json.subscriber?.entitlements?.[ENTITLEMENT];
    const expires = ent?.expires_date ? Date.parse(ent.expires_date) : 0;
    // Active if entitlement exists and either never expires or expiry is future.
    const pro = !!ent && (!ent.expires_date || expires > Date.now());
    cache.set(appUserId, { pro, at: Date.now() });
    return pro;
  } catch {
    return false;
  }
}
