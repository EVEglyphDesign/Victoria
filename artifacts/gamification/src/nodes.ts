// ─────────────────────────────────────────────────────────────────────────
// Minimal vector metadata for the gamification engine — reflected from the
// shipped Victoria build (github.com/EVEglyphDesign/Victoria). Faithful copy
// of the Vector type and VECTOR_META values the JourneyPanel depends on.
// Trimmed to only what the gamification engine references (color/label per
// vector); map-geometry types stay in the Victoria build.
// © 2026 Dany Theriault · EVE Glyph Umbrella · Pour le bien-être du peuple.
// ─────────────────────────────────────────────────────────────────────────

export type Vector = "center" | "technology" | "faith" | "ancestry";

export const VECTOR_META: Record<
  Vector,
  { label: string; color: string; axis: string; twinLayer: string }
> = {
  center: {
    label: "The Center",
    color: "#f4c430", // gold — the convergence point
    axis: "Convergence",
    twinLayer: "The person — where all three vectors resolve",
  },
  technology: {
    label: "Technology Vector",
    color: "#e2574c", // ember red — steel / fire
    axis: "Points east, across the Indian Ocean to Asia",
    twinLayer: "Capability layer — what the twin can build",
  },
  faith: {
    label: "Faith Vector",
    color: "#4a90d9", // marian blue
    axis: "Points north, up the meridian to the Mediterranean",
    twinLayer: "Values layer — the ethical frame it reasons under",
  },
  ancestry: {
    label: "Ancestry Vector",
    color: "#5aa469", // earth green
    axis: "Runs the NW\u2013SE Bantu migration diagonal",
    twinLayer: "Identity substrate — the base data that makes the twin her",
  },
};
