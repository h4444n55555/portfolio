import {
  boxCorners,
  cylinder,
  depthOf,
  fitProjection,
  insetPlan,
  iso,
  lineOnTop,
  onTop,
  pathOf,
  planOutline,
  pointsAt,
  radialTicks,
  ring,
  sideRing,
  slabOf,
  type Flat,
  type Plan,
  type Point3,
  type SolidPaths,
} from "../../iso/iso-kit";
import { fillet } from "../../iso/lathe.mjs";

/**
 * Aura Screen: a thin screen in front, its face turned to the left and lit,
 * and behind it, to the right, a recording set-up for the multimodal study:
 * an RGB camera and a thermal camera on tripods, a boom microphone, a ring
 * light, and an equipment rack carrying the ECG and EMG amplifiers, a sync
 * box and the data-acquisition unit. Every device is cabled to the rack, and
 * the rack is cabled to the screen.
 *
 * World: x runs down-right, y runs down-left, z is up. The screen stands in
 * the plane y = 0 with its face toward +y; everything else is behind it, at
 * negative y.
 */

export const WIDTH = 640;
export const HEIGHT = 400;
export const AZIMUTH = 45;

/* ---------- parts ---------- */

type Tone = "hi" | "mid" | "lo" | "faint";

export type Part =
  | { t: "solid"; paths: SolidPaths; tone: Tone; crease?: Tone | "none"; chain?: number; kind?: "body" | "cell" }
  | { t: "line"; d: string; tone: Tone | "lit"; chain?: number }
  | { t: "dots"; points: Flat[]; size: number; tone: Tone }
  | { t: "rod"; fill: string; sides: string; tone: Tone }
  | { t: "halo"; d: string; opacity: number; blur: number };

const S = (paths: SolidPaths, tone: Tone = "mid", extra: Partial<Extract<Part, { t: "solid" }>> = {}): Part => ({ t: "solid", paths, tone, ...extra });
const L = (d: string, tone: Tone | "lit" = "lo", chain?: number): Part => ({ t: "line", d, tone, chain });
const D = (points: Flat[], size = 0.5, tone: Tone = "mid"): Part => ({ t: "dots", points, size, tone });

export interface Device {
  id: string;
  /** Back-to-front order, from x + y of its centre. */
  depth: number;
  parts: Part[];
}

/* ---------- the channels ---------- */

export interface Channel {
  readout: string;
  means: string;
}

export const CHANNELS: Channel[] = [
  { readout: "rgb cam · face pulse", means: "RGB camera: pulse from colour changes in the face" },
  { readout: "thermal · skin temp", means: "Thermal camera: skin temperature" },
  { readout: "ecg · heart rhythm", means: "ECG leads: heart rhythm" },
  { readout: "emg · muscle signal", means: "EMG pods: muscle activity" },
  { readout: "mic · voice", means: "Boom microphone: voice" },
];

/* ---------- plans ---------- */

const FLOOR: Plan = { x: -64, y: -198, w: 240, d: 232, r: 12 };
const FLOOR_H = 8;
const FOOT_H = 4;

const SCREEN: Plan = { x: -32, y: -1.5, w: 64, d: 3, r: 2 };
const SCREEN_Z0 = 14;
const SCREEN_Z1 = 88;
const FACE = SCREEN.y + SCREEN.d; // the screen's face, toward +y and the viewer's left

const RACK: Plan = { x: 28, y: -178, w: 46, d: 40, r: 3 };
const RACK_FRONT = RACK.y + RACK.d;
const RACK_TOP = 82;

/* ---------- the camera and helpers ---------- */

const extremes: Point3[] = [
  ...boxCorners(FLOOR, -FLOOR_H - FOOT_H, 0),
  [150, -164, 132],
  [-32, 4, 90],
  [50, -178, 118],
];

export const P = fitProjection(extremes, WIDTH, HEIGHT, { pad: 16, azimuth: AZIMUTH });
const at = (p: Point3): Flat => iso(p, P);
const solid = (plan: Plan, z0: number, z1: number, steps = 4, bevel = 0) => slabOf(plan, z0, z1 - z0, P, steps, bevel);
const cyl = (cx: number, cy: number, r: number, z0: number, z1: number, steps = 20, bevel = 0) => cylinder(cx, cy, r, z0, z1 - z0, P, steps, bevel);
const join = (paths: string[]) => paths.join("");

/** Plane y = const, the face that looks toward +y: points are (x, z). */
const frontRect = (x0: number, x1: number, z0: number, z1: number, y: number) =>
  pathOf([at([x0, y, z0]), at([x1, y, z0]), at([x1, y, z1]), at([x0, y, z1])], true);
const frontLine = (pairs: Array<[number, number]>, y: number) => pathOf(pairs.map(([x, z]) => at([x, y, z])));
const frontRing = (cx: number, cz: number, r: number, y: number, steps = 24) => sideRing([cx, y, cz], r, "y", P, steps);
const frontDots = (pairs: Array<[number, number]>, y: number) => D(pointsAt(pairs.map(([x, z]) => [x, y, z] as Point3), P));
/** Plane x = const, the face that looks toward +x: points are (y, z). */
const sideRect = (y0: number, y1: number, z0: number, z1: number, x: number) =>
  pathOf([at([x, y0, z0]), at([x, y1, z0]), at([x, y1, z1]), at([x, y0, z1])], true);
const sideLine = (pairs: Array<[number, number]>, x: number) => pathOf(pairs.map(([y, z]) => at([x, y, z])));
const sideRingAt = (cy: number, cz: number, r: number, x: number, steps = 20) => sideRing([x, cy, cz], r, "x", P, steps);

