# SPEC: SDGlutenFree.com Mobile UX (San Diego Local)

## 🎯 The Vision
A "native-feel" web app optimized for the San Diego lifestyle—fast, beach-friendly, and neighborhood-centric. No medical vibes; pure SD lifestyle.

## 📱 Core Mobile UX Principles

### 1. The "Thumb-First" Neighborhood Switcher
*   **The Problem:** San Diego is spread out. People search by where they are *right now*.
*   **The Solution:** A horizontal, icon-based neighborhood carousel at the top of the viewport.
*   **UX Detail:** Icons should represent the vibe (e.g., 🏄‍♂️ for PB/La Jolla, 🍺 for North Park, 🍜 for Convoy).

### 2. The "Safety at a Glance" Score (The Taco Scale)
*   **Visual:** A 5-point scale using a custom icon (🌮 or 🌾).
*   **Function:**
    *   **1-2:** GF options, shared kitchen (Caution).
    *   **3-4:** High awareness, separate prep areas (Safe).
    *   **5:** 100% Dedicated Gluten-Free (The Dream).
*   **Mobile Layout:** This score should be visible on the list view card, no click required.

### 3. "Outdoor Living" Metadata
*   **The SD Factor:** Weather is the reason people live here.
*   **UX Detail:** Every restaurant card must have high-visibility badges for:
    *   `☀️ Patio`
    *   `🐶 Dog Friendly` (Huge in SD)
    *   `🅿️ Easy Parking` (Essential for anxiety-free dining)

### 4. Direct Action Hub
*   **UX Detail:** A persistent bottom action bar on restaurant detail pages:
    *   [ Directions ] | [ Call ] | [ View Menu ]
*   **Integration:** Directions should deep-link directly into Apple/Google Maps.

---

## 🎨 Visual Identity (San Diego Coastal)

| Element | Style | Note |
|---|---|---|
| **Primary Color** | `#00b5cc` (Portal Cyan) | Represents the Pacific / Cleanliness |
| **Accent Color** | `#f59e0b` (Sunset Gold) | Highlights "Dedicated GF" status |
| **Background** | `#f8fafc` (Beach White) | Bright, airy, and high-readability in sunlight |
| **Typography** | `Inter` / `Orbitron` | Modern, clean, and matches the Command Center |

## 🛠️ Next Steps for June
1. **Mockup:** Generate a mobile-first UI mockup using the `DemoVideoGenerator` to visualize the scroll and transitions.
2. **Scraper Upgrade:** Update the `gf-directory` scraper to prioritize "Outdoor Seating" and "Neighborhood" metadata.
3. **PST Sync:** Ensure all "Open Now" logic is hard-coded to PST.

---
*Drafted for Danilo by June 🌤️ | 2026-01-29*
