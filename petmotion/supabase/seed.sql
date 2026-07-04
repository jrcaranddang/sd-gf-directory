-- Seed 5 launch templates (spec §7 M1). Preview URLs are placeholders — replace
-- with real Supabase Storage public URLs (assets from Dreamina).
-- The {SUBJECT} slot is substituted server-side in create-job.

insert into public.templates (id, title, category, preview_url, prompt, duration_seconds, aspect_ratio, audio_enabled, sort_order)
values
  (
    'hero_cape',
    'Super Pet',
    'epic',
    'https://PLACEHOLDER.supabase.co/storage/v1/object/public/pet-results/previews/hero_cape.mp4',
    'Cinematic shot of {SUBJECT} wearing a flowing superhero cape, standing heroically on a rooftop at golden hour as the cape billows in the wind. Epic orchestral energy, slow dramatic camera push-in, volumetric light.',
    5, '9:16', true, 10
  ),
  (
    'happy_dance',
    'Happy Dance',
    'funny',
    'https://PLACEHOLDER.supabase.co/storage/v1/object/public/pet-results/previews/happy_dance.mp4',
    '{SUBJECT} joyfully dancing on two legs to an upbeat beat, bobbing head and wiggling, colorful party lights and confetti, playful and goofy, bouncy camera.',
    5, '9:16', true, 20
  ),
  (
    'cozy_fireplace',
    'Cozy Evening',
    'heartwarming',
    'https://PLACEHOLDER.supabase.co/storage/v1/object/public/pet-results/previews/cozy_fireplace.mp4',
    '{SUBJECT} curled up peacefully by a warm crackling fireplace, soft blanket, gentle firelight flickering, calm and tender mood, slow breathing, soft ambient piano.',
    5, '9:16', true, 30
  ),
  (
    'astronaut',
    'Space Explorer',
    'epic',
    'https://PLACEHOLDER.supabase.co/storage/v1/object/public/pet-results/previews/astronaut.mp4',
    '{SUBJECT} as an astronaut floating inside a spaceship cockpit, stars and Earth visible through the window, weightless floating motion, wonder and awe, cinematic sci-fi.',
    5, '9:16', true, 40
  ),
  (
    'santa_helper',
    'Santa''s Helper',
    'seasonal',
    'https://PLACEHOLDER.supabase.co/storage/v1/object/public/pet-results/previews/santa_helper.mp4',
    '{SUBJECT} wearing a tiny Santa hat surrounded by falling snow and twinkling Christmas lights, festive and cheerful, gentle snowfall, warm holiday music.',
    5, '9:16', true, 50
  )
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  preview_url = excluded.preview_url,
  prompt = excluded.prompt,
  duration_seconds = excluded.duration_seconds,
  sort_order = excluded.sort_order;