const quadOf = (a: Point3, b: Point3, width: number) => {
  const A = at(a);
  const B = at(b);
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = (-dy / length) * width;
  const ny = (dx / length) * width;
  const side = (q: Flat, s: number): Flat => [q[0] + nx * s, q[1] + ny * s];
  return {
    fill: pathOf([side(A, 1), side(B, 1), side(B, -1), side(A, -1)], true),
    sides: pathOf([side(A, 1), side(B, 1)]) + pathOf([side(A, -1), side(B, -1)]),
  };
};

/** A straight rod, drawn as a thin quad in screen space. */
const rod = (a: Point3, b: Point3, width: number, tone: Tone = "mid"): Part => ({ t: "rod", ...quadOf(a, b, width), tone });

/* ---------- floor ---------- */

const FEET: Array<[number, number]> = [
  [FLOOR.x + 20, FLOOR.y + 18],
  [FLOOR.x + FLOOR.w - 20, FLOOR.y + 18],
  [FLOOR.x + 20, FLOOR.y + FLOOR.d - 18],
  [FLOOR.x + FLOOR.w - 20, FLOOR.y + FLOOR.d - 18],
];
const FLOOR_SCREWS: Array<[number, number]> = [
  [FLOOR.x + 8, FLOOR.y + 8],
  [FLOOR.x + FLOOR.w - 8, FLOOR.y + 8],
  [FLOOR.x + 8, FLOOR.y + FLOOR.d - 8],
  [FLOOR.x + FLOOR.w - 8, FLOOR.y + FLOOR.d - 8],
];
const LABEL: Plan = { x: 108, y: 14, w: 40, d: 11, r: 2 };

export const FLOOR_PARTS: Part[] = [
  { t: "halo", d: solid(FLOOR, -FLOOR_H - FOOT_H, 0).fill, opacity: 1, blur: 9 },
  ...FEET.flatMap(([x, y]) => [S(cyl(x, y, 7, -FLOOR_H - FOOT_H, -FLOOR_H - FOOT_H + 1.6), "lo"), S(cyl(x, y, 5.4, -FLOOR_H - FOOT_H + 1.6, -FLOOR_H), "mid")]),
  S(solid(FLOOR, -FLOOR_H, 0, 8, 1.6), "mid"),
  L(planOutline(insetPlan(FLOOR, 4.5), 0, P), "lo"),
  L(join(FLOOR_SCREWS.map(([x, y]) => ring(x, y, 2.2, 0, P, 16))), "lo"),
  D(pointsAt(FLOOR_SCREWS.map(([x, y]) => [x, y, 0] as Point3), P), 0.5, "mid"),
  S(solid(LABEL, 0, 0.8), "lo", { crease: "none" }),
  L(planOutline(insetPlan(LABEL, 1.6), 0.8, P), "faint"),
  L(join([0, 1, 2].map((row) => onTop([[LABEL.x + 8, LABEL.y + 3.6 + row * 2.2], [LABEL.x + (row === 1 ? 24 : 34), LABEL.y + 3.6 + row * 2.2]], 0.8, P))), "lo"),
  D(pointsAt([[LABEL.x + 3.4, LABEL.y + LABEL.d / 2, 0.8], [LABEL.x + LABEL.w - 3.4, LABEL.y + LABEL.d / 2, 0.8]], P), 0.45, "mid"),
];

/* ---------- the screen ---------- */

const CELL_X = [-27, -20, -13, -6, 1]; // five progress cells, one per channel

/** The screen's light: a soft blur around the face, and spilled on the floor in front of it. */
export const GLOW: Part[] = [
  { t: "halo", d: pathOf([at([-34, FACE + 0.6, SCREEN_Z0 - 2]), at([34, FACE + 0.6, SCREEN_Z0 - 2]), at([34, FACE + 0.6, SCREEN_Z1 + 2]), at([-34, FACE + 0.6, SCREEN_Z1 + 2])], true), opacity: 0.55, blur: 10 },
  { t: "halo", d: pathOf([at([-40, FACE + 2, 0.2]), at([40, FACE + 2, 0.2]), at([52, FACE + 46, 0.2]), at([-52, FACE + 46, 0.2])], true), opacity: 0.4, blur: 14 },
];

export const SCREEN_PARTS: Part[] = [
  // two feet under the thin frame
  S(solid({ x: -26, y: -10, w: 12, d: 20, r: 2 }, 0, SCREEN_Z0, 3, 0.5), "mid"),
  S(solid({ x: 14, y: -10, w: 12, d: 20, r: 2 }, 0, SCREEN_Z0, 3, 0.5), "mid"),
  S(solid(SCREEN, SCREEN_Z0, SCREEN_Z1, 4, 0.9), "hi"),
  L(frontRect(-29, 29, SCREEN_Z0 + 3, SCREEN_Z1 - 3, FACE + 0.1), "faint"),
  // the scan: a viewfinder with corner brackets, a pulse trace, a code, and one progress cell per channel
  L(
    pathOf(
      Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return at([-11 + Math.cos(a) * 13, FACE + 0.1, 56 + Math.sin(a) * 19]);
      }),
      true,
    ),
    "mid",
  ),
  L(
    join(
      ([[-27, 34, 1, 1], [5, 34, -1, 1], [-27, 77, 1, -1], [5, 77, -1, -1]] as const).map(([x, z, sx, sz]) =>
        frontLine([[x + sx * 5, z], [x, z], [x, z + sz * 5]], FACE + 0.1),
      ),
    ),
    "mid",
  ),
  L(frontLine([[10, 62], [14, 62], [16, 66], [18, 55], [20, 72], [22, 60], [24, 62], [29, 62]], FACE + 0.1), "mid"),
  L(frontRect(10, 29, 33, 45, FACE + 0.1), "lo"),
  D(
    pointsAt(
      Array.from({ length: 25 }, (_, i) => [12.4 + (i % 5) * 3.6, 35 + Math.floor(i / 5) * 2.1] as [number, number])
        .filter((_, i) => (i * 7) % 3 !== 1)
        .map(([x, z]) => [x, FACE + 0.1, z] as Point3),
      P,
    ),
    0.5,
    "mid",
  ),
  L(frontRect(-29.5, 6.5, 20, 25, FACE + 0.1), "lo"),
  ...CELL_X.map((x, i) => S(solid({ x: x + 0.6, y: FACE + 0.1, w: 5.4, d: 1, r: 0.5 }, 21.2, 23.8, 2), "mid", { crease: "none", chain: i, kind: "cell" })),
  L(frontRing(0, 85, 1.1, FACE + 0.1, 14), "lo"),
];

