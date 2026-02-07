# San Diego Gluten-Free Directory - Revenue Generation Plan

## Current State

- Single static HTML file (~1,650 lines) with inline CSS, JS, and data
- 40 hardcoded restaurants in a JavaScript array
- Functional search/filters (neighborhood, GF level, cuisine)
- Generic design (Inter/Poppins, green gradients, emoji-heavy) — functional but forgettable
- Hosted on GitHub (`jrcaranddang/sd-gf-directory`)
- **Zero monetization, zero analytics, zero email capture**

---

## Phase 1: Foundation (Week 1-2) — $0 Cost

Prerequisites for all monetization. No revenue is possible without traffic data and audience capture.

### 1.0 Design Refresh

The current site uses a generic green-gradient-on-cream palette with Inter/Poppins — clean but forgettable. A distinctive visual identity builds trust, increases time-on-site, and is essential for charging restaurants for sponsored placements. Nobody pays to be featured on a site that looks templated.

#### Design Problems to Fix

- **Generic fonts:** Inter and Poppins are the default "AI-generated site" typefaces
- **Timid color palette:** Muted greens on cream reads as a health food blog, not a curated local guide
- **Uniform card grid:** Every card looks identical — no visual hierarchy, no reason for a restaurant to pay for premium placement
- **Emoji overload:** Wheat emoji hero icon, food emojis floating in background, emoji-based contact info — reads as unpolished
- **No photography or texture:** Pure flat design with no sense of place (San Diego)
- **No brand identity:** No logo, no wordmark, nothing memorable

#### Design Direction: "California Coastal Editorial"

Evoke the feel of a curated local magazine — warm, confident, editorial. San Diego sun, ocean proximity, taco shops and craft coffee. Not a clinical health resource; a beautiful guide you'd bookmark.

#### Typography

