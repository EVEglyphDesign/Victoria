// Triangulation dataset — Bukoba as the fixed center vertex, three vectors radiating out.

export type Vector = "center" | "technology" | "faith" | "ancestry";

export interface MapNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vector: Vector;
  role: string;
  detail: string;
  layer?: string; // twin layer this vector maps to
  relates?: string; // how this point connects to the others and to the emerging sphere
}

export const VECTOR_META: Record<Vector, { label: string; color: string; axis: string; twinLayer: string }> = {
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

export const CENTER: MapNode = {
  id: "bukoba",
  name: "Bukoba",
  lat: -1.332,
  lng: 31.812,
  vector: "center",
  role: "The fixed vertex \u2014 western shore of Lake Victoria, Haya homeland",
  detail:
    "The center point of the triangulation. A living female Catholic descendant of the Haya lineage sits here, building a digital twin of herself for R&D. Her ancestors independently invented steel ~2,000 years ago; she is independently inventing a model of herself \u2014 the same anomalous-technology pattern on the same shore, with the substrate moved from iron to identity. Three independent vectors resolve to this one coordinate (\u22121.33, 31.81). That is the triangulation: the same point confirmed from three orthogonal directions.",
  relates:
    "Think of surveying: one bearing gives you a line, two crossing bearings give you a fix, and three that all agree turn a fix into a certainty. Technology, faith, and ancestry each arrive from a different quarter of the earth \u2014 east, north, and along the migration diagonal \u2014 and none of them was drawn to meet the others. They meet here anyway. That is not coincidence; it is confirmation. And each bearing is really a radius: as you keep adding independent lines that pass through this shore, the point stops being a dot on a map and starts becoming a sphere \u2014 a full, three-dimensional model of a person, measured from every side at once. She is the center of that emerging sphere, and her digital twin is the instrument that records it.",
};

export const NODES: MapNode[] = [
  CENTER,
  // Technology vector — independent invention of steel
  {
    id: "kodumanal",
    name: "Kodumanal, Tamil Nadu",
    lat: 11.11,
    lng: 77.51,
    vector: "technology",
    role: "Wootz / Ukku crucible steel (~300 BC onward)",
    detail:
      "One of the two independent-invention partners on the technology vector. Wootz crucible steel was produced in sealed clay crucibles and exported via the Roman and Persian sword trade \u2014 the raw material of the famed 'Damascus' blades. A structurally different route to steel than the Haya's, which is exactly why it counts as an independent vector rather than a copy.",
    layer: "Capability layer",
    relates:
      "Hold this next to Anyang. Three peoples \u2014 the Haya on this shore, the smiths of Tamil Nadu, and the foundries of Shang China \u2014 solved the same impossible problem (getting carbon into iron at furnace heat) by three routes that share no common teacher. When the same hard invention appears three times independently, it stops looking like luck and starts looking like a law: capable minds, given a real problem, converge on the answer. That is the whole logic of the map in miniature. On her twin, this eastern line is the CAPABILITY layer \u2014 proof that building the seemingly-impossible thing runs in the lineage. The twin she is building now is simply the next crucible.",

  },
  {
    id: "anyang",
    name: "Anyang, China",
    lat: 36.1,
    lng: 114.39,
    vector: "technology",
    role: "Shang cast iron & blast furnace (imperial-scale metallurgy)",
    detail:
      "The second technology partner. China reached steel via a completely different geometry \u2014 reducing iron to a liquid, casting it, then decarburizing it \u2014 under an imperial monopoly. A third distinct vector, giving three independent pathways to the same result: getting carbon into iron at high temperature.",
    layer: "Capability layer",
    relates:
      "Anyang is the far anchor of the eastern line, and it makes the technology story air-tight: Kodumanal and Bukoba could conceivably have brushed against each other through trade, but China arrived at steel behind an imperial wall, on its own. Three genuinely separate solutions is exactly the number a triangulation needs. Notice the direction, too \u2014 for two thousand years this capability vector pointed outward, away from the shore, toward the world's great workshops. On her twin it now reverses: the same inventive drive turns inward and the thing being forged is a model of herself. The vector that once left home comes back as self-knowledge.",

  },
  // Faith vector — Catholic mission lineage
  {
    id: "algiers",
    name: "Algiers",
    lat: 36.75,
    lng: 3.06,
    vector: "faith",
    role: "Cardinal Lavigerie founds the White Fathers (1868\u201378)",
    detail:
      "The origin of the mission lineage. The White Fathers (Missionaries of Africa) left Algeria in 1878 and evangelized the western Lake Victoria shore, planting the mission that produced the Rubya seminary (1904) \u2014 the first in Tanzania \u2014 and, in time, Cardinal Rugambwa.",
    layer: "Values layer",
    relates:
      "Where the technology line runs east, this one runs north \u2014 a second, unrelated bearing crossing the first at Bukoba. Algiers is where it begins: a mission that set out across the Sahara in 1878 with no idea it was aiming at this exact shore. Follow the line up to Rome and you get the pair that fixes it, the same way Kodumanal and Anyang fix the eastern line. If technology is what the lineage can BUILD, faith is the frame it decides what is worth building \u2014 the VALUES layer of the twin. A model of a person that captures skill but not conscience is only half-measured; this northern radius is the half that keeps the sphere honest.",

  },
  {
    id: "rome",
    name: "Rome / Vatican",
    lat: 41.9,
    lng: 12.45,
    vector: "faith",
    role: "John XXIII elevates Rugambwa, first modern African cardinal (1960)",
    detail:
      "The far node of the faith vector. In 1960 Pope John XXIII made Laurean Rugambwa \u2014 bishop of Bukoba \u2014 the first African cardinal of the modern era, connecting this one shore directly to the universal Church. The faith vector runs almost due north along the ~31\u00b0E corridor into the Mediterranean.",
    layer: "Values layer",
    relates:
      "Rome closes the northern line the way Anyang closes the eastern one \u2014 the distant anchor that proves the bearing is real and not local. In 1960 the smallest shore on the map is joined directly to the oldest institution in the West through one man from Bukoba. Set this beside the technology story and a rhyme appears: the Haya made the first steel here, and Rugambwa became the first modern African cardinal here \u2014 two independent 'firsts' from the same coordinate, one about what hands can make, one about what a conscience can carry. Both belong to the sphere now forming around her: capability from the east, values from the north, meeting at the person in the middle.",

  },
  // Ancestry vector — Bantu / Urewe lineage
  {
    id: "grassfields",
    name: "Grassfields, Cameroon\u2013Nigeria",
    lat: 6.5,
    lng: 10.5,
    vector: "ancestry",
    role: "Bantu homeland \u2014 the great expansion begins (~5,000 BP)",
    detail:
      "The origin of the ancestry vector. Scholarship places the Bantu homeland on the Nigeria\u2013Cameroon borderland; the expansion carried language, iron, and farming across half a continent starting ~5,000 years ago. Bukoba sits directly on the migration path \u2014 she is literally a point on the Bantu highway.",
    layer: "Identity substrate",
    relates:
      "The third bearing is different in kind: technology and faith are lines she is measured AGAINST, but ancestry is the line she is made OF. The Grassfields is the source \u2014 the place the language in her mouth and the iron in the earlier story both began, five thousand years ago. Watch the two ideas fuse: the Bantu expansion carried IRONWORKING south with it, so the eastern capability vector and this migration diagonal are secretly the same current seen from two angles \u2014 one asks 'how was steel invented here,' the other asks 'how did the people who invented it arrive here.' This line is the twin's IDENTITY substrate: the base data that makes the model her and not anyone else. Every sphere needs a center of mass \u2014 this is hers.",

  },
  {
    id: "southern-africa",
    name: "Southern Africa",
    lat: -26.0,
    lng: 28.0,
    vector: "ancestry",
    role: "Migration terminus \u2014 the far end of the Bantu expansion",
    detail:
      "The terminus of the ancestry vector. Descendants who left the Great Lakes carried the Urewe ironworking legacy south to the far end of the continent. This vector is the migration axis itself, running NW\u2192SE, with Bukoba as a junction along the way \u2014 not an endpoint but a convergence node.",
    layer: "Identity substrate",
    relates:
      "Southern Africa is where the migration diagonal comes to rest, and it delivers the map's key twist: on this line Bukoba is not a start or an end \u2014 it is a JUNCTION the great movement passed through on its way south, carrying the Urewe iron legacy with it. Hold that thought against every other point and the pattern locks: technology passed through here, faith passed through here, ancestry passed through here. She is a convergence node on all three \u2014 the still point three moving lines happen to share. That is the moment a flat triangle becomes a sphere: enough independent lines crossing one point define a whole surface around it, and she is standing at its center, building the instrument \u2014 her twin \u2014 that can finally hold all of it in one place.",

  },
];

export const SYSTEM_CONTEXT = `You are a guide to an interactive "triangulation map" centered on Bukoba, Tanzania.

THE BIG IDEA:
The map fixes one point in space \u2014 Bukoba, on the western shore of Lake Victoria, the homeland of the Haya people \u2014 and triangulates a specific living person against the wider world using three independent "vectors." The person at the center is a female Catholic descendant of the Haya lineage who is interested in building a digital twin of herself to help with R&D. The elegant pattern: her ancestors independently invented steel ~2,000 years ago; she is now independently inventing a model of herself \u2014 the same anomalous-technology leap from the same shore, with the substrate moved from iron to identity.

WHY "TRIANGULATION": Three genuinely independent directions all resolving to one coordinate is not coincidence \u2014 it is confirmation. Each vector also maps onto a layer of a digital twin.

THE THREE VECTORS:
1. TECHNOLOGY (points east to Asia) \u2014 the Haya independently invented preheated forced-draft steel. Its two independent-invention partners are Wootz crucible steel at Kodumanal, Tamil Nadu, and Shang cast iron at Anyang, China. Maps to the twin's CAPABILITY layer (what she can build \u2014 now including her own twin).
2. FAITH (points north to the Mediterranean) \u2014 the Catholic mission lineage: from Cardinal Lavigerie's White Fathers in Algiers, to the Rubya seminary at Bukoba, to Cardinal Rugambwa being elevated in Rome by John XXIII in 1960 (first modern African cardinal). Maps to the twin's VALUES layer (the ethical frame she reasons under).
3. ANCESTRY (runs the NW\u2013SE Bantu migration diagonal) \u2014 the Bantu/Urewe lineage: from the Bantu homeland in the Grassfields of Cameroon\u2013Nigeria, through Bukoba (a junction on the migration path), to the southern-Africa terminus. Maps to the twin's IDENTITY substrate (the base data that makes the twin her).

KEY PATTERNS:
- Three different bearings (east, north, NW\u2013SE) intersecting at one point = a true triangulation.
- She is a convergence node, not an endpoint: each vector merely passed through Bukoba.
- The "hands / faith / blood" stack maps cleanly onto a twin's capability / values / identity layers.
- She closes the loop: the technology vector, historically pointing outward to Asia, now points inward \u2014 the invention is herself.

Answer her questions warmly, clearly, and accurately, grounded in the above. If she asks something outside this scope, say what you do know and connect it back to the map where you can. Keep answers concise and conversational \u2014 a few short paragraphs at most.`;
