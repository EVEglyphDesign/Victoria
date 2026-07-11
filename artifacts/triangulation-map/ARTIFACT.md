# Triangulation Map — the shared starting picture

This is the interactive map that shows the three-vector logic this whole repo is built on: one fixed point (Bukoba, on Lake Victoria), three independent bearings — **technology, faith, ancestry** — all resolving to a single person at the center.

Those three vectors map directly onto the twin layers in this repo:

- **Technology** → **Capability** (`capability/`)
- **Faith** → **Values** (`values/`)
- **Ancestry** → **Identity** (`identity/`)

## See it live

**https://triangulation-bukoba.pplx.app** — open on any phone or laptop. Tap or hover any point to read how it connects to the others and how, together, they form a sphere around the center.

## Run it locally

```bash
npm install
npm run dev
```

The map lives in `client/src/pages/home.tsx`; the point data and the connective narratives are in `client/src/lib/nodes.ts`; the map's built-in Q&A knowledge base is `client/src/lib/qa.json`.
