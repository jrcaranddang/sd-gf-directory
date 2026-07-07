# PetMotion — Backlog

**North-star goal (spec §7 "Definition of done"):** a TestFlight build where a new
user can browse templates, upload a pet photo, hit the paywall, start a trial,
generate a **real** Seedance video, and share it.

**Legend** — Priority: `P0` blocks launch · `P1` needed for a good launch ·
`P2` post-launch. Status: `todo` · `wip` · `done` · `blocked`.

---

## ✅ Already shipped (scaffold — PR #3)

The code for spec milestones M1–M5 plus most of M6 is in place and the client
passes `tsc --noEmit`:

- 7 Expo Router screens (onboarding, gallery, template detail, upload, paywall +
  abandonment offer, generation status, result, history).
- Anonymous Supabase auth; RevenueCat + push registration at startup.
- Supabase schema, RLS, storage buckets, quota RPCs, 5 seed templates.
- Edge Functions `create-job`, `get-job`, `delete-account`.
- `VideoProvider` interface with **mock** (sample MP4 after ~20s) and **BytePlus**
  clients; `PROVIDER=mock|byteplus`.
- Cost guards: weekly quota, per-user daily cap, global kill-switch.

Everything below is what remains to actually **launch**.

---

## Epic A — Provision real backend (P0)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-A1 | Create production Supabase project | P0 | todo | Project exists; URL + anon + service-role keys captured in a secret manager. |
| PM-A2 | Apply migrations & seed to prod | P0 | todo | `0001_init.sql`, `0002_storage.sql`, `seed.sql` applied; `templates` returns 5 active rows; buckets `pet-uploads` (private) + `pet-results` (public) exist. |
| PM-A3 | Deploy Edge Functions | P0 | todo | `supabase functions deploy create-job get-job delete-account`; all reachable and return 401 without a JWT. |
| PM-A4 | Set server secrets | P0 | todo | `supabase secrets set` for `PROVIDER`, `BYTEPLUS_API_KEY`, `RC_SECRET_KEY`, `MAX_DAILY_JOBS`, `GLOBAL_MAX_DAILY_JOBS`, `WEEKLY_QUOTA`. Confirm `SUPABASE_ANON_KEY` is available to functions (used by `getUserId`). |
| PM-A5 | Wire client env for EAS | P0 | todo | `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY` and `EXPO_PUBLIC_REVENUECAT_IOS_KEY` injected via EAS env (replace `app.json` placeholders). |
| PM-A6 | Verify anonymous sign-in enabled in prod | P0 | todo | `enable_anonymous_sign_ins = true` in the hosted project; fresh install creates a `profiles` row via the `on_auth_user_created` trigger. |

## Epic B — Real video provider (P0)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-B1 | BytePlus ModelArk account + API key approved | P0 | blocked | Account approved for Seedance 2.0 image-to-video; key issued. (Approval can lag — start now.) |
| PM-B2 | Verify BytePlus request/response shape | P0 | todo | Confirm base URL, model id (`seedance-2-0-lite-i2v`?), payload fields, and status vocabulary in `providers/byteplus.ts` against current docs; a real submit → poll → video URL round-trips. |
| PM-B3 | End-to-end real generation | P0 | todo | With `PROVIDER=byteplus`, a real pet photo produces a playable MP4 copied into `pet-results`; job row reaches `succeeded`. |
| PM-B4 | Provider error mapping | P1 | todo | Content-filter rejections, timeouts, and 4xx/5xx map to a `failed` job with a user-friendly message; failures do **not** bill quota (verify `increment_usage` only runs on success). |
| PM-B5 | fal.ai fallback client | P2 | todo | `FalProvider implements VideoProvider`; `PROVIDER=fal` works; documented switch path if BytePlus rate-limits. |
| PM-B6 | Move polling off client to cron (scale) | P2 | todo | Optional `poll-jobs` cron (spec §5) so jobs finalize even if the app is closed and no `get-job` is called; reduces reliance on client polling. |

## Epic C — Payments (P0)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-C1 | App Store Connect subscriptions | P0 | todo | `pm_weekly_699` (3-day trial) and `pm_annual_3999` created; submitted **with** the binary. |
| PM-C2 | RevenueCat project + offering | P0 | todo | Entitlement `pro`; offering `default` with weekly + annual packages; iOS API key set. |
| PM-C3 | Sandbox purchase flow | P0 | todo | Sandbox tester can start the weekly trial and the annual purchase; `pro` entitlement activates; `create-job` server check passes. |
| PM-C4 | Server entitlement verification live | P0 | todo | With `RC_SECRET_KEY` set, `create-job` returns `403 PAYWALL` for non-subscribers and 201 for subscribers; 5-min cache behaves. |
| PM-C5 | Abandonment offer + restore QA | P1 | todo | Dismissing the paywall shows the annual offer once; Restore reactivates entitlement on a reinstall. |
| PM-C6 | Sync `rc_app_user_id` to profile | P1 | todo | On configure/purchase, `profiles.rc_app_user_id` is written (currently unset) so support can reconcile users. |

