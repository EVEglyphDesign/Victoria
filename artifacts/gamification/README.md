# Gamification Engine — live page (public reflection)

This is the **public reflection (fork)** of the gamification engine whose canon
source of truth lives in the private
[`eve-glyph-education`](https://github.com/EVEglyphDesign/eve-glyph-education)
repo at `game/gamification-engine/`. It is reflected here into the public
Victoria repo so it can be **served live on GitHub Pages** (private repos can't
publish Pages on the free plan; Victoria is public).

## Live URL

Published at **`/gamification/`** on the Victoria Pages site:
<https://eveglyphdesign.github.io/Victoria/gamification/>

The triangulation map still serves at the root (`/`); this page is additive and
does not change it.

## What it is

`JourneyPanel` mounted as a standalone page: repo-as-save-file twin score,
certification tiers (Unmapped → Sovereign Twin), and guided quests — read live
from the public GitHub contents API. No accounts, no backend, no vendor lock-in.

The engine files here (`src/progress.ts`, `src/nodes.ts`, `src/JourneyPanel.tsx`)
are reflected copies of the EDU-canon originals. The canon repo is the source of
truth; changes flow EDU → here.

## Build

Built entirely on GitHub's servers by `.github/workflows/deploy-map.yml`, which
builds both the map and this page and deploys them as one Pages artifact.
Locally:

```bash
cd artifacts/gamification
npm install
npm run build   # static output to dist/
```

---

© 2026 Dany Theriault. EVE “digital stem cell” glyph and glyph-based design principles — all rights reserved. Stewardship of rights of use and assignment for large public and institutional usage rests with the Pacific Utilities Design Council. Published as a time-stamped record of authorship and intent.

*Pour le bien-être du peuple.*
