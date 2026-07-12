import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { NODES, CENTER, VECTOR_META, type MapNode, type Vector } from "@/lib/nodes";
import qaData from "@/lib/qa.json";
import { Send, X, MessageCircle, MapPin, Sparkles, Trophy, ExternalLink, Gamepad2 } from "lucide-react";
import JourneyPanel from "@/components/JourneyPanel";

interface QAPair { q: string; a: string; }
const QA: QAPair[] = qaData as QAPair[];

const STOP = new Set([
  "the","a","an","of","to","and","or","is","are","was","were","what","why","how","do","does","did",
  "i","me","my","you","it","this","that","on","in","at","for","with","about","here","there","can",
  "actually","exactly","mean","means","tell","explain","okay","so","just","be","am","if","not","they",
  "have","has","but","as","from","into","one","all","who","which","were","would","could","should","like",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.endsWith("s") && w.length > 4 ? w.slice(0, -1) : w));
}

// Pre-tokenize the knowledge base once.
const QA_TOKENS = QA.map((p) => new Set([...tokenize(p.q), ...tokenize(p.a).slice(0, 40)]));

function bestAnswer(question: string): string {
  const qt = tokenize(question);
  if (qt.length === 0) {
    return "Ask me about the three vectors — Technology, Faith, or Ancestry — about Bukoba at the center, or about how it all ties to a digital twin.";
  }
  let bestIdx = -1;
  let bestScore = 0;
  QA_TOKENS.forEach((toks, i) => {
    let score = 0;
    for (const w of qt) {
      if (toks.has(w)) score += 1;
      // partial credit for question-token matches (stronger signal)
      if (tokenize(QA[i].q).includes(w)) score += 0.6;
    }
    // normalize slightly by question length so short KB questions aren't over-favored
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });
  if (bestIdx === -1 || bestScore < 1) {
    return "That's a little outside what this map covers, but here's what I can tell you: the map fixes one point — Bukoba, on Lake Victoria — and reaches out along three independent vectors: Technology (steel, pointing east to Asia), Faith (the Catholic mission lineage, pointing north to the Mediterranean), and Ancestry (the Bantu migration, running northwest to southeast). All three resolve back to one person. Try asking about any one of those, or about the digital-twin idea.";
  }
  return QA[bestIdx].a;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

// Minimal inline markdown -> HTML for assistant messages (bold, italic, line breaks).
function renderMd(text: string): string {
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/\n/g, "<br/>");
}

const SUGGESTED = [
  "What is this map actually showing?",
  "Why is it called a triangulation?",
  "How does this connect to a digital twin?",
  "What's special about the Haya steelmaking?",
];