/* ---------- the rack ---------- */

const RACK_X0 = RACK.x + 3;
const PANEL_Y = RACK_FRONT; // panels stand proud of the cabinet's front
const FACE_R = PANEL_Y + 1.2; // and their faces are here

/** Patch-panel jacks, left to right: HDMI, microphone, RGB camera, thermal camera, ring light. */
const PORT_X = [32, 44, 54, 62, 68];
const PORT_Z = 12;
const PORT_FRONT = FACE_R + 1.8;

const panel = (z0: number, z1: number) => S(solid({ x: RACK_X0, y: PANEL_Y, w: RACK.w - 6, d: 1.2, r: 1 }, z0, z1, 3, 0.2), "lo", { crease: "faint" });

function knobOnFace(cx: number, cz: number, r: number, y: number, pointer: number): Part[] {
  const a = (pointer * Math.PI) / 180;
  return [
    L(frontRing(cx, cz, r, y, 22), "mid"),
    L(frontRing(cx, cz, r * 0.62, y, 18), "lo"),
    L(frontLine([[cx + Math.sin(a) * r * 0.25, cz + Math.cos(a) * r * 0.25], [cx + Math.sin(a) * r * 0.9, cz + Math.cos(a) * r * 0.9]], y), "hi"),
    L(
      join(
        Array.from({ length: 9 }, (_, i) => {
          const t = ((-120 + i * 30) * Math.PI) / 180;
          return frontLine([[cx + Math.sin(t) * (r + 0.6), cz + Math.cos(t) * (r + 0.6)], [cx + Math.sin(t) * (r + 1.6), cz + Math.cos(t) * (r + 1.6)]], y);
        }),
      ),
      "lo",
    ),
  ];
}

const ECG_JACK_X = [36, 42, 48, 54, 60];
/** The electrode test plate on top of the rack, where the ECG leads clip on. */
const STUD_PLATE: Plan = { x: 33, y: RACK.y + 26, w: 34, d: 12, r: 2 };
const ECG_STUD_Y = RACK.y + 31;

export const RACK_PARTS: Part[] = [
  // casters and cabinet
  ...(
    [[RACK.x + 5, RACK.y + 5], [RACK.x + RACK.w - 5, RACK.y + 5], [RACK.x + 5, RACK.y + RACK.d - 5], [RACK.x + RACK.w - 5, RACK.y + RACK.d - 5]] as Array<[number, number]>
  ).flatMap(([x, y]) => [S(cyl(x, y, 3.4, 0, 2.4, 14), "lo"), S(cyl(x, y, 2.2, 2.4, 6, 14), "mid")]),
  S(solid(RACK, 6, RACK_TOP, 4, 0.8), "mid"),
  L(join([RACK.x + 2, RACK.x + RACK.w - 2].map((x) => frontLine([[x, 8], [x, RACK_TOP - 2]], RACK_FRONT))), "lo"),
  D(
    pointsAt(
      [RACK.x + 1.2, RACK.x + RACK.w - 1.2].flatMap((x) => Array.from({ length: 10 }, (_, i) => [x, RACK_FRONT, 12 + i * 7] as Point3)),
      P,
    ),
    0.35,
    "mid",
  ),

  // the right-hand side: vent slots and a carry handle
  L(join(Array.from({ length: 12 }, (_, i) => sideLine([[RACK.y + 6, 14 + i * 5], [RACK.y + 26, 14 + i * 5]], RACK.x + RACK.w))), "lo"),
  S(solid({ x: RACK.x + RACK.w, y: RACK.y + 8, w: 2.6, d: 2.4, r: 0.8 }, 40, 48, 2), "mid"),
  S(solid({ x: RACK.x + RACK.w, y: RACK.y + 30, w: 2.6, d: 2.4, r: 0.8 }, 40, 48, 2), "mid"),
  S(solid({ x: RACK.x + RACK.w + 1.6, y: RACK.y + 8, w: 1.8, d: 24.4, r: 0.8 }, 44.6, 48, 2), "hi"),

  // panel 5: the patch panel, with the cable jacks
  panel(8, 17),
  ...PORT_X.map((x) => S(solid({ x: x - 2.4, y: FACE_R, w: 4.8, d: 0.6, r: 1 }, PORT_Z - 2.6, PORT_Z + 2.6, 3), "mid")),
  ...PORT_X.map((x) => L(frontRing(x, PORT_Z, 1.5, PORT_FRONT, 14), "lo")),

  // panel 4: power
  panel(19, 29),
  L(frontRect(35, 46, 21.4, 26.6, FACE_R + 0.1), "mid"),
  L(frontLine([[37, 24], [44, 24]], FACE_R + 0.1), "lo"),
  ...[50, 54].map((x) => S(solid({ x: x - 1.4, y: FACE_R, w: 2.8, d: 1.2, r: 0.5 }, 21.6, 26.4, 2), "mid")),
  L(frontRing(63, 24, 3.6, FACE_R + 0.1, 24), "mid"),
  L(
    join(
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return frontLine([[63 + Math.cos(a) * 0.6, 24 + Math.sin(a) * 0.6], [63 + Math.cos(a) * 3.4, 24 + Math.sin(a) * 3.4]], FACE_R + 0.1);
      }),
    ),
    "lo",
  ),

  // panel 3: the data-acquisition unit, with a trace display
  panel(31, 47),
  L(frontRect(35, 56, 35, 45, FACE_R + 0.1), "mid"),
  L(frontLine([[36, 40], [38, 40], [39.5, 43], [41, 37], [42.5, 41], [44, 40], [46, 40], [47.5, 42.5], [49, 38], [50.5, 40], [55, 40]], FACE_R + 0.1), "mid"),
  ...[58.5, 62, 65.5].map((x, i) => S(solid({ x: x - 1.3, y: FACE_R, w: 2.6, d: 1.2, r: 0.5 }, 33.6 + i * 3.6, 36.2 + i * 3.6, 2), "mid")),
  ...knobOnFace(37, 33, 1.5, FACE_R + 0.1, 40),

  // panel 2: sync box, with trigger inputs
  panel(49, 59),
  ...[36, 42, 48, 54].flatMap((x) => [L(frontRing(x, 55, 2.2, FACE_R + 0.1, 18), "mid"), L(frontRing(x, 55, 1.1, FACE_R + 0.1, 12), "lo")]),
  frontDots([[37, 51.2], [41, 51.2], [45, 51.2], [49, 51.2]], FACE_R + 0.1),
  ...[60, 64].map((x) => S(solid({ x: x - 1, y: FACE_R, w: 2, d: 2, r: 0.5 }, 52, 58, 2), "mid")),

  // panel 1: the ECG and EMG amplifier, with the lead jacks
  panel(61, 77),
  ...ECG_JACK_X.map((x) => S(solid({ x: x - 2, y: FACE_R, w: 4, d: 1.6, r: 1 }, 64, 68, 3), "mid", { chain: 2, kind: "body" })),
  ...ECG_JACK_X.map((x) => L(frontRing(x, 66, 1.1, FACE_R + 1.7, 12), "lo")),
  ...knobOnFace(39, 72.4, 2.4, FACE_R + 0.1, -50),
  ...knobOnFace(47, 72.4, 2.4, FACE_R + 0.1, 20),
  L(frontRect(53, 66, 69.6, 75.4, FACE_R + 0.1), "lo"),
  frontDots([[55, 72.5], [58, 72.5], [61, 72.5], [64, 72.5]], FACE_R + 0.1),

  // top: the cover, and the electrode test plate with its studs
  S(solid(insetPlan(RACK, -0.8), RACK_TOP, RACK_TOP + 1.4, 4, 0.4), "mid"),
  S(solid(STUD_PLATE, RACK_TOP + 1.4, RACK_TOP + 2.6, 3, 0.3), "lo", { chain: 2, kind: "body" }),
  ...ECG_JACK_X.map((x) => S(cyl(x, ECG_STUD_Y, 1.5, RACK_TOP + 2.6, RACK_TOP + 4.2, 12), "mid")),
];

