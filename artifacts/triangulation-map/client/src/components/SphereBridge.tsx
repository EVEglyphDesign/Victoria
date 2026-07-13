import { useEffect, useRef, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { VECTOR_META } from "@/lib/nodes";

/**
 * The Sphere Bridge.
 *
 * The narrative on-ramp between the triangulation map and the educational
 * game. It takes the three triangles drawn on the map (technology / faith /
 * ancestry, meeting at Bukoba) and shows them MULTIPLY and ROTATE until they
 * close into a full sphere — the flat triangle becoming a three-dimensional
 * model of a person, measured from every side at once.
 *
 * The framing is the operator's: symmetry is balancing one world against
 * another; enough independent worlds woven together resolve into one. This is
 * the many-worlds theory folded into unification. When the sphere closes, the
 * door to the instrument (the game) opens.
 *
 * Pure canvas. No backend, no accounts, no dependency on any platform.
 */

type Stage = "triangles" | "closing" | "sphere";

const TECH = VECTOR_META.technology.color; // ember red   — forward / capability
const FAITH = VECTOR_META.faith.color; // marian blue — values
const ANC = VECTOR_META.ancestry.color; // earth green — identity
const GOLD = VECTOR_META.center.color; // gold        — the center / invariant

// Beat script (ms elapsed → caption). Caption uses the exact language of the map.
const BEATS: { at: number; kicker: string; line: string }[] = [
  { at: 0, kicker: "One point", line: "Bukoba, held fixed at the center." },
  {
    at: 3200,
    kicker: "Three bearings",
    line: "Technology, faith, and ancestry — three independent lines resolving to one person.",
  },
  {
    at: 6600,
    kicker: "Add more lines",
    line: "Each bearing is really a radius. Keep adding independent lines through the same shore…",
  },
  {
    at: 10200,
    kicker: "Symmetry",
    line: "…and you are balancing one world against another until they agree.",
  },
  {
    at: 13800,
    kicker: "Many worlds, woven",
    line: "Enough independent worlds crossing one point define a whole surface around it.",
  },
  {
    at: 17400,
    kicker: "Unification",
    line: "The flat triangle becomes a sphere — a full model of a person, measured from every side at once.",
  },
];

const RUN = 20500; // total ms until the sphere is fully closed and the door opens

export default function SphereBridge({
  onClose,
  onEnter,
}: {
  onClose: () => void;
  onEnter: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const [stage, setStage] = useState<Stage>("triangles");
  const [beat, setBeat] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(canvas!.clientWidth * dpr);
      canvas!.height = Math.floor(canvas!.clientHeight * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    startRef.current = performance.now();

    function draw(now: number) {
      let t = now - startRef.current;
      if (skipRef.current) t = RUN;
      const W = canvas!.width;
      const H = canvas!.height;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.33;

      ctx!.clearRect(0, 0, W, H);
      // deep-space wash
      const g = ctx!.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 2.2);
      g.addColorStop(0, "rgba(20,20,28,0.9)");
      g.addColorStop(1, "rgba(6,6,10,0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);

      // progress 0..1 across the run
      const prog = Math.max(0, Math.min(1, t / RUN));
      // how many triangles have "multiplied" in (1 → many)
      const nTri = Math.round(1 + prog * 17); // 1 → 18 rings of triangles
      // how spherical the wireframe has become (0 flat, 1 full sphere)
      const sphericity = Math.max(0, Math.min(1, (t - 6000) / (RUN - 6000)));

      const spin = t * 0.00035;
      const tilt = 0.62; // fixed viewing tilt

      // Draw the base triangle (A forward / B backward / C invariant) first,
      // then rotate copies of it around the vertical axis, lifting each copy's
      // plane toward the sphere as sphericity rises.
      const cols = [TECH, FAITH, ANC];

      ctx!.lineWidth = 1.1 * dpr;
      for (let k = 0; k < nTri; k++) {
        const az = spin + (k / Math.max(1, nTri)) * Math.PI * 2;
        // latitude band this triangle occupies as the sphere forms
        const lat = sphericity * ((k / Math.max(1, nTri - 1)) - 0.5) * Math.PI;
        const ringR = R * Math.cos(lat);
        const yOff = R * Math.sin(lat) * tilt;

        // three vertices of this rotated triangle
        const verts: [number, number][] = [];
        for (let v = 0; v < 3; v++) {
          const a = az + (v / 3) * Math.PI * 2;
          const x = cx + Math.cos(a) * ringR;
          const y = cy + yOff + Math.sin(a) * ringR * tilt;
          verts.push([x, y]);
        }
        const col = cols[k % 3];
        const alpha = 0.10 + 0.5 * (1 - Math.abs(k / Math.max(1, nTri - 1) - 0.5) * 2);
        ctx!.strokeStyle = hexA(col, alpha * (0.35 + 0.65 * (1 - sphericity * 0.4)));
        ctx!.beginPath();
        ctx!.moveTo(verts[0][0], verts[0][1]);
        ctx!.lineTo(verts[1][0], verts[1][1]);
        ctx!.lineTo(verts[2][0], verts[2][1]);
        ctx!.closePath();
        ctx!.stroke();
      }

      // As the sphere closes, overlay latitude/longitude wire to read as a globe
      if (sphericity > 0.05) {
        ctx!.strokeStyle = hexA(GOLD, 0.16 * sphericity);
        ctx!.lineWidth = 1 * dpr;
        for (let i = 1; i < 6; i++) {
          const lat = (i / 6 - 0.5) * Math.PI;
          const rr = R * Math.cos(lat);
          const yy = cy + R * Math.sin(lat) * tilt;
          ctx!.beginPath();
          ctx!.ellipse(cx, yy, rr, rr * tilt, 0, 0, Math.PI * 2);
          ctx!.stroke();
        }
      }

      // The center: the person / the invariant witness C — a warm core that
      // brightens as the sphere completes.
      const coreR = R * (0.06 + 0.05 * sphericity);
      const cg = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
      cg.addColorStop(0, hexA(GOLD, 0.9 * (0.4 + 0.6 * sphericity)));
      cg.addColorStop(1, hexA(GOLD, 0));
      ctx!.fillStyle = cg;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
      ctx!.fill();

      // update captions
      let b = 0;
      for (let i = 0; i < BEATS.length; i++) if (t >= BEATS[i].at) b = i;
      setBeat(b);
      setStage(sphericity < 0.05 ? "triangles" : prog < 1 ? "closing" : "sphere");
      if (prog >= 1 && !skipRef.current) setDoorOpen(true);
      if (skipRef.current) setDoorOpen(true);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  function skip() {
    skipRef.current = true;
    setDoorOpen(true);
    setStage("sphere");
    setBeat(BEATS.length - 1);
  }

  const current = BEATS[beat];

  return (
    <div
      className="fixed inset-0 z-[900] flex flex-col bg-[#060608]"
      data-testid="sphere-bridge"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="font-serif text-xs uppercase tracking-[0.3em] text-primary/90">
          The bridge · triangle to sphere
        </p>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          data-testid="button-close-bridge"
          aria-label="Back to the map"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* caption */}
      <div className="pointer-events-none relative z-10 mt-2 px-6 text-center sm:mt-4">
        <p className="font-serif text-[11px] uppercase tracking-[0.28em] text-primary/80">
          {current.kicker}
        </p>
        <p
          className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base"
          data-testid="text-bridge-caption"
        >
          {current.line}
        </p>
      </div>

      <div className="flex-1" />

      {/* bottom controls */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 pb-8">
        {doorOpen ? (
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/25"
            data-testid="button-enter-instrument"
          >
            Enter the instrument
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={skip}
            className="text-xs text-white/45 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/80"
            data-testid="button-skip-bridge"
          >
            Skip to the sphere
          </button>
        )}
        <p className="max-w-md text-center text-[10px] leading-relaxed text-white/35">
          A picture of the concept as it appears in the operator's imagination — a way to
          feel symmetry, balance, and unification before you practice them. Not a claim about
          the world.
        </p>
      </div>
    </div>
  );
}

// hex + alpha → rgba string
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}