// Build a gently curved arc between two lat/lng points for a nicer "beam" look.
function arc(from: [number, number], to: [number, number], bend = 0.18): [number, number][] {
  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const mx = (lat1 + lat2) / 2;
  const my = (lng1 + lng2) / 2;
  const dx = lat2 - lat1;
  const dy = lng2 - lng1;
  // perpendicular offset for the control point
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  const pts: [number, number][] = [];
  for (let t = 0; t <= 1.0001; t += 0.04) {
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    pts.push([a * lat1 + b * cx + c * lat2, a * lng1 + b * cy + c * lng2]);
  }
  return pts;
}

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<L.Map | null>(null);
  const [active, setActive] = useState<MapNode | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  void sending;

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    const map = L.map(mapRef.current, {
      center: [12, 34],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    });
    mapObj.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Draw vector arcs from center to each outer node
    NODES.filter((n) => n.vector !== "center").forEach((n) => {
      const color = VECTOR_META[n.vector].color;
      const line = arc([CENTER.lat, CENTER.lng], [n.lat, n.lng]);
      L.polyline(line, {
        color,
        weight: 2,
        opacity: 0.75,
        dashArray: "1 8",
        lineCap: "round",
      }).addTo(map);
      L.polyline(line, {
        color,
        weight: 8,
        opacity: 0.08,
        lineCap: "round",
      }).addTo(map);
    });

    // Markers
    NODES.forEach((n) => {
      const meta = VECTOR_META[n.vector];
      const isCenter = n.vector === "center";
      const size = isCenter ? 26 : 16;
      const html = `
        <div class="tri-marker ${isCenter ? "tri-center" : ""}" style="--c:${meta.color};width:${size}px;height:${size}px">
          <span class="tri-dot"></span>
          ${isCenter ? '<span class="tri-pulse"></span><span class="tri-pulse tri-pulse-2"></span>' : ""}
        </div>`;
      const icon = L.divIcon({
        className: "tri-icon",
        html,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([n.lat, n.lng], { icon, riseOnHover: true }).addTo(map);
      marker.on("click", () => {
        setActive(n);
        map.flyTo([n.lat, n.lng], isCenter ? 4 : 4, { duration: 0.8 });
      });
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const tipHtml = `
        <div class="tri-tip">
          <div class="tri-tip-vec" style="color:${meta.color}">${esc(meta.label)}</div>
          <div class="tri-tip-name">${esc(n.name)}</div>
          <div class="tri-tip-role">${esc(n.role)}</div>
          <div class="tri-tip-detail">${esc(n.relates || n.detail)}</div>
          <div class="tri-tip-more">Tap the point for the full card</div>
        </div>`;
      // Place tall cards to the side so they don't clip off the top edge;
      // flip left/right depending on which hemisphere the point sits in.
      const onRightHalf = n.lng > CENTER.lng;
      marker.bindTooltip(tipHtml, {
        direction: onRightHalf ? "left" : "right",
        offset: [onRightHalf ? -size / 2 - 4 : size / 2 + 4, 0],
        className: "tri-tooltip",
        sticky: false,
        opacity: 1,
      });
    });

    // Open center by default after a beat (desktop only — keep mobile map unobstructed)
    const t = setTimeout(() => {
      if (window.innerWidth >= 640) setActive(CENTER);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function ask(q: string) {
    const question = q.trim();
    if (!question || sending) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setSending(true);
    // Small, human-feeling delay before the answer appears.
    const answer = bestAnswer(question);
    window.setTimeout(() => {
      setMessages([...next, { role: "assistant", content: answer }]);
      setSending(false);
    }, 450 + Math.random() * 350);
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a] text-foreground">
      {/* Map */}
      <div ref={mapRef} className="absolute inset-0 z-0" data-testid="map-canvas" />

      {/* Title overlay */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[500] bg-gradient-to-b from-black/80 to-transparent px-5 py-5 sm:px-8">
        <div className="pointer-events-auto max-w-xl">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-primary/90">
            A Triangulation
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">
            One Point on Lake Victoria,<br className="hidden sm:block" /> Three Vectors to the World
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
            Bukoba held fixed at the center. Three independent lines — technology, faith, and
            ancestry — reach out and resolve back to a single person. Tap any point to explore, or
            ask a question.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setJourneyOpen(true); setActive(null); }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/25"
              data-testid="button-open-journey"
            >
              <Trophy className="h-3.5 w-3.5" />
              Start your journey
            </button>
            <a
              href="./gamification/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              data-testid="link-gamification-page"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open the full journey page
            </a>
            <a
              href="./assessment/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              data-testid="link-assessment-page"
            >
              <Sparkles className="h-3.5 w-3.5" />
              See the reference assessment
            </a>
            <a
              href="./capability/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              data-testid="link-capability-page"
            >
              <MapPin className="h-3.5 w-3.5" />
              What this surface demonstrates
            </a>
            <a
              href="./game/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              data-testid="link-game-page"
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              Play the training instrument
            </a>
          </div>
        </div>
      </div>

      {/* Journey / gamification panel */}
      {journeyOpen && <JourneyPanel onClose={() => setJourneyOpen(false)} />}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[500] rounded-xl border border-white/10 bg-black/70 p-3 backdrop-blur-md sm:p-4">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">Vectors</p>
        <div className="space-y-1.5">
          {(["technology", "faith", "ancestry"] as Vector[]).map((v) => (
            <div key={v} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: VECTOR_META[v].color, boxShadow: `0 0 8px ${VECTOR_META[v].color}` }}
              />
              <span className="text-xs font-medium text-white/85">{VECTOR_META[v].label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-0.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: VECTOR_META.center.color, boxShadow: `0 0 10px ${VECTOR_META.center.color}` }}
            />
            <span className="text-xs font-medium text-white/85">Bukoba — the center</span>
          </div>
        </div>
      </div>

      {/* Node detail panel */}
      {active && (
        <div
          className="absolute right-4 top-24 z-[600] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-white/10 bg-[#111]/95 p-5 shadow-2xl backdrop-blur-md sm:top-28"
          data-testid="panel-node"
        >
          <button
            onClick={() => setActive(null)}
            className="absolute right-3 top-3 rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
            data-testid="button-close-panel"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: `${VECTOR_META[active.vector].color}22` }}
            >
              <MapPin className="h-3.5 w-3.5" style={{ color: VECTOR_META[active.vector].color }} />
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: VECTOR_META[active.vector].color }}
            >
              {VECTOR_META[active.vector].label}
            </span>
          </div>
          <h2 className="mt-3 font-serif text-xl font-semibold text-white" data-testid="text-node-name">
            {active.name}
          </h2>
          <p className="mt-1 text-sm font-medium text-white/80">{active.role}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">{active.detail}</p>
          {active.relates && (
            <div
              className="mt-4 rounded-lg border-l-2 bg-white/[0.03] px-3 py-2.5"
              style={{ borderColor: VECTOR_META[active.vector].color }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
                How it connects &mdash; toward the sphere
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{active.relates}</p>
            </div>
          )}
          {active.vector !== "center" && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Maps to twin layer</p>
              <p className="mt-0.5 text-sm font-medium text-white/85">
                {VECTOR_META[active.vector].twinLayer}
              </p>
            </div>
          )}
          <div className="mt-3 text-[11px] tabular-nums text-white/40">
            {active.lat.toFixed(3)}, {active.lng.toFixed(3)}
          </div>
        </div>
      )}

      {/* Chat toggle button */}
      {!chatOpen && (
        <div className="absolute bottom-5 right-4 z-[700]">
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground shadow-xl hover-elevate active-elevate-2"
            data-testid="button-open-chat"
          >
            <MessageCircle className="h-4 w-4" />
            Ask about this map
          </button>
        </div>
      )}

      {/* Chat panel */}
      {chatOpen && (
        <div className="absolute bottom-0 right-0 z-[800] flex h-[85vh] w-full flex-col border-l border-t border-white/10 bg-[#0d0d0d]/98 backdrop-blur-md sm:bottom-4 sm:right-4 sm:h-[600px] sm:max-h-[85vh] sm:w-[400px] sm:rounded-2xl sm:border">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-serif text-sm font-semibold text-white">Ask the map</span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="rounded-md p-1 text-white/50 hover-elevate active-elevate-2"
              aria-label="Close chat"
              data-testid="button-close-chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-white/60">
                  Hi — I know everything on this map. Ask me anything about the three vectors,
                  Bukoba, the Haya lineage, or how it all ties to a digital twin.
                </p>
                <div className="space-y-2">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/80 hover-elevate active-elevate-2"
                      data-testid={`button-suggested-${s.slice(0, 10)}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                        : "max-w-[90%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm leading-relaxed text-white/85 [&_strong]:font-semibold [&_strong]:text-white"
                    }
                    data-testid={`msg-${m.role}-${i}`}
                  >
                    {m.role === "assistant" ? (
                      <span dangerouslySetInnerHTML={{ __html: renderMd(m.content) }} />
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3">
                    <span className="tri-typing" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-primary/50 focus:outline-none"
              data-testid="input-question"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover-elevate active-elevate-2"
              data-testid="button-send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
