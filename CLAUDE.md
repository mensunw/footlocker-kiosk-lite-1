# Claude Code Prompt – Footlocker Kiosk Lite Video (Portrait, Looping, Next.js App Router)

> **Objective**: Build a portrait, looping kiosk video experience for Foot Locker using **Next.js App Router**. The app must be on-brand, include the OptiSigns logo, highlight promos and Jordan new arrivals, and showcase a 360° sneaker segment with clear CTAs. Output two stylistic variations (V1 & V2).

---

## Inputs & Brand Guardrails

* **Brand**: Foot Locker — black (#000), white (#FFF), optional red (#E01A2E). Bold, confident, minimalist.
* **Logos**:

  * `/public/assets/footlocker/footlocker-logo.svg`
  * `/public/assets/optisigns/optisigns-logo.svg`
* **Fonts**: ITC Bauhaus Heavy / Bauhaus 93, Montserrat Extra Bold/Black, Gotham Bold/Black, Roboto Black, Futura Extra Bold (fallback via Google Fonts).
* **Copy blocks**:

  * *Step Into the Culture*, *Own Your Style*, *Don’t Miss the Drop*, *Fresh Jordan Arrivals*, *The Drop Never Stops*, *Your Sneakers. Your Story. Your Foot Locker.*
  * For 360 scene: *Spin. Zoom. Explore.* + *Tap to take control. Interact with the latest sneaker in full 360°.*
* **Data**: `/public/data/new_arrivals_jordan.json` with `{image,name,price}`.

---

## Technical Requirements

* **Framework**: Next.js 14+ (App Router).
* **Resolution**: 1080×1920, portrait.
* **Looping**: 30s loop, seamless start/end.
* **No audio** by default.

### App Structure

```
project/
  app/
    kiosk/
      preview/page.tsx       # Renders a frame by ?frame&variant params
      play/page.tsx          # Client-only playback loop
  components/kiosk/
    LogoStamp.tsx
    Copy.tsx
    ImageSequence.tsx
    ProductGrid.tsx
  lib/
    timeline_V1.json
    timeline_V2.json
    styles.tokens.json
  public/
    assets/
      footlocker/footlocker-logo.svg
      optisigns/optisigns-logo.svg
      shoes/demo_1.png
      shoes/demo_2.png
      shoes/demo_3.png
    data/new_arrivals_jordan.json
  scripts/
    build.kiosk-lite.mjs     # puppeteer+ffmpeg exporter
  build/                     # generated frames & mp4s
```

### Timeline JSON Contract

```json
{
  "canvas": {"width":1080, "height":1920, "fps":30, "bg":"#000"},
  "scenes": [
    {"id":"S1","start":0,"dur":2,"type":"brand"},
    {"id":"S2","start":2,"dur":3,"type":"copy","text":"Step Into the Culture"},
    {"id":"S3","start":5,"dur":5,"type":"montage","slates":["Own Your Style","The Drop Never Stops"]},
    {"id":"S4","start":10,"dur":6,"type":"spin","headline":"Spin. Zoom. Explore.","sub":"Tap to take control...","sequencePattern":"/assets/shoes/demo_#.png","frames":36},
    {"id":"S5","start":16,"dur":7,"type":"grid","data":"/data/new_arrivals_jordan.json"},
    {"id":"S6","start":23,"dur":7,"type":"cta","text":"Your Sneakers. Your Story. Your Foot Locker."}
  ]
}
```

### Components

* **LogoStamp.tsx** → renders Foot Locker + OptiSigns logos.
* **Copy.tsx** → styled text, sizes pulled from `styles.tokens.json`.
* **ImageSequence.tsx** → renders shoe rotation frames.
* **ProductGrid.tsx** → reads JSON and maps to product tiles.

### Preview & Play

* `/app/kiosk/preview/page.tsx` → server component, outputs a single frame based on URL params.
* `/app/kiosk/play/page.tsx` → client component with requestAnimationFrame to play loop.

### Export (optional)

* `scripts/build.kiosk-lite.mjs`:

  * Spins up Next server if needed.
  * Puppeteer captures frames (`/kiosk/preview?frame=###&variant=V1`).
  * ffmpeg muxes PNGs → `build/kiosk_lite_V1.mp4` & `build/kiosk_lite_V2.mp4`.

---

## Storyboard

**S1 (0–2s)**: Brand open — logos on black.
**S2 (2–5s)**: Hype copy.
**S3 (5–10s)**: Montage with slates.
**S4 (10–16s)**: 360 shoe spin.
**S5 (16–23s)**: New Arrivals grid.
**S6 (23–30s)**: CTA + seamless loop.

---

## Variation Guidance

* **V1**: Stark black/white, minimal red, strong type blocks.
* **V2**: Faster pacing, parallax grids, subtle red gradient accents.

---

## Accessibility & Constraints

* Text ≥ 36px for readability on kiosk.
* No flashing faster than 3 Hz.
* First/last frames aligned for loop.

---

## Tasks for Claude Code

1. Generate the scaffold above in Next.js App Router style.
2. Implement reusable kiosk components.
3. Provide two timeline JSONs and corresponding playback variations.
4. Implement Puppeteer+ffmpeg export script.
5. Include README with run & build steps.

---

## Prompt to Execute

**System/Dev Intent**: You are generating kiosk video content inside a Next.js 14+ App Router project. Must include playback, preview, and export pipeline.

**User Prompt**:
“Inside my initialized Next.js (App Router) project, create a 30s portrait (1080×1920, 30fps) Foot Locker kiosk video with six scenes: brand open, hype copy, promo montage, 360 sneaker viewer, Jordan New Arrivals grid, and final CTA loop. Include Foot Locker + OptiSigns logos, bold black/white/red styling, and ensure accessibility (≥36px text). Implement preview (`/kiosk/preview`) and playback (`/kiosk/play`) routes, reusable components, and a Puppeteer+ffmpeg script to export frames→MP4. Provide two variations (V1,V2) driven by timeline JSONs. Scaffold folders, placeholder assets, and README.”
