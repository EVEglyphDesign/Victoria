// ─────────────────────────────────────────────────────────────────────────
// EVE Glyph adaptive-game gamification engine — reflected into the EDU canon.
// Source of truth: the shipped Victoria build
//   github.com/EVEglyphDesign/Victoria  (artifacts/triangulation-map/…)
// Copied verbatim so the canon repo carries the real deployed engine.
// See ./README.md for how this maps to design/spinning-sphere-simulation.md.
// © 2026 Dany Theriault · EVE Glyph Umbrella · Pour le bien-être du peuple.
// ─────────────────────────────────────────────────────────────────────────
// Repo-as-save-file progress engine.
//
// Reads the PUBLIC GitHub contents API to see how many real files she has
// committed into each twin-layer folder. No auth, no backend, no Perplexity —
// just a public read of her own repository. The repo IS the save file, so
// progress is portable across any device and survives forever.

// ── HANDOFF: this is the ONLY thing to change when the repo moves to her ──
// The game reads progress live from this public repo. It lives under your
// account (EVEglyphDesign) until she has her own GitHub. When you fork/transfer
// it to her, change these two values to her owner + repo name and rebuild.
// Nothing else needs to change.
export const REPO_OWNER = "EVEglyphDesign";
export const REPO_NAME = "Victoria";

// Which folder feeds which twin layer / vector.
export const LAYERS = [
  { key: "identity", label: "Identity", vector: "ancestry", folder: "identity" },
  { key: "capability", label: "Capability", vector: "technology", folder: "capability" },
  { key: "values", label: "Values", vector: "faith", folder: "values" },
] as const;

export type LayerKey = (typeof LAYERS)[number]["key"];

export interface LayerProgress {
  key: LayerKey;
  label: string;
  vector: string;
  filled: boolean; // has at least one real contributed file
  count: number; // number of contributed files (excluding the template README)
}

export interface Progress {
  layers: LayerProgress[];
  filledLayers: number; // 0..3
  totalFiles: number;
  score: number; // 0..100 twin-completeness score
  tier: Tier;
  loading: boolean;
  error: string | null;
}

export interface Tier {
  level: number;
  name: string;
  blurb: string;
}

// Certification tiers, tied to score thresholds.
export const TIERS: Tier[] = [
  { level: 0, name: "Unmapped", blurb: "The point is marked. Nothing measured yet." },
  { level: 1, name: "First Bearing", blurb: "One line drawn. A direction exists." },
  { level: 2, name: "Cross-Fixed", blurb: "Two lines cross. No longer a guess." },
  { level: 3, name: "Triangulated", blurb: "Three lines agree. A confirmed point." },
  { level: 4, name: "Sphere Forming", blurb: "Depth on every axis. The model rounds out." },
  { level: 5, name: "Sovereign Twin", blurb: "Measured from every side. Fully her own." },
];

function tierForScore(score: number, filledLayers: number): Tier {
  if (score >= 100) return TIERS[5];
  if (score >= 75) return TIERS[4];
  if (filledLayers >= 3) return TIERS[3];
  if (filledLayers === 2) return TIERS[2];
  if (filledLayers === 1) return TIERS[1];
  return TIERS[0];
}

// The folder README is template scaffolding, not her contribution. Ignore it.
const TEMPLATE_FILES = new Set(["readme.md", "README.md"]);

async function countLayerFiles(folder: string): Promise<number> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folder}`;
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) {
    if (res.status === 404) return 0;
    throw new Error(`GitHub API ${res.status}`);
  }
  const items = (await res.json()) as Array<{ name: string; type: string }>;
  return items.filter(
    (it) => it.type === "file" && !TEMPLATE_FILES.has(it.name) && !it.name.startsWith(".")
  ).length;
}

export async function fetchProgress(): Promise<Progress> {
  const layers: LayerProgress[] = [];
  let totalFiles = 0;

  for (const layer of LAYERS) {
    const count = await countLayerFiles(layer.folder);
    totalFiles += count;
    layers.push({
      key: layer.key,
      label: layer.label,
      vector: layer.vector,
      filled: count > 0,
      count,
    });
  }

  const filledLayers = layers.filter((l) => l.filled).length;

  // Score: getting all three layers off zero is worth 60 (the triangulation).
  // Depth beyond the first file in each layer earns the remaining 40, capped.
  const breadth = (filledLayers / 3) * 60;
  const depthFiles = layers.reduce((sum, l) => sum + Math.max(0, l.count - 1), 0);
  const depth = Math.min(40, depthFiles * 8);
  const score = Math.round(breadth + depth);

  return {
    layers,
    filledLayers,
    totalFiles,
    score,
    tier: tierForScore(score, filledLayers),
    loading: false,
    error: null,
  };
}

// Guided quests — live checkmarks computed from real repo state.
export interface Quest {
  id: string;
  label: string;
  done: (p: Progress) => boolean;
}

export const QUESTS: Quest[] = [
  {
    id: "identity",
    label: "Add your first Identity file (who you are)",
    done: (p) => !!p.layers.find((l) => l.key === "identity")?.filled,
  },
  {
    id: "capability",
    label: "Add your first Capability file (what you can do)",
    done: (p) => !!p.layers.find((l) => l.key === "capability")?.filled,
  },
  {
    id: "values",
    label: "Add your first Values file (how you decide)",
    done: (p) => !!p.layers.find((l) => l.key === "values")?.filled,
  },
  {
    id: "triangulated",
    label: "Fill all three layers — reach a confirmed point",
    done: (p) => p.filledLayers >= 3,
  },
  {
    id: "depth",
    label: "Go deeper: add a second file to any layer",
    done: (p) => p.layers.some((l) => l.count >= 2),
  },
  {
    id: "sphere",
    label: "Round out the sphere — reach a 75+ twin score",
    done: (p) => p.score >= 75,
  },
];
