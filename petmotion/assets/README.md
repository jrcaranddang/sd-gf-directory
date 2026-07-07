# Assets

`app.json` references these files. They are **placeholders you must add** before
an EAS build (M6). Until then, `expo start` will warn but still run.

| File | Size | Notes |
|---|---|---|
| `icon.png` | 1024×1024 | App icon |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground |
| `splash.png` | 1284×2778 | Splash, on `#0B0B12` |
| `notification-icon.png` | 96×96 | White-on-transparent for Android push |

Generate these from the Dreamina brand assets (spec §7 M6). Template preview
videos live in Supabase Storage (`pet-results/previews/…`), not here — see
`supabase/seed.sql`.