- [ ] **Headlines:** [Fraunces](https://fonts.google.com/specimen/Fraunces) — a warm, characterful variable serif with optical sizing. Feels editorial and handcrafted, not corporate.
- [ ] **Body:** [Outfit](https://fonts.google.com/specimen/Outfit) — geometric sans-serif with a friendly, modern feel. Distinctive without sacrificing readability.
- [ ] **Accent/Monospace (badges, labels):** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — for GF rating badges and small labels, adds a utilitarian trustworthy feel.
- [ ] Use `font-variation-settings` for Fraunces to leverage its `WONK` and `opsz` axes for dynamic headings.

#### Color Palette

Move from generic green to a warm, sun-bleached coastal palette with a bold accent:

```css
:root {
  /* Sand & warmth */
  --bg-primary: #faf6f1;         /* Warm linen */
  --bg-secondary: #f0ebe4;      /* Dry sand */
  --bg-card: #ffffff;

  /* Deep ocean ink */
  --text-primary: #1a1a2e;      /* Near-black navy */
  --text-secondary: #4a4a68;    /* Muted indigo-gray */
  --text-tertiary: #8888a0;     /* Soft lavender-gray */

  /* Terracotta accent — bold, San Diego sunset warmth */
  --accent-primary: #c45d3e;    /* Burnt terracotta */
  --accent-hover: #a94b2f;      /* Deeper terracotta */

  /* Trust signals */
  --gf-verified: #2a7d5f;       /* Deep sage (100% GF) */
  --gf-dedicated: #5a9e7c;      /* Medium sage */
  --gf-menu: #d4a853;           /* Warm gold */
  --gf-options: #7b8fb2;        /* Dusty blue */

  /* Borders & shadows */
  --border: #e4dfd8;
  --shadow-sm: 0 1px 3px rgba(26, 26, 46, 0.06);
  --shadow-md: 0 4px 12px rgba(26, 26, 46, 0.08);
  --shadow-lg: 0 12px 40px rgba(26, 26, 46, 0.12);
}
```

- [ ] Implement new CSS custom properties
- [ ] Dark mode variant (deep navy `#0f0f23` background, warm text) — adds perceived quality
- [ ] Dark mode toggle in navigation

#### Layout & Cards

- [ ] **Hero redesign:** Replace emoji icon with a custom SVG wordmark/logotype. Full-width hero with a subtle topographic/contour map pattern of San Diego coastline as background texture (CSS-only, no image dependency). Large, confident headline set in Fraunces with generous line-height.
- [ ] **Card hierarchy:** Two card designs:
  - **Standard card:** Clean, minimal — white card with left-border color accent based on GF level. No gradient headers. Restaurant name in Fraunces, details in Outfit.
  - **Featured card:** Wider (spans 2 columns on desktop), subtle warm background tint, gold "Featured" pill badge, slightly larger type. This is what restaurants pay for — it must look visibly premium without being garish.
- [ ] **Grid refinement:** Move from uniform 3-column to a magazine-style layout where featured cards break the grid rhythm. Consider a masonry-like approach for visual interest.
- [ ] **Neighborhood grouping option:** Visual section dividers when browsing by neighborhood, with a subtle map pin illustration.

#### Micro-interactions & Motion

- [ ] Replace anime.js with CSS-only animations (reduce dependency, better performance)
- [ ] Page load: Staggered card reveals using `animation-delay` on CSS `@keyframes` — cards fade up in sequence (50ms stagger)
- [ ] Card hover: Subtle lift (`translateY(-4px)`) + shadow expansion. No scale transform (feels cheap at scale).
- [ ] Search focus: Input border transitions from `--border` to `--accent-primary` with a soft glow
- [ ] Filter change: Cards crossfade using CSS `opacity` + `transform` transitions (JS toggles classes)
- [ ] GF badge: Subtle shimmer effect on "100% Gluten-Free" badges (CSS gradient animation) — draws the eye to highest-trust listings
- [ ] Scroll-triggered entrance: Use `IntersectionObserver` + CSS classes (no JS animation library)
- [ ] Remove: floating food emojis, heartbeat animation, search icon wiggle, CTA pulse — all read as unpolished

#### Backgrounds & Texture

- [ ] **Hero:** Layered CSS background — subtle topographic contour line pattern (SVG data URI) over a warm gradient (`#1a1a2e` to `#2d2d5e`). Feels like a printed map.
- [ ] **Body:** Warm linen `--bg-primary` with a faint paper grain texture (CSS `noise` filter or tiny SVG pattern at 3% opacity)
- [ ] **Section dividers:** Soft wave or coastal horizon line SVG between major sections (hero → stats → directory) — nods to San Diego's coastline without being literal
- [ ] **Card backgrounds:** Pure white for contrast against the warm body. Featured cards get a barely-there warm tint (`rgba(196, 93, 62, 0.03)`)

#### Component Polish

- [ ] **GF trust badges:** Redesign as clean pills with icon + text. Replace emoji prefixes with small SVG icons (checkmark, star, clipboard, diamond). Color-coded by GF level using the palette above.
- [ ] **Rating display:** Replace emoji stars with a custom SVG star component. Partial fills for half-stars. Compact layout.
- [ ] **Contact info block:** Clean icon set (map pin, phone, globe) using inline SVGs instead of emoji. Consistent 16px icon size.
- [ ] **Price indicator:** Styled as a discrete pill (`$` / `$$` / `$$$`) with muted background rather than bold orange text.
- [ ] **Navigation bar:** Add a sticky nav with: wordmark/logo, search toggle, dark mode toggle, "Submit a Restaurant" CTA button in `--accent-primary`. Appears after scrolling past hero.
- [ ] **Footer:** Dark section (`--text-primary` background) with warm text. Three-column layout: About / Quick Links / Newsletter signup. No floating emoji hearts.

#### Responsive Refinements

- [ ] Mobile: Single-column cards, bottom-sheet filter panel (slides up), sticky search bar
- [ ] Tablet: 2-column grid, featured cards still span full width
- [ ] Desktop: 3-column with featured cards spanning 2 columns
- [ ] Touch devices: Replace hover effects with active/tap states

### 1.1 Migrate to Astro

- [ ] Initialize Astro project
- [ ] Extract restaurant data from inline JS to `src/data/restaurants.json`
- [ ] Create `BaseLayout.astro` with existing CSS/fonts
- [ ] Create `RestaurantCard.astro` component
- [ ] Create `SearchFilter.astro` component (client-side island)
- [ ] Rebuild homepage (`src/pages/index.astro`)
- [ ] Verify parity with current site (search, filters, animations)

**Why Astro:** Static-first (fast, free hosting on Vercel), multi-page SEO, markdown blog support, interactive islands for search/filter.

### 1.2 Individual Restaurant Pages

- [ ] Create `src/pages/restaurants/[slug].astro` dynamic route
- [ ] Generate slug from restaurant name (e.g., `true-food-kitchen`)
- [ ] Each page includes: full restaurant details, map embed, Schema.org JSON-LD, back-to-directory link
- [ ] Add internal links from directory cards to individual pages

**Why:** Each restaurant page is a unique keyword target (e.g., "True Food Kitchen gluten free San Diego"). Single-page sites cannot rank for individual restaurants.

### 1.3 SEO Foundation

- [ ] Add Schema.org `Restaurant` structured data (JSON-LD) on every restaurant page
- [ ] Add Schema.org `ItemList` on the homepage
- [ ] Generate `sitemap.xml` (Astro plugin: `@astrojs/sitemap`)
- [ ] Add `robots.txt`
- [ ] Add canonical URLs
- [ ] Add Open Graph and Twitter Card meta tags on all pages
- [ ] Add favicon and apple-touch-icon

### 1.4 Analytics

- [ ] Add Google Analytics 4 snippet to `BaseLayout.astro`
- [ ] Track events: search usage, filter clicks, outbound restaurant link clicks, newsletter signup
- [ ] Set up GA4 goals: newsletter signup, restaurant page view, outbound click

### 1.5 Email Capture

- [ ] Create `NewsletterSignup.astro` component
- [ ] Place in hero section and footer
- [ ] Copy: "Get weekly GF restaurant finds & celiac-safe dining tips"
- [ ] Integrate with free tier of ConvertKit, Buttondown, or Mailchimp
- [ ] Set up welcome email automation

### 1.6 Fix the Basics

- [ ] Replace `gf-sd@example.com` with real contact (Tally form or real email)
- [ ] Add "Submit a Restaurant" form (Tally or Google Form embed)
- [ ] Add social sharing buttons on restaurant cards and pages

---

## Phase 2: Traffic Growth (Week 2-6) — ~$12/year

Without traffic, monetization is impossible. This phase builds organic search presence.

### 2.1 Custom Domain

- [ ] Purchase domain: `sdglutenfree.com` or similar (~$12/year)
- [ ] Configure DNS with Vercel
- [ ] Enable SSL (automatic on Vercel)
- [ ] Redirect www to non-www (or vice versa)

### 2.2 Blog / Content Hub

- [ ] Add blog engine using Astro content collections (markdown-based)
- [ ] Create `src/pages/blog/[slug].astro`
- [ ] Create `src/content/blog/` directory for markdown posts
- [ ] Write 5 seed blog posts targeting high-value keywords:
  - "Best Gluten-Free Pizza in San Diego"
  - "Celiac-Safe Restaurants in La Jolla"
  - "San Diego Gluten-Free Brunch Guide"
  - "100% Gluten-Free Restaurants in San Diego"
  - "How to Eat Gluten-Free in the Gaslamp Quarter"
- [ ] Each post links to relevant directory listings
- [ ] Add blog index page with recent posts

### 2.3 Social Presence

- [ ] Create Instagram account for the brand
- [ ] Add social media links to site footer
- [ ] Add share buttons (copy link, share to X/Instagram/Facebook) on each restaurant page
- [ ] Post directory link to r/sandiego, r/glutenfree, r/celiac (Tuesday 9-11 AM PST)

### 2.4 Enrich Restaurant Data

- [ ] Add fields to `restaurants.json`: `hours`, `photoUrl`, `mapEmbedUrl`, `menuUrl`, `allergyNotes`
- [ ] Add Google Maps iframe embed on each restaurant page
- [ ] Source photos (public domain or request from restaurants)
- [ ] Improve notes with detailed celiac safety info

---

## Phase 3: Revenue Streams (Month 2-4)

Traffic data, email list, and SEO presence are now in place. Time to monetize.

### 3.1 Featured / Sponsored Listings — Target: $225-$1,000/month

This is the #1 revenue model for directory sites.

- [ ] Create `FeaturedBadge.astro` component (gold/premium card styling)
- [ ] Featured restaurants appear at top of directory with a "Featured" badge
- [ ] Add `featured: true` and `featuredUntil: "2026-04-01"` fields to restaurant data
- [ ] Create a "Get Featured" page explaining the program and pricing
- [ ] Pricing tiers:
  - **Basic** ($50/month): "Featured" badge, priority in search results
  - **Premium** ($150/month): Featured badge + dedicated spotlight in newsletter + blog mention
  - **Celiac Verified** ($200/month): On-site verification badge (highest trust signal)
- [ ] Outreach first to 100% GF restaurants (Cafe Gratitude, Trilogy Sanctuary, True Food Kitchen)
- [ ] Create Stripe checkout or simple invoice flow

### 3.2 Affiliate Revenue — Target: $100-$500/month

- [ ] Add OpenTable/Resy reservation links (affiliate programs pay per booking)
- [ ] Add Amazon Associates links in blog posts for GF products
- [ ] Add GF meal delivery affiliate links (Schär, Glutenfreeda, etc.)
- [ ] Track affiliate click-through in GA4
- [ ] Add disclosure: "This site contains affiliate links"

### 3.3 Display Advertising — Target: $225-$450/month (at 15k sessions)

- [ ] Create `AdSlot.astro` component for consistent ad placement
- [ ] Apply for Google AdSense once traffic qualifies
- [ ] Graduate to Mediavine at 50k sessions/month (higher RPM)
- [ ] Ad placements: between restaurant rows, sidebar on blog posts, footer
- [ ] Niche health/food content CPMs: $15-30 RPM

### 3.4 Newsletter Sponsorships — Target: $50-$150/week

- [ ] Launch weekly "San Diego GF Finds" newsletter
- [ ] Content: new restaurant additions, seasonal picks, reader tips
- [ ] Sponsored slot: local GF bakery, restaurant, or specialty store featured
- [ ] At 1,000+ subscribers, charge $50-150 per sponsored issue

---

## Phase 4: Scale (Month 4-12)

### 4.1 Restaurant Dashboard

- [ ] Let restaurants "claim" their listing and update info
- [ ] Free tier: basic listing with self-service edits
- [ ] Paid tier ($99-$199/month): analytics on views/clicks, featured placement, promoted deals

### 4.2 User Reviews & Community

- [ ] Add user review/rating system
- [ ] Each review = new SEO content (user-generated)
- [ ] Moderation workflow to maintain quality
- [ ] Flywheel: more content -> more SEO -> more traffic -> more reviews

### 4.3 Progressive Web App (PWA)

- [ ] Add service worker for offline support
- [ ] Add web app manifest for "Add to Home Screen"
- [ ] Push notifications for new restaurant additions

### 4.4 Expand to Other Cities

- [ ] Template the architecture for replication
- [ ] Target: Los Angeles, San Francisco, Phoenix, Portland
- [ ] Each city = new subdomain or domain = new revenue stream
- [ ] Multiply all revenue streams per city

---

## Target Architecture

```
sd-gf-directory/
├── src/
│   ├── pages/
│   │   ├── index.astro                # Homepage with directory grid
│   │   ├── restaurants/
│   │   │   └── [slug].astro           # Individual restaurant pages
│   │   ├── blog/
│   │   │   ├── index.astro            # Blog listing
│   │   │   └── [slug].astro           # Blog post pages
│   │   ├── get-featured.astro         # Sponsorship info page
│   │   └── submit.astro               # Submit a restaurant
│   ├── components/
│   │   ├── BaseLayout.astro
│   │   ├── RestaurantCard.astro
│   │   ├── FeaturedCard.astro         # Premium sponsored card
│   │   ├── SearchFilter.astro         # Client-side interactive island
│   │   ├── NewsletterSignup.astro
│   │   ├── AdSlot.astro
│   │   ├── ShareButtons.astro
│   │   └── SchemaMarkup.astro         # JSON-LD structured data
│   ├── content/
│   │   └── blog/                      # Markdown blog posts
│   ├── data/
│   │   └── restaurants.json           # Restaurant data (single source of truth)
│   └── styles/
│       └── global.css
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── images/
├── astro.config.mjs
├── package.json
└── PLAN.md
```

---

## Revenue Projections (Conservative)

| Timeline | Monthly Traffic | Revenue Streams | Est. Monthly Revenue |
|----------|----------------|-----------------|---------------------|
| Month 1-2 | 500-1,000 visits | None (building foundation) | $0 |
| Month 3-4 | 2,000-5,000 visits | 2-3 sponsored listings + affiliates | $200-$500 |
| Month 6 | 5,000-10,000 visits | 5 sponsors + affiliates + newsletter | $500-$1,500 |
| Month 12 | 15,000-30,000 visits | Full monetization stack | $1,500-$4,000 |

---

## Key Metrics to Track

- **Traffic:** Monthly sessions, organic search traffic, top landing pages
- **Engagement:** Search usage rate, avg. pages/session, time on site, bounce rate
- **Conversion:** Newsletter signups, outbound clicks to restaurants, affiliate clicks
- **Revenue:** Sponsored listing MRR, affiliate commissions, ad revenue, newsletter sponsorship
- **SEO:** Keyword rankings for target terms, indexed pages, backlinks

---

## Implementation Priority

If building sequentially, this is the order:

1. Migrate to Astro + extract data to JSON
2. **Design refresh** — new typography, color palette, card hierarchy, remove emoji/anime.js
3. Generate individual restaurant pages with Schema.org
4. Add sticky nav, dark mode toggle, featured card variant
5. Add analytics (GA4)
6. Add email capture (newsletter signup)
7. Add sitemap, robots.txt, OG tags, favicon
8. Fix contact email + add submit form
9. Purchase domain + deploy to Vercel
10. Add blog engine + write 3-5 seed posts
11. Create "Get Featured" page with pricing
12. Add affiliate links
13. Social sharing + Reddit launch posts
14. Begin restaurant outreach for sponsored listings
