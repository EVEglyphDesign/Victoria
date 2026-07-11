import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Public reflection (fork) of the EDU-canon gamification page. The engine files
// (progress.ts, nodes.ts, JourneyPanel.tsx) are reflected into ./src from
// eve-glyph-education/game/gamification-engine and cited there as the source of
// truth. Built entirely on GitHub's servers; static output; no vendor lock-in.
// Relative base so it serves from the /gamification/ subpath on Pages.
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@/lib/progress": resolve(__dirname, "./src/progress.ts"),
      "@/lib/nodes": resolve(__dirname, "./src/nodes.ts"),
    },
  },
});
