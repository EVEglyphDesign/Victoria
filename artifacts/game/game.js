/* The Spinning Sphere — a single-surface training instrument.
 * No backend, no accounts, no storage, no external calls beyond CDN fonts.
 * The methodology (EVE Glyph) rendered as motion. Canon: eve-glyph-education/game/design.
 * Fictional imagery; real cognitive imprint. This is Dany's imagination, not a claim about the world.
 */
(() => {
  "use strict";
  const cv = document.getElementById("c");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize); resize();

  // ---------- game state ----------
  const S = {
    phase: "intro",           // intro -> startpos -> registry -> demo -> play -> loss
    agents: [],               // {theta, phi, r, kind, mag, loveIdx}
    baseSpeed: 0.006,         // rad/frame at slider 0
    speed: 0.12,              // 0..1 slider normalized
    rot: 0,                   // accumulated rotation
    axisTilt: 0,              // current wobble tilt (rad)
    axisTiltVel: 0,
    wobble: 0,                // 0..1 measured
    tolerance: 1,             // shrinks as speed rises
    exploded: false,
    explodeT: 0,
    fragments: [],
    startPos: { posture: null, anchor: "", speedBand: null },
    registry: [],             // candidate-named loved things (in memory only)
    consented: false,
    demoStage: 0,
    attempts: 0,
    alienX: 0, alienY: 0, alienBob: 0, alienBlink: 0,
    lossItem: null, lossT: 0,
    playing: false,
  };

  // ---------- helpers ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------- procedural sound design (Web Audio, self-contained, no files) ----------
  // Off by default. Created only after a user gesture (autoplay policy). Nothing loaded, nothing sent.
  const Sound = {
    on: false, ac: null, master: null,
    drone: null, droneGain: null, droneFilt: null,
    init() {
      if (this.ac) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ac = new AC();
      this.master = this.ac.createGain();
      this.master.gain.value = 0.0001;
      this.master.connect(this.ac.destination);
      // continuous spin drone: two detuned oscillators through a lowpass
      this.droneGain = this.ac.createGain(); this.droneGain.gain.value = 0.0001;
      this.droneFilt = this.ac.createBiquadFilter(); this.droneFilt.type = "lowpass"; this.droneFilt.frequency.value = 320;
      const o1 = this.ac.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 55;
      const o2 = this.ac.createOscillator(); o2.type = "sine"; o2.frequency.value = 55; o2.detune.value = 6;
      o1.connect(this.droneFilt); o2.connect(this.droneFilt);
      this.droneFilt.connect(this.droneGain); this.droneGain.connect(this.master);
      o1.start(); o2.start(); this.drone = { o1, o2 };
      return true;
    },
    enable() {
      if (!this.init()) return false;
      if (this.ac.state === "suspended") this.ac.resume();
      this.on = true;
      this.master.gain.setTargetAtTime(0.9, this.ac.currentTime, 0.2);
      return true;
    },
    disable() {
      this.on = false;
      if (this.ac) this.master.gain.setTargetAtTime(0.0001, this.ac.currentTime, 0.15);
    },
    // spin drone tracks speed (0..1) and wobble (0..1): faster = higher/brighter, wobble = louder & noisier
    spin(speed, wobble) {
      if (!this.on || !this.ac) return;
      const t = this.ac.currentTime;
      const base = 46 + speed * 70;
      this.drone.o1.frequency.setTargetAtTime(base, t, 0.1);
      this.drone.o2.frequency.setTargetAtTime(base, t, 0.1);
      this.droneFilt.frequency.setTargetAtTime(260 + speed * 900 + wobble * 700, t, 0.12);
      this.droneGain.gain.setTargetAtTime(0.05 + speed * 0.10 + wobble * 0.12, t, 0.15);
    },
    // one-shot tone
    ping(freq, dur, type, vol, glideTo) {
      if (!this.on || !this.ac) return;
      const t = this.ac.currentTime;
      const o = this.ac.createOscillator(); o.type = type || "sine"; o.frequency.value = freq;
      if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
      const g = this.ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
    },
    chime() { this.ping(880, 0.5, "sine", 0.18); this.ping(1320, 0.6, "sine", 0.10); },       // balance settles
    love() { [523.25, 659.25, 783.99].forEach((f, i) => setTimeout(() => this.ping(f, 0.9, "sine", 0.16), i * 160)); }, // warm major triad
    place() { this.ping(440, 0.14, "triangle", 0.12, 560); },                                   // agent added
    peace() { this.ping(392, 1.4, "sine", 0.16, 523.25); },                                     // gentle rising note
    break() {                                                                                   // explosion: low noise burst
      if (!this.on || !this.ac) return;
      const t = this.ac.currentTime, len = 0.7, buf = this.ac.createBuffer(1, this.ac.sampleRate * len, this.ac.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const src = this.ac.createBufferSource(); src.buffer = buf;
      const f = this.ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(1200, t); f.frequency.exponentialRampToValueAtTime(120, t + len);
      const g = this.ac.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      src.connect(f); f.connect(g); g.connect(this.master); src.start(t);
    },
  };

  // sphere geometry: agents live on a unit sphere (theta=azimuth, phi=polar)
  const R = () => Math.min(W, H) * 0.24;
  const CX = () => W / 2;
  const CY = () => H / 2 + Math.min(W, H) * 0.02;

  function seedTriangle() {
    S.agents = [];
    // start every fresh sphere truly still (clear any wobble carried over from a prior break)
    S.axisTilt = 0; S.axisTiltVel = 0; S.wobble = 0;
    for (let i = 0; i < 3; i++) {
      S.agents.push({ theta: (i / 3) * Math.PI * 2, phi: Math.PI / 2, kind: i === 2 ? "C" : (i === 0 ? "A" : "B"), mag: 1, loveIdx: -1 });
    }
    recomputeBalance();
  }

  // add an agent at a screen point (projected back onto the sphere front hemisphere)
  function addAgentAt(px, py) {
    const dx = (px - CX()) / R();
    const dy = (py - CY()) / R();
    const d2 = dx * dx + dy * dy;
    if (d2 > 1) { // outside sphere: clamp to rim
      const n = Math.sqrt(d2); 
    }
    const z = Math.sqrt(Math.max(0.001, 1 - Math.min(0.999, d2)));
    // unproject to sphere coords (approx, ignoring current rotation for placement feel)
    const theta = Math.atan2(dx, z) - S.rot;
    const phi = Math.acos(clamp(dy, -1, 1));
    const loveIdx = S.registry.length ? (S.agents.filter(a => a.loveIdx >= 0).length % S.registry.length) : -1;
    S.agents.push({ theta, phi, kind: "agent", mag: 1, loveIdx });
    recomputeBalance();
    Sound.place();
    say(pick(ALIEN.placed), 2200);
  }

  // balance = distance of center-of-mass from the spin axis (the vertical y-axis through center).
  // well-placed agents keep COM near axis; clustering pushes it off => wobble.
  function recomputeBalance() {
    let sx = 0, sy = 0, sz = 0, m = 0;
    for (const a of S.agents) {
      const x = Math.sin(a.phi) * Math.cos(a.theta);
      const y = Math.cos(a.phi);
      const z = Math.sin(a.phi) * Math.sin(a.theta);
      sx += x * a.mag; sy += y * a.mag; sz += z * a.mag; m += a.mag;
    }
    if (m === 0) { S.imbalance = 0; return; }
    sx /= m; sz /= m; // COM offset from spin (y) axis measured in x-z plane
    S.imbalance = Math.sqrt(sx * sx + sz * sz); // 0 = perfectly balanced
  }

  function rebalance() {
    // redistribute agents evenly (Fibonacci sphere) — the alien's "catch it gently, reposition"
    const n = S.agents.length;
    for (let i = 0; i < n; i++) {
      const a = S.agents[i];
      if (a.kind === "C") { a.phi = Math.PI / 2; a.theta = 0; continue; }
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      a.phi = Math.acos(clamp(y, -1, 1));
      a.theta = i * 2.399963; // golden angle
    }
    S.axisTilt *= 0.3; S.axisTiltVel = 0;
    recomputeBalance();
    Sound.chime();
    say(pick(ALIEN.rebalanced), 2200);
  }

  // ---------- alien dialogue (bilingual-ready, short, quiet, never at candidate's expense) ----------
  const ALIEN = {
    greet: ["Hello. 👽 Small smile, as always.", "You came back. I am glad. 🥰", "I am here with you. 👽♥️"],
    demo: [
      "Three points. Three can spin. Two cannot.",
      "I add an agent. Watch the balance.",
      "More agents. It rounds. It gets harder to hold.",
      "I place one badly. Slowly, nothing. Then I add speed.",
      "Speed is the friend. Wobble is the enemy. Balance is what lets us hold speed.",
      "It broke. I have seen this before. Here — a fresh triangle."
    ],
    placed: ["An agent joins. Re-balance if it drifts.", "Where does it sit, relative to the others?", "Feel the wobble before you think it."],
    rebalanced: ["Caught it. Repositioned. Spin again.", "Balance is achieved, not automatic."],
    fast: ["The structure that holds slow may not hold fast.", "Careful. The axis is drifting."],
    danger: ["Wobble is near tolerance.", "You are close to the ceiling."],
    reset: ["It broke. That is expected. Begin again.", "Same triangle. Same smile. Again. 👽♥️"],
    yourturn: ["Now you. Add agents. Keep it balanced as it grows.", "Your turn. I am here. 👽"],
    // the lesson, surfaced when a loved-laden sphere is held balanced at speed
    lovekey: [
      "See what holds it? <em>Love is the key to infinity.</em> ♥️🔑♾️",
      "The things you love are the axis. Keep them centered and the sphere spins forever.",
      "You are balancing what you love. That is the whole practice. 👽♥️"
    ],
  };
  let loveTeachShown = false;
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  let sayTimer = null;
  function say(t, ms = 2600) {
    const el = document.getElementById("alien-say");
    el.innerHTML = t; el.classList.add("on");
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => el.classList.remove("on"), ms);
  }

  // ---------- the alien (procedural, canon-faithful: recognizable one-frame, slight asymmetry,
  // color-stable, permanent slight smile). Rendered as vector shapes on canvas. ----------
  function drawAlien(x, y, scale, mood = "calm") {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const bob = Math.sin(S.alienBob) * 1.4;
    ctx.translate(0, bob);
    // color-stable palette (never changes with game state)
    const body = "#8fb8ff", bodyDk = "#5f86d6", eye = "#0b1020";
    // slight left lean (asymmetry)
    ctx.rotate(-0.04);
    // body
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 14, 15, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = bodyDk;
    ctx.beginPath(); ctx.ellipse(0, 20, 15, 13, 0, 0, Math.PI * 2); ctx.fill();
    // head (one antenna slightly off-center = asymmetry)
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, -8, 16, 15, 0, 0, Math.PI * 2); ctx.fill();
    // antenna
    ctx.strokeStyle = body; ctx.lineWidth = 2.4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(3, -20); ctx.quadraticCurveTo(7, -30, 5, -34); ctx.stroke();
    ctx.fillStyle = "#f4c430"; ctx.beginPath(); ctx.arc(5, -35, 2.6, 0, Math.PI * 2); ctx.fill();
    // big eyes (blink)
    const blink = S.alienBlink > 0 ? 0.12 : 1;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(-6, -9, 4.2, 5.2 * blink, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6.5, -9, 4.6, 5.4 * blink, -0.1, 0, Math.PI * 2); ctx.fill();
    if (blink > 0.5) {
      ctx.fillStyle = eye;
      ctx.beginPath(); ctx.arc(-5.5, -8.5, 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7, -8.5, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    // permanent slight smile (does NOT change with mood — constancy is the design)
    ctx.strokeStyle = eye; ctx.lineWidth = 1.8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(0, -2, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    // little arms
    ctx.strokeStyle = body; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(-13, 10); ctx.quadraticCurveTo(-22, 16, -20, 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(13, 10); ctx.quadraticCurveTo(22, 14, 21, 22); ctx.stroke();
    ctx.restore();
  }

  // ---------- rendering the sphere ----------
  function project(a, tilt) {
    // rotate around y-axis by S.rot, then apply wobble tilt around x
    let x = Math.sin(a.phi) * Math.cos(a.theta + S.rot);
    let y = Math.cos(a.phi);
    let z = Math.sin(a.phi) * Math.sin(a.theta + S.rot);
    // tilt (wobble): rotate around x-axis
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
    return { x, y: y2, z: z2 };
  }

  function drawHeart(cx, cy, s, alpha, col) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.9);
    ctx.bezierCurveTo(cx - s * 1.2, cy - s * 0.2, cx - s * 0.5, cy - s * 1.1, cx, cy - s * 0.4);
    ctx.bezierCurveTo(cx + s * 0.5, cy - s * 1.1, cx + s * 1.2, cy - s * 0.2, cx, cy + s * 0.9);
    ctx.fill();
    ctx.restore();
  }

  function drawSphere() {
    const r = R(), cx = CX(), cy = CY();
    const tilt = S.axisTilt;
    // faint sphere shell
    ctx.save();
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
    g.addColorStop(0, "rgba(143,184,255,0.10)");
    g.addColorStop(1, "rgba(143,184,255,0.01)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // spin axis (drifts with wobble)
    ctx.save();
    ctx.strokeStyle = "rgba(244,196,48,0.25)"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(tilt) * r * 1.15, cy - Math.cos(tilt) * r * 1.15);
    ctx.lineTo(cx - Math.sin(tilt) * r * 1.15, cy + Math.cos(tilt) * r * 1.15);
    ctx.stroke();
    ctx.restore();

    // the core: love at the center of the structure (♥ the axis). glows brighter as balance holds.
    if (S.registry.length) {
      const balance = 1 - clamp((S.imbalance || 0) * 2.2, 0, 1);
      const pulse = 0.7 + Math.sin(S.rot * 2) * 0.15;
      drawHeart(cx, cy, r * 0.16, lerp(0.18, 0.9, balance) * pulse, "#f472b6");
      ctx.save();
      ctx.shadowColor = "rgba(244,114,182,0.9)"; ctx.shadowBlur = lerp(4, 26, balance);
      drawHeart(cx, cy, r * 0.11, lerp(0.2, 0.95, balance), "#fb7185");
      ctx.restore();
    }

    // agents, painter-sorted by z
    const pts = S.agents.map(a => ({ a, p: project(a, tilt) }));
    pts.sort((u, v) => u.p.z - v.p.z);
    // connective mesh (triangle/polygon edges when few agents)
    if (S.agents.length <= 9) {
      ctx.strokeStyle = "rgba(143,184,255,0.18)"; ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        ctx.beginPath();
        ctx.moveTo(cx + pts[i].p.x * r, cy + pts[i].p.y * r);
        ctx.lineTo(cx + pts[j].p.x * r, cy + pts[j].p.y * r);
        ctx.stroke();
      }
    }
    for (const { a, p } of pts) {
      const sx = cx + p.x * r, sy = cy + p.y * r;
      const depth = (p.z + 1) / 2; // 0 back .. 1 front
      const rad = lerp(2.5, 6.5, depth);
      let col;
      if (a.kind === "C") col = "244,196,48";       // gold = invariant witness
      else if (a.kind === "A") col = "248,113,113";  // forward
      else if (a.kind === "B") col = "96,165,250";   // backward
      else col = "52,211,153";                        // agents
      ctx.globalAlpha = lerp(0.3, 1, depth);
      ctx.fillStyle = `rgba(${col},1)`;
      ctx.beginPath(); ctx.arc(sx, sy, rad, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = `rgba(${col},0.8)`; ctx.shadowBlur = lerp(2, 10, depth);
      ctx.beginPath(); ctx.arc(sx, sy, rad * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // loved-thing riders (only after registry provided) on the front hemisphere
      if (a.loveIdx >= 0 && S.registry[a.loveIdx] && depth > 0.5) {
        ctx.globalAlpha = lerp(0, 0.85, (depth - 0.5) * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "10px General Sans, sans-serif";
        ctx.textAlign = "center";
        const label = S.registry[a.loveIdx].slice(0, 18);
        ctx.fillText(label, sx, sy - rad - 4);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---------- explosion / loss ----------
  function explode(isDemo) {
    S.exploded = true; S.explodeT = 0; S.playing = false;
    Sound.break();
    S.fragments = S.agents.map(a => {
      const p = project(a, S.axisTilt);
      return { x: CX() + p.x * R(), y: CY() + p.y * R(),
        vx: rand(-6, 6), vy: rand(-8, 2), r: rand(2, 6),
        col: a.kind === "C" ? "244,196,48" : a.kind === "agent" ? "52,211,153" : "143,184,255",
        loveIdx: a.loveIdx };
    });
    // choose a loved item to surface (verbatim), if any
    const loved = S.agents.filter(a => a.loveIdx >= 0 && S.registry[a.loveIdx]);
    S.lossItem = loved.length ? S.registry[loved[0].loveIdx] : (S.registry[0] || null);
    hud(false); controls(false);
    if (!isDemo) { S.attempts++; setTimeout(showLoss, 1500); }
  }

  function drawFragments(dt) {
    S.explodeT += dt;
    ctx.save();
    for (const f of S.fragments) {
      f.vy += 0.25; f.x += f.vx; f.y += f.vy; f.vx *= 0.99;
      ctx.globalAlpha = clamp(1 - S.explodeT / 2.2, 0, 1);
      ctx.fillStyle = `rgba(${f.col},1)`;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // the alien returns to its start position amid the wreckage, still smiling
    drawAlien(CX(), CY() + R() * 1.8, 1.1, "calm");
  }

  // ---------- panels / flow ----------
  const layer = document.getElementById("layer");
  const panel = document.getElementById("panel");
  function openPanel(html, interactive = true) {
    panel.innerHTML = html; layer.classList.add("on");
    if (!interactive) layer.classList.remove("on");
  }
  function closePanel() { layer.classList.remove("on"); }
  function hud(on) { document.getElementById("hud").classList.toggle("on", on); }
  function controls(on) { document.getElementById("controls").classList.toggle("on", on); }
  function homelink(on){ document.getElementById("homelink").classList.toggle("on", on); }

  const FOOTER = `<p class="small" style="margin-top:1.2rem;border-top:1px solid var(--line);padding-top:.9rem">© 2026 Dany Theriault. EVE glyph & glyph-based design principles — all rights reserved. Stewardship rests with the Pacific Utilities Design Council. <em style="color:var(--muted)">Pour le bien-être du peuple.</em></p>`;

  function intro() {
    S.phase = "intro"; homelink(true);
    openPanel(`
      <p class="eyebrow">A training instrument · not entertainment</p>
      <h1>The Spinning Sphere</h1>
      <p>Three points can spin. Add agents and the structure rounds into a sphere — smoother when balanced, more violent when it wobbles. Hold speed without letting the wobble break the world.</p>
      <p class="small" style="color:#f9a8d4">The lesson underneath it all: you steady the sphere <em>because</em> you love what rides on it. <em>Love is the key to infinity.</em> ♥️🔑♾️</p>
      <div class="fict">This imagery is fictional — a picture of the concept as it appears in Dany's imagination. It is a video game for practicing classification and consulting concepts through play. It is <strong>not</strong> a claim about how anything is or should be in the real world.</div>
      <p class="small">No accounts. No backend. Nothing you type leaves this page or is stored anywhere. A friendly guide walks with you.</p>
      <div class="btns"><button class="act primary" id="go">Meet the guide →</button></div>
      ${FOOTER}`);
    document.getElementById("go").onclick = startPosition;
  }

  function startPosition() {
    S.phase = "startpos";
    openPanel(`
      <p class="eyebrow">Session opening · the start position</p>
      <h2>Enter your start position</h2>
      <p>The methodology begins from a known posture. This is a first-class mechanic — the session does not begin until you have entered your position. The guide holds its own; you build yours, in your own words.</p>
      <label>1 · Physical posture (choose what you'll hold)</label>
      <div class="chips" id="posture">
        <button class="chip" data-v="Seated, grounded">Seated, grounded</button>
        <button class="chip" data-v="Standing, level">Standing, level</button>
        <button class="chip" data-v="Breath at center">Breath at center</button>
      </div>
      <label>2 · Verbal anchor (your words — never edited)</label>
      <textarea id="anchor" placeholder="A short line you return to. Yours."></textarea>
      <label>3 · Declare a speed band for this session</label>
      <div class="chips" id="band">
        <button class="chip" data-v="Slow / deliberate">Slow / deliberate</button>
        <button class="chip" data-v="Moderate">Moderate</button>
        <button class="chip" data-v="Fast / testing my ceiling">Fast / testing my ceiling</button>
      </div>
      <div class="btns"><button class="act primary" id="reg" disabled>Register position →</button></div>
      <p class="small">A 🧭 re-orientation footprint is emitted as the first event of your session.</p>`);
    let posture = null, band = null;
    const check = () => { document.getElementById("reg").disabled = !(posture && band && document.getElementById("anchor").value.trim().length); };
    panel.querySelectorAll("#posture .chip").forEach(b => b.onclick = () => { posture = b.dataset.v; panel.querySelectorAll("#posture .chip").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); check(); });
    panel.querySelectorAll("#band .chip").forEach(b => b.onclick = () => { band = b.dataset.v; panel.querySelectorAll("#band .chip").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); check(); });
    document.getElementById("anchor").oninput = check;
    document.getElementById("reg").onclick = () => {
      S.startPos = { posture, anchor: document.getElementById("anchor").value.trim(), speedBand: band };
      registryConsent();
    };
  }

  function registryConsent() {
    S.phase = "registry";
    openPanel(`
      <p class="eyebrow">The loss-condition · consent required</p>
      <h2>Name the things you love</h2>
      <p>Before the test, name a few things you love — specifically, in your own words. If the sphere breaks under your watch, the game will show one of them being destroyed along the trajectory the failure would cause.</p>
      <div class="fict">The destruction shown is <strong>fictional</strong>. The cognitive imprint is real. Nothing you enter is stored, sent, or shared — it lives only in this browser tab and is gone when you close it.</div>
      <label>Loved things (one per line — 1 to 5)</label>
      <textarea id="reg-list" placeholder="A relationship, by name&#10;A practice or project&#10;A place&#10;Something you hope to leave behind"></textarea>
      <div class="chips" style="margin-top:.9rem">
        <button class="chip" id="consent-yes">I consent — I understand I'll see one destroyed</button>
      </div>
      <div class="btns">
        <button class="act primary" id="begin" disabled>Begin the test →</button>
        <button class="act ghost" id="skip">Play without the loss layer</button>
      </div>`);
    let consented = false;
    const list = document.getElementById("reg-list");
    const begin = document.getElementById("begin");
    const check = () => { begin.disabled = !(consented && list.value.trim().split("\n").filter(x => x.trim()).length); };
    document.getElementById("consent-yes").onclick = (e) => { consented = !consented; e.target.classList.toggle("sel", consented); check(); };
    list.oninput = check;
    begin.onclick = () => {
      S.registry = list.value.trim().split("\n").map(x => x.trim()).filter(Boolean).slice(0, 5);
      S.consented = true; demo();
    };
    document.getElementById("skip").onclick = () => { S.registry = []; S.consented = false; demo(); };
  }

  // the alien demonstrates (Stages 1-4), auto-advancing, then hands over (Stage 5)
  function demo() {
    S.phase = "demo"; closePanel(); homelink(true);
    seedTriangle(); S.demoStage = 0; S.playing = false; S.exploded = false;
    say(pick(ALIEN.greet), 2600);
    const seq = [
      () => { say(ALIEN.demo[0], 3200); },
      () => { addDemoAgent(); say(ALIEN.demo[1], 3200); },
      () => { addDemoAgent(); addDemoAgent(); addDemoAgent(); say(ALIEN.demo[2], 3400); },
      () => { addDemoAgent(); addDemoAgent(); clusterOne(); say(ALIEN.demo[3], 3600); },
      () => { S.speed = 0.85; document.getElementById("speed").value = 85; say(ALIEN.demo[4], 4000); },
      () => { forceExplodeDemo(); },
    ];
    let i = 0;
    const step = () => { if (i < seq.length) { seq[i++](); setTimeout(step, i === 5 ? 4200 : 3400); } };
    step();
  }
  function addDemoAgent() {
    const i = S.agents.length;
    const y = 1 - (i / 8) * 2;
    S.agents.push({ theta: i * 2.399963, phi: Math.acos(clamp(y, -1, 1)), kind: "agent", mag: 1, loveIdx: -1 });
    recomputeBalance();
  }
  function clusterOne() { // deliberately mis-place one agent
    const a = S.agents[S.agents.length - 1];
    a.theta = 0.3; a.phi = 0.6; recomputeBalance();
  }
  function forceExplodeDemo() {
    explode(true);
    say(pick(ALIEN.reset), 3200);
    // after demo break, hand over to the player's turn
    setTimeout(() => {
      closePanel(); S.exploded = false; S.speed = 0.12;
      document.getElementById("speed").value = 12;
      seedTriangle(); startPlay();
    }, 5200);
  }

  function startPlay() {
    S.phase = "play"; S.playing = true; S.exploded = false;
    hud(true); controls(true); homelink(true);
    document.getElementById("ctrl-hint").textContent = S.registry.length
      ? "Tap the sphere to add an agent. Your loved things ride on it. Keep it balanced."
      : "Tap the sphere to add an agent. Keep it balanced as it grows.";
    say(pick(ALIEN.yourturn), 3600);
  }

  function showLoss() {
    S.phase = "loss";
    const item = S.lossItem;
    const body = item
      ? `<p>The wobble exceeded tolerance. The classification failed, and the failure propagates outward. Along that trajectory, something you named is caught in it:</p>
         <div class="fict" style="border-style:solid;border-color:hsl(0 84% 65% / .5);background:hsl(0 84% 60% / .08);color:#fca5a5"><strong>“${escapeHtml(item)}”</strong><br/><span style="color:var(--muted);font-size:.8rem">— shown breaking along the trajectory the failed balance would cause. This is fictional. The imprint is yours to keep.</span></div>
         <p class="small">The methodology principle violated: <strong>speed amplifies imbalance</strong> (Wobble Control). Emit the 🪞 footprint — name what you just learned — and begin again. Your start position and your loved-things list are preserved. The stakes do not refresh, because your life does not refresh.</p>
         <div class="fict" style="border-style:solid;border-color:hsl(330 82% 60% / .5);background:hsl(330 82% 60% / .08);color:#fbcfe8"><strong>Here is the whole lesson.</strong><br/><span style="color:#f9a8d4">You balance the sphere <em>because</em> you love what rides on it. Love is the axis. Keep it centered and the structure spins without end — <em>love is the key to infinity</em>. ♥️🔑♾️<br/>The alien returns to your side, still smiling. It loves you. 👽♥️🥰 <em>I pray for peace.</em> 👁️🙏✌️</span></div>`
      : `<p>The wobble exceeded tolerance and the sphere broke. At low speed the mis-placement was absorbed; at high speed it was not.</p>
         <p class="small">Principle: <strong>the structure that holds slow may not hold fast</strong>. Begin again with the felt-knowledge of where your ceiling is.</p>`;
    openPanel(`
      <p class="eyebrow">Loss · attempt ${S.attempts}</p>
      <h2>The sphere broke</h2>
      ${body}
      <div class="btns"><button class="act primary" id="again">🪞 I see it — begin again</button></div>`);
    if (item) Sound.peace();
    document.getElementById("again").onclick = () => {
      closePanel(); S.exploded = false; S.fragments = []; loveTeachShown = false;
      S.speed = 0.12; document.getElementById("speed").value = 12;
      seedTriangle(); startPlay();
    };
  }
  function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  // ---------- input ----------
  cv.addEventListener("pointerdown", (e) => {
    if (S.phase !== "play" || !S.playing) return;
    const dx = e.clientX - CX(), dy = e.clientY - CY();
    if (dx * dx + dy * dy <= R() * R() * 1.1) addAgentAt(e.clientX, e.clientY);
  });
  document.getElementById("speed").addEventListener("input", (e) => {
    S.speed = e.target.value / 100;
    if (S.phase === "play" && S.speed > 0.6) say(pick(ALIEN.fast), 2400);
  });
  document.getElementById("btn-rebalance").onclick = () => { if (S.phase === "play") rebalance(); };
  document.getElementById("btn-registry-view").onclick = () => {
    if (!S.registry.length) { say("You are playing without the loss layer.", 2600); return; }
    say("Riding the sphere: <em>" + S.registry.map(escapeHtml).join(" · ") + "</em>", 4200);
  };

  // ---------- main loop ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    ctx.clearRect(0, 0, W, H);
    // background vignette
    const bg = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, Math.max(W,H)*0.7);
    bg.addColorStop(0, "rgba(20,22,34,0.6)"); bg.addColorStop(1, "rgba(7,7,10,0)");
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    S.alienBob += dt * 2.2;
    S.alienBlink -= dt; if (S.alienBlink < -3) S.alienBlink = 0.2;

    if (S.exploded) {
      drawFragments(dt);
    } else {
      // physics: spin + wobble
      const spinRate = S.baseSpeed * (1 + S.speed * 9); // faster with dial
      S.rot += spinRate * dt * 60;
      // tolerance shrinks as speed rises (Methodology 12)
      S.tolerance = lerp(0.85, 0.14, S.speed);
      // imbalance drives axis tilt; speed amplifies it
      const imb = S.imbalance || 0;
      const drive = imb * (0.4 + S.speed * 3.4);
      S.axisTiltVel += (drive - S.axisTilt * 0.06) * dt * (1 + S.speed * 4);
      S.axisTiltVel *= 0.985;
      S.axisTilt += S.axisTiltVel * dt;
      S.wobble = clamp(Math.abs(S.axisTilt) / 0.9, 0, 1);

      drawSphere();
      // guide sits below the sphere during demo/play
      if (S.phase === "demo" || S.phase === "play") drawAlien(CX() - R() * 1.35, CY() + R() * 0.6, 0.95);

      // HUD update
      document.getElementById("hud-agents").textContent = S.agents.length;
      const fill = document.getElementById("wobble-fill");
      const ratio = clamp(Math.abs(S.axisTilt) / S.tolerance, 0, 1.2);
      fill.style.width = Math.min(100, ratio * 100) + "%";
      fill.style.background = ratio < 0.6 ? "var(--green)" : ratio < 0.9 ? "var(--amber)" : "var(--red)";
      if (ratio > 0.85 && ratio < 1 && S.phase === "play" && Math.random() < 0.02) say(pick(ALIEN.danger), 1800);

      // audio: spin drone tracks live speed + wobble; chime when the sphere settles back into balance
      if (S.phase === "demo" || S.phase === "play") Sound.spin(S.speed, S.wobble);
      else Sound.spin(0, 0);
      if (S.phase === "play" && S.agents.length > 3) {
        if (ratio < 0.3 && S._wasWobbly) { Sound.chime(); S._wasWobbly = false; }
        else if (ratio > 0.6) S._wasWobbly = true;
      }

      // the lesson: hold a loved-laden sphere balanced at real speed => love is what keeps it whole
      if (S.phase === "play" && !loveTeachShown && S.registry.length &&
          S.agents.length >= 5 && S.speed > 0.45 && ratio < 0.45) {
        loveTeachShown = true;
        Sound.love();
        say(pick(ALIEN.lovekey), 5200);
      }

      // breach => explode (only while actually playing or in demo forced stage)
      if ((S.phase === "play" && S.playing) && Math.abs(S.axisTilt) > S.tolerance) explode();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- sound toggle (off by default; audio only created on user gesture) ----------
  const sbtn = document.getElementById("sound-toggle");
  if (sbtn) {
    sbtn.addEventListener("click", () => {
      if (Sound.on) {
        Sound.disable();
        sbtn.classList.remove("on");
        sbtn.textContent = "\uD83D\uDD07 Sound";
        sbtn.title = "Sound is off — click to enable";
      } else {
        const ok = Sound.enable();
        if (ok) {
          sbtn.classList.add("on");
          sbtn.textContent = "\uD83D\uDD0A Sound";
          sbtn.title = "Sound is on — click to mute";
        }
      }
    });
  }

  // boot
  intro();
})();
