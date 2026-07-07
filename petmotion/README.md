# PetMotion 🐾

Turn any pet photo into a shareable AI video in under 2 minutes.

Expo (React Native) app + Supabase backend that animates a pet photo into a
5–10s Seedance video with audio. Built to the [App Specification v1.0](../ANIMATIONS.md)
— see the spec in the task for full product/business context.

> **Repo note:** this project lives in the `petmotion/` subdirectory of a repo
> whose root is an unrelated website. Everything PetMotion is self-contained here.

## What's implemented

This is the milestone scaffold from spec §7, wired end-to-end against a **mock
video provider** so the full flow is testable before real API keys exist.

| Spec milestone | Status |
|---|---|
| M1 — Scaffold (Router, TS, theme, 7 screens, schema, seed) | ✅ |
| M2 — Gallery + upload (grid, video previews, picker, crop, detail sheet) | ✅ |
| M3 — Backend pipeline (`create-job` + `get-job`, mock provider, full client flow) | ✅ |
| M4 — Real provider (BytePlus behind `VideoProvider` interface, storage copy) | ✅ code, needs live key |
| M5 — Payments (RevenueCat SDK, paywall, abandonment offer, server entitlement gate) | ✅ code, needs RC config |
| M6 — Polish/compliance (push, history, delete account, report button, legal links) | ✅ mostly; assets/EAS pending |

## Architecture

```
app/                         Expo Router screens
  _layout.tsx                anon session + RevenueCat + push bootstrap
  index.tsx                  onboarding gate
  onboarding.tsx             3-slide intro
  (tabs)/index.tsx           template gallery (home)
  (tabs)/history.tsx         history + subscription + delete account
  template/[id].tsx          template detail sheet
  upload.tsx                 photo pick/crop + Generate (paywall trigger)
  paywall.tsx                soft paywall + abandonment offer
  generating/[jobId].tsx     status screen, polls every 5s
  result/[jobId].tsx         player, save, share, report

src/                         client libs, hooks, components, theme, types
supabase/
  migrations/                schema, RLS, storage buckets, quota RPCs
  seed.sql                   5 launch templates
  functions/
    _shared/providers/       VideoProvider interface: mock | byteplus (+ fal later)
    create-job/              submit: entitlement → quota → validate → provider
    get-job/                 poll: download to storage → notify → bill on success
    delete-account/          App Store account deletion
```

**Key design decisions**
- **Soft paywall:** browsing/upload never gated; paywall fires only on *Generate*
  (highest intent). Server (`create-job`) re-verifies entitlement, so the client
  check is just UX.
- **Provider key never touches the client.** All generation goes through Edge
  Functions. Prompts live server-side only.
- **Provider is swappable** behind `VideoProvider` — set `PROVIDER=mock|byteplus`.
- **Quota is billed only on success**, with a per-user weekly quota, a per-user
  daily cap, and a global daily kill-switch.

## Getting started

```bash
cd petmotion
npm install
cp .env.example .env        # fill in Supabase + RevenueCat public keys
```

### Backend (Supabase)

```bash
supabase start                       # local stack
supabase db push                     # apply migrations/
supabase db execute -f supabase/seed.sql
supabase functions serve             # create-job / get-job / delete-account
# server-only secrets:
supabase secrets set PROVIDER=mock BYTEPLUS_API_KEY=... RC_SECRET_KEY=... \
  MAX_DAILY_JOBS=10 GLOBAL_MAX_DAILY_JOBS=500 WEEKLY_QUOTA=30
```

### App

```bash
npm start                            # Expo dev server
npm run typecheck                    # tsc --noEmit
```

With `PROVIDER=mock` and no `RC_SECRET_KEY`, the whole loop works: browse →
upload → Generate (entitlement bypassed in dev) → status screen → a sample MP4
returns after ~20s → result screen with save/share.

### Going live
1. Set `PROVIDER=byteplus` and a real `BYTEPLUS_API_KEY` (verify the model id /
   base URL in `providers/byteplus.ts` against current ModelArk docs).
2. Configure RevenueCat offering `default` with `pm_weekly_699` + `pm_annual_3999`,
   entitlement `pro`; set the client keys and `RC_SECRET_KEY`.
3. Add `assets/` icons, host privacy/terms pages, then `eas build` → TestFlight.

## Environment variables

Client (public, safe to ship): `EXPO_PUBLIC_SUPABASE_URL`,
`EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY`.

Server (secret, Edge Functions only): `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `BYTEPLUS_API_KEY`,
`RC_SECRET_KEY`, `PROVIDER`, `MAX_DAILY_JOBS`, `GLOBAL_MAX_DAILY_JOBS`,
`WEEKLY_QUOTA`.