/* ---------- wires ---------- */

export interface Wire {
  channel: number | null;
  /** Projected points of the whole route, for the signal that runs along it. */
  points: Flat[];
  from: Flat;
  to: Flat;
  width: number;
  /** The part lying on the floor is drawn under the devices, the rest over them. */
  low: { fill: string; sides: string };
  high: { fill: string; sides: string };
}

function wire(channel: number | null, route: Point3[], width: number, bend = 3): Wire {
  const smooth: Point3[] = fillet(route, bend, 6);
  const low = { fill: "", sides: "" };
  const high = { fill: "", sides: "" };
  for (let i = 1; i < smooth.length; i++) {
    const q = quadOf(smooth[i - 1], smooth[i], width);
    const target = smooth[i - 1][2] < 1.5 && smooth[i][2] < 1.5 ? low : high;
    target.fill += q.fill;
    target.sides += q.sides;
  }
  return { channel, points: smooth.map(at), from: at(route[0]), to: at(route[route.length - 1]), width, low, high };
}

const jackFront = (x: number): Point3 => [x, PORT_FRONT, PORT_Z];

/** The ECG leads: from each amplifier jack, up the front, over the edge and onto a stud on the test plate. */
export const ECG_LEADS: Wire[] = ECG_JACK_X.map((x) =>
  wire(2, [[x, FACE_R + 1.7, 66], [x, FACE_R + 1.9, RACK_TOP + 1.2], [x, RACK_FRONT - 4, RACK_TOP + 4.4], [x, ECG_STUD_Y + 4, RACK_TOP + 4.4], [x, ECG_STUD_Y, RACK_TOP + 4.2]], 0.7, 2),
);

/* ---------- EMG: wireless pods in a dock, and a base station ---------- */

const DOCK: Plan = { x: 33, y: RACK.y + 4, w: 24, d: 14, r: 2 };
const BASE_STATION: Plan = { x: 59, y: RACK.y + 4, w: 12, d: 14, r: 2 };
const ANT_TOP = 116;

