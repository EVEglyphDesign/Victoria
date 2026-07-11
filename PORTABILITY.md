# Portability & independence

This project is built so that **no one has to pay for anything to participate**, and so that **no outside service is load-bearing**. If any single tool disappeared tomorrow, the project keeps working.

## The chain, end to end

| Piece | Who hosts it | Cost to participate | If it vanished |
|---|---|---|---|
| The repo (source of truth) | GitHub, public | **Free** | Every file is also on your own device (see backup) |
| The live map | GitHub Pages | **Free** | Rebuild from the repo in minutes; or open `artifacts/.../dist/public/index.html` locally |
| The build/automation | GitHub Actions | **Free** on public repos | Run `npx vite build` yourself; it's one command |
| Map tiles / fonts | OpenStreetMap · CARTO · Google/Fontshare fonts | **Free** | Cosmetic only — swap any tile/font provider |
| Perplexity | Perplexity | Paid — **optional** | Nothing breaks. It is a convenience, never a dependency. |

**Perplexity is not in the chain.** It was used to help *create* this, but nothing here calls it, needs it, or costs money because of it. The live map is a fully static site: no backend, no API keys, no accounts required to view it.

## Prove it yourself

The map runs from plain static files. To confirm there's no hidden dependency:

```bash
cd artifacts/triangulation-map
npm ci
npx vite build          # produces dist/public — pure HTML/CSS/JS
npx serve -s dist/public # serve it from anywhere; it just works
```

No secrets, no server, no external service is required for the build or to run it.

## Walk-away guarantee

Because everything is in this public repo and can be downloaded to any device (see [`DAY-1.md`](DAY-1.md), section D), you can leave at any time and keep the whole thing. Delete the online copies, keep yours. That option never expires and never costs anything.
