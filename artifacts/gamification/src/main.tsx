// Live mount of the shipped Victoria gamification engine, reflected into the
// EDU canon. JourneyPanel is imported UNCHANGED from ../../JourneyPanel.tsx
// (the canon source of truth) via the @/lib aliases in vite.config.ts.
// © 2026 Dany Theriault · EVE Glyph Umbrella · Pour le bien-être du peuple.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import JourneyPanel from "./JourneyPanel";
import "./index.css";

const FOOTER_CANON = "© 2026 Dany Theriault. EVE “digital stem cell” glyph and glyph-based design principles — all rights reserved. Stewardship of rights of use and assignment for large public and institutional usage rests with the Pacific Utilities Design Council. Published as a time-stamped record of authorship and intent.";
const FOOTER_COMPANION = "pour le bien-être du peuple";

function App() {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative min-h-screen w-full text-white">
      {/* Page frame — the panel ships as an absolute overlay, so we give it a
          dark stage to sit on, matching the spinning-sphere aesthetic. */}
      {/* On desktop the panel is an absolute overlay pinned left; offset the
          header so the two never collide. On mobile it stacks below. */}
      <header className="px-6 pt-8 sm:px-10 md:pl-[26rem]">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
          EVE Glyph · Adaptive Game
        </p>
        <h1 className="mt-2 text-xl font-semibold text-white/90">
          Gamification engine — live
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">
          Repo-as-save-file twin score, certification tiers, and quests. Read
          live from the public GitHub repository — no accounts, no backend, no
          vendor lock-in. First shipped in Victoria; mounted here from the EDU
          canon.
        </p>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="mt-5 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            Open journey panel
          </button>
        )}
      </header>

      {open && <JourneyPanel onClose={() => setOpen(false)} />}

      <footer className="absolute bottom-4 left-0 right-0 px-6 text-center text-[10px] leading-relaxed text-white/60 sm:px-10">
        {FOOTER_CANON}
        <br />
        {FOOTER_COMPANION}
      </footer>
    </div>
  );
}

// The HTML shell carries a static copy of the canonical footer as a
// no-JS fallback (see index.html). Once React mounts its own footer inside
// <App/>, remove the static one so the two never render on top of each other.
document.getElementById("static-fallback-footer")?.remove();

createRoot(document.getElementById("root")!).render(<App />);
