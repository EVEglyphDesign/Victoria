import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (!window.location.hash) {
  window.location.hash = "#/";
}

// The HTML shell carries a static copy of the canonical footer as a
// no-JS fallback (see index.html). Once React mounts its own footer inside
// the Home page, remove the static one so the two never render on top of
// each other.
document.getElementById("static-fallback-footer")?.remove();

createRoot(document.getElementById("root")!).render(<App />);
