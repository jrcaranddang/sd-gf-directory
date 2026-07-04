/**
 * Thin analytics wrapper. v1 just logs; swap the body for PostHog/Superwall
 * later without touching call sites. Every paywall impression/conversion is
 * instrumented here (spec §1 — needed for post-launch A/B testing).
 */
export type AnalyticsEvent =
  | 'app_open'
  | 'onboarding_complete'
  | 'gallery_view'
  | 'template_open'
  | 'photo_selected'
  | 'generate_tapped'
  | 'paywall_view'
  | 'paywall_dismiss'
  | 'abandonment_offer_view'
  | 'trial_start'
  | 'purchase_complete'
  | 'purchase_restore'
  | 'job_created'
  | 'job_succeeded'
  | 'job_failed'
  | 'result_saved'
  | 'result_shared';

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, props ?? {});
  }
  // TODO(post-launch): posthog.capture(event, props)
}