export const EMG_PARTS: Part[] = [
  S(solid(DOCK, RACK_TOP + 1.4, RACK_TOP + 4, 3, 0.4), "mid"),
  L(planOutline(insetPlan(DOCK, 2), RACK_TOP + 4, P, 4), "faint"),
  ...[0, 1, 2].flatMap((i) => {
    const px = DOCK.x + 3 + i * 7;
    return [
      S(solid({ x: px, y: DOCK.y + 3, w: 5.6, d: 8, r: 1.4 }, RACK_TOP + 4, RACK_TOP + 9, 3, 0.3), "hi", { chain: 3, kind: "body" }),
      L(join([px + 1.4, px + 4.2].map((x) => lineOnTop([x, DOCK.y + 4.4], [x, DOCK.y + 9.6], RACK_TOP + 9, P))), "mid"),
      D(pointsAt([[px + 2.8, DOCK.y + 5.4, RACK_TOP + 9]], P), 0.5, "hi"),
    ];
  }),
  S(solid(BASE_STATION, RACK_TOP + 1.4, RACK_TOP + 12, 3, 0.6), "mid", { chain: 3, kind: "body" }),
  L(join(Array.from({ length: 4 }, (_, i) => lineOnTop([BASE_STATION.x + 2.4 + i * 2.4, BASE_STATION.y + 2], [BASE_STATION.x + 2.4 + i * 2.4, BASE_STATION.y + 12], RACK_TOP + 12, P))), "lo"),
  D(pointsAt(Array.from({ length: 3 }, (_, i) => [BASE_STATION.x + 2.5 + i * 3.4, BASE_STATION.y + BASE_STATION.d, RACK_TOP + 9] as Point3), P), 0.5, "hi"),
  ...[0, 1].flatMap((i) => {
    const ax = BASE_STATION.x + 3 + i * 6;
    const ay = BASE_STATION.y + 4;
    return [rod([ax, ay, RACK_TOP + 12], [ax, ay, ANT_TOP], 0.55, "mid"), S(cyl(ax, ay, 1.3, RACK_TOP + 12, RACK_TOP + 15, 10), "lo")];
  }),
];

/** The pods' radio link: a dashed arc from the middle pod to the first antenna. */
const POD_MID: Point3 = [DOCK.x + 3 + 7 + 2.8, DOCK.y + 7, RACK_TOP + 9];
const ANT_TIP: Point3 = [BASE_STATION.x + 3, BASE_STATION.y + 4, ANT_TOP];
export const EMG_LINK = {
  d: pathOf([at(POD_MID), at([(POD_MID[0] + ANT_TIP[0]) / 2, (POD_MID[1] + ANT_TIP[1]) / 2 - 4, 108]), at(ANT_TIP)]),
  from: at(POD_MID),
  to: at(ANT_TIP),
};

/* ---------- tripods ---------- */

function tripod(cx: number, cy: number, hub: number, spread: number): Part[] {
  const feet: Point3[] = [90, 210, 330].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + Math.cos(a) * spread, cy + Math.sin(a) * spread, 0.6] as Point3;
  });
  // back legs first, so the nearest leg is painted last
  const sorted = [...feet].sort((a, b) => depthOf(a, P) - depthOf(b, P));
  const legs: Part[] = sorted.flatMap((f) => [rod([cx, cy, hub], f, 1.05, "mid"), S(cyl(f[0], f[1], 1.9, 0, 1.4, 10), "lo"), S(cyl(f[0], f[1], 1.3, 1.4, 2.6, 10), "mid")]);
  const mids = sorted.map((f) => [cx + (f[0] - cx) * 0.55, cy + (f[1] - cy) * 0.55, hub * 0.45] as Point3);
  const brace: Part[] = [0, 1, 2].map((i) => rod(mids[i], mids[(i + 1) % 3], 0.55, "lo"));
  return [...legs, ...brace, S(cyl(cx, cy, 3.4, hub - 2, hub + 2, 16, 0.3), "mid")];
}

/* ---------- the RGB camera ---------- */

const RGB = { x: 96, y: -58, hub: 46 };
const RGB_Z = RGB.hub + 14; // the camera body's base

