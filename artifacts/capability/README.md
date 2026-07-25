# Capability demonstration — single-surface delivery

Live: https://eveglyphdesign.github.io/Victoria/capability/

A public, static overview surface that frames Victoria's three working proof
points as one single-surface delivery capability demonstration:

1. **Interactive geospatial model** — the triangulation map at `/` (root).
2. **Live progress engine** — the gamification engine at `/gamification/`.
3. **Enterprise reference assessment** — the seven-dimension wireframe at `/assessment/`.

## Purpose

This surface exists to **demonstrate the wireframing-to-production delivery
capability** — not to be the product itself. Framing is deliberately **neutral
and capability-focused** (single-surface delivery, portable/forkable, live-not-
mocked, demo-now/tool-later). Any programme-, sector-, or audience-specific
context (e.g. a specific nonprofit initiative and the challenges it faces) is
kept **off this public surface** and carried in a private brief in the canon
repository (`eve-glyph-education`), not on the page.

## Build & serve

Self-contained static `index.html` — Fontshare CDN fonts (General Sans + Zodiak)
only, no build step, no backend, no runtime dependency on Perplexity or any
platform. Matches the map's design tokens (dark `#0a0a0a` surface, primary blue
`hsl(221 83% 53%)`, gold `#f4c430` accent, serif display).

Served by the `deploy-map.yml` Pages workflow, which copies
`artifacts/capability/index.html` → `_site/capability/index.html`.

Relative links only: card links use `../`, `../gamification/`, `../assessment/`
so they resolve correctly under the `/Victoria/` Pages base path.

## Canon

Standalone. The private brief and any programme framing live in
`eve-glyph-education` as the source of truth. This surface is a public
capability showcase derived from that intent.

---

© 2026 Dany Theriault. EVE “digital stem cell” glyph and glyph-based design principles — all rights reserved. Stewardship of rights of use and assignment for large public and institutional usage rests with the Pacific Utilities Design Council. Published as a time-stamped record of authorship and intent.

pour le bien-être du peuple
