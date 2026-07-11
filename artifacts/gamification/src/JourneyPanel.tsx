// ─────────────────────────────────────────────────────────────────────────
// EVE Glyph adaptive-game gamification engine — reflected into the EDU canon.
// Source of truth: the shipped Victoria build
//   github.com/EVEglyphDesign/Victoria  (artifacts/triangulation-map/…)
// Copied verbatim so the canon repo carries the real deployed engine.
// See ./README.md for how this maps to design/spinning-sphere-simulation.md.
// © 2026 Dany Theriault · EVE Glyph Umbrella · Pour le bien-être du peuple.
// ─────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { Trophy, CheckCircle2, Circle, RefreshCw, X, Github } from "lucide-react";
import {
  fetchProgress,
  QUESTS,
  TIERS,
  REPO_OWNER,
  REPO_NAME,
  type Progress,
} from "@/lib/progress";
import { VECTOR_META } from "@/lib/nodes";

const EMPTY: Progress = {
  layers: [
    { key: "identity", label: "Identity", vector: "ancestry", filled: false, count: 0 },
    { key: "capability", label: "Capability", vector: "technology", filled: false, count: 0 },
    { key: "values", label: "Values", vector: "faith", filled: false, count: 0 },
  ],
  filledLayers: 0,
  totalFiles: 0,
  score: 0,
  tier: TIERS[0],
  loading: true,
  error: null,
};

export default function JourneyPanel({ onClose }: { onClose: () => void }) {
  const [p, setP] = useState<Progress>(EMPTY);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const next = await fetchProgress();
      setP(next);
    } catch (e) {
      setP((prev) => ({
        ...prev,
        loading: false,
        error: "Couldn't reach GitHub just now — showing last known state.",
      }));
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Sphere ring geometry
  const R = 52;
  const C = 2 * Math.PI * R;
  const dash = (p.score / 100) * C;

  return (
    <div
      className="absolute left-4 top-24 z-[650] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-white/10 bg-[#0d0d0d]/95 p-5 shadow-2xl backdrop-blur-md sm:top-28"
      data-testid="journey-panel"
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        data-testid="button-close-journey"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">
          Your journey
        </p>
      </div>

      {/* Score ring + tier */}
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            {(["ancestry", "technology", "faith"] as const).map((v, i) => {
              // three faint arc guides, one per vector, lit when that layer is filled
              const filled = p.layers.find((l) => l.vector === v)?.filled;
              const seg = C / 3;
              return (
                <circle
                  key={v}
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke={VECTOR_META[v].color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${filled ? seg - 6 : 0} ${C}`}
                  strokeDashoffset={-(i * seg)}
                  opacity={filled ? 0.9 : 0}
                  style={{ transition: "stroke-dasharray 0.8s ease, opacity 0.8s ease" }}
                />
              );
            })}
            {/* overall score progress (thin inner ring) */}
            <circle
              cx="60"
              cy="60"
              r={R - 14}
              fill="none"
              stroke="hsl(43 80% 57%)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(p.score / 100) * (2 * Math.PI * (R - 14))} ${2 * Math.PI * (R - 14)}`}
              opacity="0.85"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-white" data-testid="text-score">
              {p.loading ? "—" : p.score}
            </span>
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/45">Twin score</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">
            Level {p.tier.level} of 5
          </p>
          <p className="mt-0.5 text-lg font-semibold text-white" data-testid="text-tier">
            {p.tier.name}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">{p.tier.blurb}</p>
        </div>
      </div>

      {/* Layer bars — the three vectors closing the sphere */}
      <div className="mt-4 space-y-2">
        {p.layers.map((l) => (
          <div key={l.key} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background: l.filled ? VECTOR_META[l.vector as "faith"].color : "rgba(255,255,255,0.15)",
                boxShadow: l.filled ? `0 0 8px ${VECTOR_META[l.vector as "faith"].color}` : "none",
              }}
            />
            <span className="w-20 shrink-0 text-xs font-medium text-white/80">{l.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, l.count * 40)}%`,
                  background: VECTOR_META[l.vector as "faith"].color,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-[10px] tabular-nums text-white/45">
              {l.count}
            </span>
          </div>
        ))}
      </div>

      {/* Quests */}
      <div className="mt-4">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">Quests</p>
        <div className="space-y-1.5">
          {QUESTS.map((q) => {
            const done = !p.loading && q.done(p);
            return (
              <div key={q.id} className="flex items-start gap-2" data-testid={`quest-${q.id}`}>
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/25" />
                )}
                <span className={`text-xs leading-snug ${done ? "text-white/80 line-through decoration-white/30" : "text-white/60"}`}>
                  {q.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {p.error && <p className="mt-3 text-[11px] text-amber-300/80">{p.error}</p>}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <a
          href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/90 px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-primary"
          data-testid="link-repo"
        >
          <Github className="h-3.5 w-3.5" /> Add a file
        </a>
        <button
          onClick={load}
          disabled={refreshing}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
          data-testid="button-refresh-progress"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-white/35">
        Progress is read live from your public repo. Your files are the save — no accounts, works on
        any device.
      </p>
    </div>
  );
}