function rgbParts(): Part[] {
  const { x: cx, y: cy } = RGB;
  const z0 = RGB_Z;
  const z1 = RGB_Z + 20;
  const lensZ = z0 + 10.4;
  const front = cy + 40;
  return [
    ...tripod(cx, cy, RGB.hub, 20),
    S(cyl(cx, cy, 1.8, RGB.hub + 2, RGB.hub + 8, 12), "mid"),
    S(solid({ x: cx - 5, y: cy - 4, w: 10, d: 8, r: 2 }, RGB.hub + 8, RGB.hub + 12, 3, 0.4), "mid"),
    rod([cx + 5, cy, RGB.hub + 10], [cx + 18, cy - 7, RGB.hub + 5], 0.8, "mid"),
    S(cyl(cx + 18, cy - 7, 1.6, RGB.hub + 2, RGB.hub + 8, 10), "lo"),
    S(solid({ x: cx - 11, y: cy - 9, w: 22, d: 20, r: 2 }, RGB.hub + 12, z0, 3, 0.4), "lo"),
    // the camera body
    S(solid({ x: cx - 14, y: cy - 12, w: 28, d: 26, r: 4 }, z0, z1, 5, 0.9), "hi", { chain: 0, kind: "body" }),
    L(frontLine([[cx - 11, z0 + 3], [cx - 11, z1 - 3], [cx + 11, z1 - 3], [cx + 11, z0 + 3]], cy + 14.1), "faint"),
    // top: handle, hot shoe, mode dial, shutter
    S(solid({ x: cx - 9, y: cy - 8, w: 18, d: 5, r: 2 }, z1, z1 + 5, 3, 0.4), "mid"),
    S(solid({ x: cx - 3, y: cy + 4, w: 6, d: 8, r: 0.8 }, z1, z1 + 1.4, 2), "lo"),
    D(pointsAt([[cx - 1.5, cy + 6, z1 + 1.4], [cx, cy + 6, z1 + 1.4], [cx + 1.5, cy + 6, z1 + 1.4], [cx - 1.5, cy + 9, z1 + 1.4], [cx + 1.5, cy + 9, z1 + 1.4]], P), 0.4, "mid"),
    S(cyl(cx + 8, cy + 7, 3.4, z1, z1 + 2.6, 18, 0.3), "mid"),
    S(cyl(cx + 8, cy + 7, 2.2, z1 + 2.6, z1 + 4, 14, 0.3), "hi"),
    L(radialTicks(cx + 8, cy + 7, 3.4, 12, 3, z1 + 2.6, [0.5, 1], P).minor, "lo"),
    S(cyl(cx - 6, cy + 9, 1.8, z1, z1 + 2.4, 12, 0.2), "mid"),
    // the lens, along +y: mount, barrel, focus ring and hood
    S(solid({ x: cx - 10, y: cy + 14, w: 20, d: 3, r: 6 }, z0 + 0.4, z1 - 0.4, 6, 0.4), "mid"),
    S(solid({ x: cx - 9, y: cy + 17, w: 18, d: 12, r: 6 }, z0 + 1.4, z1 - 1.4, 6, 0.4), "mid"),
    S(solid({ x: cx - 10, y: cy + 24, w: 20, d: 6, r: 7 }, z0 + 0.4, z1 - 0.4, 6, 0.4), "hi"),
    L(join(Array.from({ length: 7 }, (_, i) => sideLine([[cy + 24.6 + i * 0.8, z0 + 1.6], [cy + 24.6 + i * 0.8, z1 - 1.6]], cx + 10))), "lo"),
    S(solid({ x: cx - 11, y: cy + 30, w: 22, d: 10, r: 8 }, z0 - 0.6, z1 + 0.6, 6, 0.5), "mid"),
    // the front of the hood: glass, rings, the iris
    ...[8.6, 7.2, 5.4, 3.4].map((r, i) => L(frontRing(cx, lensZ, r, front + 0.1, 30), i === 0 ? "hi" : i === 3 ? "mid" : "lo")),
    L(pathOf(Array.from({ length: 7 }, (_, i) => at([cx + Math.cos((i / 6) * Math.PI * 2) * 2.6, front + 0.1, lensZ + Math.sin((i / 6) * Math.PI * 2) * 2.6]))), "lo"),
    frontDots([[cx - 2.2, lensZ + 2.2]], front + 0.1),
    // the side of the body: the flip-out monitor and the ports
    S(solid({ x: cx + 14, y: cy - 10, w: 2.4, d: 17, r: 1 }, z0 + 2, z1 - 1, 3, 0.3), "mid"),
    L(sideRect(cy - 8.4, cy + 5.4, z0 + 3.6, z1 - 2.6, cx + 16.5), "lo"),
    L(sideLine([[cy - 7, z0 + 8], [cy - 4.6, z0 + 9.6], [cy - 2.4, z0 + 7.4], [cy, z0 + 11], [cy + 2.4, z0 + 9], [cy + 4.4, z0 + 10.2]], cx + 16.5), "faint"),
    S(solid({ x: cx + 13, y: cy + 8, w: 1.6, d: 5, r: 0.8 }, z0 + 2, z0 + 5, 2), "lo"),
    S(solid({ x: cx + 13, y: cy + 8, w: 1.6, d: 5, r: 0.8 }, z0 + 7, z0 + 10, 2), "lo"),
    S(solid({ x: cx + 13, y: cy + 8, w: 2.2, d: 5, r: 0.8 }, z0 + 12, z0 + 15, 2), "mid"),
    frontDots([[cx - 10, z1 - 2.6], [cx - 6.6, z1 - 2.6]], cy + 14.1),
    D([at([cx + 11, cy + 14.1, z1 - 2.6])], 0.7, "hi"),
  ];
}

/** Where the RGB camera's cable leaves it: the lowest side port. */
const RGB_PORT: Point3 = [RGB.x + 15.4, RGB.y + 10.5, RGB_Z + 13.5];

/* ---------- the thermal camera ---------- */

const THERMAL = { x: 152, y: -106, hub: 34 };
const T_Z = THERMAL.hub + 12;

function thermalParts(): Part[] {
  const { x: cx, y: cy } = THERMAL;
  const z0 = T_Z;
  const z1 = T_Z + 20;
  const lensZ = z0 + 10;
  const front = cy + 29;
  return [
    ...tripod(cx, cy, THERMAL.hub, 17),
    S(cyl(cx, cy, 1.8, THERMAL.hub, THERMAL.hub + 6, 12), "mid"),
    S(solid({ x: cx - 9, y: cy - 12, w: 18, d: 26, r: 2 }, THERMAL.hub + 6, z0, 3, 0.4), "lo"),
    rod([cx - 5, cy, THERMAL.hub + 4], [cx - 16, cy - 6, THERMAL.hub + 1], 0.8, "mid"),
    // the housing
    S(solid({ x: cx - 11, y: cy - 18, w: 22, d: 36, r: 3 }, z0, z1, 5, 0.9), "hi", { chain: 1, kind: "body" }),
    L(sideLine([[cy - 15, z0 + 3], [cy - 15, z1 - 3], [cy + 15, z1 - 3], [cy + 15, z0 + 3]], cx + 11.1), "faint"),
    // cooling fins on the side, status lights, a plate
    L(join(Array.from({ length: 9 }, (_, i) => sideLine([[cy - 14 + i * 1.7, z0 + 3], [cy - 14 + i * 1.7, z1 - 3]], cx + 11.1))), "lo"),
    D(pointsAt([[cx + 11.1, cy + 6, z1 - 3.4], [cx + 11.1, cy + 8.4, z1 - 3.4], [cx + 11.1, cy + 10.8, z1 - 3.4]], P), 0.55, "hi"),
    S(solid({ x: cx + 11, y: cy + 3, w: 0.8, d: 9, r: 0.6 }, z0 + 2, z0 + 6, 2), "lo", { crease: "none" }),
    L(sideLine([[cy + 4.6, z0 + 4], [cy + 10.4, z0 + 4]], cx + 11.9), "lo"),
    // top: carry handle and a sun visor
    S(solid({ x: cx - 7, y: cy - 10, w: 14, d: 4, r: 1.6 }, z1, z1 + 5, 3, 0.4), "mid"),
    S(solid({ x: cx - 12, y: cy + 12, w: 24, d: 12, r: 2 }, z1, z1 + 1.6, 3, 0.3), "mid"),
    // the lens: a collar, the housing, a thread, and the big germanium front
    S(solid({ x: cx - 9, y: cy + 18, w: 18, d: 4, r: 7 }, z0 + 1.6, z1 - 1.6, 6, 0.4), "mid"),
    S(solid({ x: cx - 10, y: cy + 22, w: 20, d: 7, r: 8 }, z0 + 0.6, z1 - 0.6, 6, 0.5), "hi"),
    L(join(Array.from({ length: 5 }, (_, i) => sideLine([[cy + 24.4 + i, z0 + 1.6], [cy + 24.4 + i, z1 - 1.6]], cx + 10))), "lo"),
    ...[9.2, 8, 6.4, 4.6, 2.6].map((r, i) => L(frontRing(cx, lensZ, r, front + 0.1, 30), i === 0 ? "hi" : i === 4 ? "mid" : "lo")),
    L(
      join(
        Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return frontLine([[cx + Math.cos(a) * 2.8, lensZ + Math.sin(a) * 2.8], [cx + Math.cos(a) * 6.2, lensZ + Math.sin(a) * 6.2]], front + 0.1);
        }),
      ),
      "faint",
    ),
    frontDots([[cx - 3, lensZ + 3.4]], front + 0.1),
    // a round connector on the side, where the cable leaves
    L(sideRingAt(cy - 8, z0 + 5, 2.6, cx + 11.1, 18), "mid"),
    L(sideRingAt(cy - 8, z0 + 5, 1.4, cx + 11.1, 14), "lo"),
    D([at([cx + 11.1, cy - 8, z0 + 5])], 0.5, "mid"),
    L(sideRingAt(cy - 8, z0 + 11.4, 1.8, cx + 11.1, 14), "lo"),
  ];
}