## Epic D — Assets & branding (P1)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-D1 | App icon + splash + notification icon | P0 | todo | `assets/icon.png`, `adaptive-icon.png`, `splash.png`, `notification-icon.png` at sizes in `assets/README.md`; EAS build succeeds. |
| PM-D2 | Real template preview videos | P0 | todo | 5 preview MP4s uploaded to `pet-results/previews/…`; `seed.sql` URLs updated; gallery autoplays them. |
| PM-D3 | Onboarding looping videos | P1 | todo | Replace emoji slides with looping template videos (spec §3). |
| PM-D4 | App Store screenshots + preview | P1 | todo | 6.7" + 6.5" screenshots and an optional preview video generated from real outputs. |
| PM-D5 | Expand template catalogue | P2 | todo | 15–20 templates across all four categories; verify remote-config add (no app update). |

## Epic E — Compliance & legal (P0)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-E1 | Host privacy policy + terms | P0 | todo | Static pages live at `petmotion.app/privacy` and `/terms` (URLs already linked in paywall/history). |
| PM-E2 | App Store privacy nutrition labels | P0 | todo | Data-collection list completed in App Store Connect (photos, purchases, identifiers, usage). |
| PM-E3 | UGC review notes | P0 | todo | Review notes state content filter is ON and a report button exists; confirm `report@petmotion.app` inbox works. |
| PM-E4 | Verify account deletion end-to-end | P0 | todo | `delete-account` removes storage objects, job rows (cascade), profile, and auth user; app returns to onboarding. |
| PM-E5 | Support inbox | P1 | todo | `support@petmotion.app` monitored; contact link works. |

## Epic F — Hardening & QA (P1)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-F1 | Error & empty states | P1 | todo | Network failure on gallery/upload/generate shows retry; `get-job` errors don't leave the status screen spinning forever (timeout after ~5 min → failed). |
| PM-F2 | Quota-exhaustion UX | P1 | todo | `QUOTA` / `DAILY_CAP` / `KILL_SWITCH` responses surface distinct, friendly messages (upsell annual on weekly-quota hit). |
| PM-F3 | Image validation parity | P1 | todo | Server rejects non-image / >10MB / unsupported type gracefully; client pre-checks match (`MIN_DIMENSION`, 10MB). |
| PM-F4 | Storage retention job | P1 | todo | 30-day retention (spec §3): scheduled cleanup of `pet-uploads` + `pet-results` + old `jobs`. |
| PM-F5 | Push notification delivery test | P1 | todo | Real device receives the "video ready" push on completion; tapping deep-links to the result. |
| PM-F6 | Concurrency / double-tap guard | P2 | todo | Rapid double Generate can't create two jobs / double-charge quota. |
| PM-F7 | Automated smoke test | P2 | todo | A scripted mock-provider run asserts create-job → get-job → succeeded; runs in CI. |
| PM-F8 | Deno lint/type check in CI | P2 | todo | `deno check` on `supabase/functions/**` in CI (can't run locally today). |

## Epic G — Analytics & funnel (P1)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-G1 | Confirm funnel events fire | P1 | todo | install → upload → paywall_view → trial_start → generate → shared all logged in order (spec §8). |
| PM-G2 | PostHog (or RC events) wired | P1 | todo | Replace the `analytics.track` stub body with a real sink; events visible in a dashboard. |
| PM-G3 | Launch metrics dashboard | P1 | todo | Installs, paywall-view rate, trial-start rate, trial→paid, cost/generation tracked (spec §8). |

## Epic H — Build & release (P0)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-H1 | EAS project + credentials | P0 | todo | `eas.json` configured; iOS credentials set up. |
| PM-H2 | TestFlight build | P0 | todo | `eas build -p ios` + `eas submit` produces an installable TestFlight build. |
| PM-H3 | Full manual run-through on device | P0 | todo | The Definition-of-Done flow completes on a physical iPhone with the real provider + sandbox purchase. |
| PM-H4 | App Store Connect record | P1 | todo | App record, metadata, category, age rating, IAPs attached for review. |

## Epic I — Growth / launch (P1)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-I1 | 3 TikTok accounts posting daily | P1 | todo | Posting template outputs daily starting now (spec §8 — don't wait for approval). |
| PM-I2 | Landing page | P2 | todo | Simple site with App Store link + the hosted legal pages. |

## Epic J — Post-launch (P2)

| ID | Task | Priority | Status | Acceptance criteria |
|----|------|----------|--------|---------------------|
| PM-J1 | Superwall integration | P2 | todo | Paywall served remotely for A/B testing (spec §1). |
| PM-J2 | Android build | P2 | todo | RevenueCat Android key + Play Console; EAS Android build. |
| PM-J3 | Referral / free-first-video loop | P2 | todo | Optional one free watermarked generation to boost virality (spec §6). |
| PM-J4 | Cost/margin monitoring + alerts | P2 | todo | Alert when cost/generation approaches revenue thresholds; tune `MAX_DAILY_JOBS`. |

---

## Critical path to first TestFlight

```
PM-A1 → PM-A2 → PM-A3/A4/A5 → PM-B1 → PM-B2 → PM-B3      (backend + real video)
                                   ↘ PM-C1 → PM-C2 → PM-C3/C4  (payments)
PM-D1 (icons) ─┐
PM-E1 (legal) ─┼→ PM-H1 → PM-H2 → PM-H3 → 🚀 TestFlight
PM-D2 (previews)┘
```

**Biggest external risk / start immediately:** `PM-B1` (BytePlus approval) and
`PM-C1` (App Store subscription review) both have lead times outside your control.