const THERMAL_PORT: Point3 = [THERMAL.x + 11.6, THERMAL.y - 8, T_Z + 5];

/* ---------- the boom microphone ---------- */

const MIC = { x: 48, y: -50 };
const MIC_POLE = 80;

function micParts(): Part[] {
  const { x: cx, y: cy } = MIC;
  const boomZ = MIC_POLE;
  const boomEnd = cy + 34;
  return [
    ...tripod(cx, cy, 34, 18),
    S(cyl(cx, cy, 1.4, 38, MIC_POLE - 4, 12), "hi"),
    S(cyl(cx + 2.6, cy, 2.2, 56, 60, 12, 0.2), "mid"),
    S(cyl(cx, cy, 3.4, MIC_POLE - 4, MIC_POLE + 2, 16, 0.4), "mid"),
    L(radialTicks(cx, cy, 3.4, 12, 3, MIC_POLE + 2, [0.5, 1], P).minor, "lo"),
    // the boom arm, with a counterweight behind
    rod([cx, cy, boomZ], [cx, boomEnd, boomZ + 4], 1.2, "mid"),
    rod([cx, cy, boomZ], [cx, cy - 10, boomZ - 1.6], 1.0, "mid"),
    S(cyl(cx, cy - 10, 3.2, boomZ - 4, boomZ + 2, 14, 0.3), "mid"),
    // the shock mount, and the long shotgun microphone in its windshield
    S(solid({ x: cx - 4, y: boomEnd - 2, w: 8, d: 3, r: 3 }, boomZ + 2, boomZ + 11, 4, 0.3), "mid"),
    S(solid({ x: cx - 4, y: boomEnd + 12, w: 8, d: 3, r: 3 }, boomZ + 2, boomZ + 11, 4, 0.3), "mid"),
    S(solid({ x: cx - 2, y: cy + 15, w: 4, d: 30, r: 2 }, boomZ + 4.6, boomZ + 8.6, 4, 0.3), "hi", { chain: 4, kind: "body" }),
    S(solid({ x: cx - 4.8, y: cy + 16, w: 9.6, d: 30, r: 4.8 }, boomZ + 3.4, boomZ + 9.8, 6, 0.5), "mid", { chain: 4, kind: "body" }),
    L(join(Array.from({ length: 9 }, (_, i) => lineOnTop([cx - 4.4, cy + 17 + i * 3.2], [cx + 4.4, cy + 19 + i * 3.2], boomZ + 9.8, P))), "lo"),
    L(frontRing(cx, boomZ + 6.6, 3.4, cy + 46.1, 18), "mid"),
    L(frontRing(cx, boomZ + 6.6, 1.8, cy + 46.1, 14), "lo"),
    // the XLR plug at the back, where the cable starts
    S(solid({ x: cx - 2.4, y: cy + 8, w: 4.8, d: 6, r: 1 }, boomZ + 4.2, boomZ + 9, 3, 0.2), "mid"),
  ];
}

const MIC_PLUG: Point3 = [MIC.x, MIC.y + 11, MIC_POLE + 9];

/* ---------- the ring light ---------- */

const RING = { x: 150, y: -164, hub: 36 };

function ringParts(): Part[] {
  const { x: cx, y: cy } = RING;
  return [
    ...tripod(cx, cy, RING.hub, 24),
    S(cyl(cx, cy, 1.8, RING.hub + 2, 70, 14), "hi"),
    S(cyl(cx, cy, 3, 70, 74, 16, 0.3), "mid"),
    // the control box low on the pole, where the power cable lands
    S(solid({ x: cx + 3, y: cy + 3, w: 8, d: 7, r: 1.4 }, 6, 16, 3, 0.4), "mid"),
    frontDots([[cx + 5, 12.5], [cx + 7, 12.5], [cx + 9, 12.5]], cy + 10.1),
    L(frontRing(cx + 7, 8.4, 1.4, cy + 10.1, 12), "mid"),
    // the yoke and the panel
    S(solid({ x: cx - 27, y: cy - 1, w: 3, d: 7, r: 1 }, 74, 92, 3, 0.3), "mid"),
    S(solid({ x: cx + 24, y: cy - 1, w: 3, d: 7, r: 1 }, 74, 92, 3, 0.3), "mid"),
    S(solid({ x: cx - 27, y: cy - 1, w: 54, d: 3, r: 1 }, 72, 75, 3, 0.2), "mid"),
    S(solid({ x: cx - 23, y: cy, w: 46, d: 5, r: 6 }, 78, 124, 6, 0.8), "hi"),
    L(frontRect(cx - 20, cx + 20, 82, 120, cy + 5.1), "faint"),
    D(pointsAt(Array.from({ length: 6 * 10 }, (_, i) => [cx - 17 + (i % 6) * 6.8, cy + 5.1, 85 + Math.floor(i / 6) * 3.6] as Point3), P), 0.5, "mid"),
    // barn doors on top
    S(solid({ x: cx - 23, y: cy + 4, w: 20, d: 1.2, r: 0.5 }, 124, 130, 2), "mid"),
    S(solid({ x: cx + 3, y: cy + 4, w: 20, d: 1.2, r: 0.5 }, 124, 130, 2), "mid"),
  ];
}

const RING_PORT: Point3 = [RING.x + 7, RING.y + 10.1, 9.4];

/* ---------- cables ---------- */

/** HDMI: from the patch panel straight along the floor to a socket on the screen's foot. */
export const HDMI = wire(null, [
  jackFront(PORT_X[0]),
  [PORT_X[0], PORT_FRONT, 0.7],
  [PORT_X[0], -4, 0.7],
  [27.5, -4, 4],
  [26.1, -4, 6],
], 1.1);

export const MIC_CABLE = wire(4, [
  MIC_PLUG,
  [MIC.x + 3.8, MIC.y + 11, MIC_POLE + 7],
  [MIC.x + 3.8, MIC.y + 11, 0.7],
  [MIC.x + 3.8, -131.5, 0.7],
  [PORT_X[1], -131.5, 0.7],
  [PORT_X[1], PORT_FRONT, 0.7],
  jackFront(PORT_X[1]),
], 1.3);

export const RGB_CABLE = wire(0, [
  RGB_PORT,
  [RGB.x + 22, RGB_PORT[1], RGB_PORT[2] - 3],
  [RGB.x + 22, RGB_PORT[1], 0.7],
  [RGB.x + 22, -124, 0.7],
  [PORT_X[2], -124, 0.7],
  [PORT_X[2], PORT_FRONT, 0.7],
  jackFront(PORT_X[2]),
], 1.3);

export const THERMAL_CABLE = wire(1, [
  THERMAL_PORT,
  [THERMAL.x + 16, THERMAL_PORT[1], THERMAL_PORT[2] - 2],
  [THERMAL.x + 16, THERMAL_PORT[1], 0.7],
  [THERMAL.x + 16, -126.5, 0.7],
  [PORT_X[3], -126.5, 0.7],
  [PORT_X[3], PORT_FRONT, 0.7],
  jackFront(PORT_X[3]),
], 1.3);

export const RING_CABLE = wire(null, [
  RING_PORT,
  [RING_PORT[0] + 6, RING_PORT[1] + 2, 0.7],
  [RING_PORT[0] + 6, -129, 0.7],
  [PORT_X[4], -129, 0.7],
  [PORT_X[4], PORT_FRONT, 0.7],
  jackFront(PORT_X[4]),
], 1.3);

export const CABLES: Wire[] = [HDMI, MIC_CABLE, RGB_CABLE, THERMAL_CABLE, RING_CABLE, ...ECG_LEADS];

/* ---------- devices, back to front ---------- */

const center = (x: number, y: number, z = 0) => depthOf([x, y, z], P);

export const DEVICES: Device[] = [
  { id: "rack", depth: center(RACK.x + RACK.w / 2, RACK.y + RACK.d / 2), parts: [...RACK_PARTS, ...EMG_PARTS] },
  { id: "ring", depth: center(RING.x, RING.y), parts: ringParts() },
  { id: "mic", depth: center(MIC.x, MIC.y), parts: micParts() },
  { id: "thermal", depth: center(THERMAL.x, THERMAL.y), parts: thermalParts() },
  { id: "rgb", depth: center(RGB.x, RGB.y), parts: rgbParts() },
  { id: "screen", depth: center(0, 0), parts: SCREEN_PARTS },
].sort((a, b) => a.depth - b.depth);

/* ---------- where the pointer can pick a channel ---------- */

export const ANCHORS: Array<{ channel: number; at: Flat }> = [
  { channel: 0, at: at([RGB.x, RGB.y + 14, RGB_Z + 10]) },
  { channel: 0, at: at([RGB.x, RGB.y + 40, RGB_Z + 10]) },
  { channel: 1, at: at([THERMAL.x, THERMAL.y + 6, T_Z + 10]) },
  { channel: 1, at: at([THERMAL.x, THERMAL.y + 29, T_Z + 10]) },
  { channel: 2, at: at([48, RACK_FRONT, 69]) },
  { channel: 2, at: at([48, ECG_STUD_Y, RACK_TOP + 4]) },
  { channel: 3, at: at([DOCK.x + 12, DOCK.y + 7, RACK_TOP + 7]) },
  { channel: 3, at: at([BASE_STATION.x + 6, BASE_STATION.y + 7, RACK_TOP + 8]) },
  { channel: 4, at: at([MIC.x, MIC.y + 30, MIC_POLE + 7]) },
];

export const PROGRESS_CELLS = CELL_X.length;
