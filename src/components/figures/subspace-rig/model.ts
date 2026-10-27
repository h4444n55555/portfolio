import type { Point3 } from "../../iso/iso-kit";

/**
 * The model behind the rig: the same projection the paper uses, on a toy
 * slice of a hidden space. Every part, the readout and the aria text read
 * from here.
 *
 * A decoder hidden state h is edited as h' = h − α (h Bᵀ) B, where the rows of
 * B are the top-r right singular vectors of Δ = [h_hall − h_empty]. Here the
 * space is drawn in three dimensions with the three singular vectors as rails;
 * rank r keeps the first r of them, and α slides every bead along each kept
 * rail toward the plane it removes. The rest of the state — the ~1,000
 * dimensions that cannot be drawn — is scatter, a fixed offset per bead.
 *
 * The beads are illustrative geometry, not real activations.
 */

export const TAU = 16; // where the gate sits along the first rail: the no-speech threshold
export const RANK_MAX = 3;
export const N_HALL = 13;
export const N_EMPTY = 13;

const RADIANS = Math.PI / 180;
const YAW = 30 * RADIANS;
const TILT = 20 * RADIANS;

/** The three singular vectors, as world directions. Orthonormal. */
export const B1: Point3 = [Math.cos(YAW) * Math.cos(TILT), Math.sin(YAW) * Math.cos(TILT), Math.sin(TILT)];
export const B2: Point3 = [-Math.sin(YAW), Math.cos(YAW), 0];
export const B3: Point3 = [-Math.sin(TILT) * Math.cos(YAW), -Math.sin(TILT) * Math.sin(YAW), Math.cos(TILT)];
export const BASIS: Point3[] = [B1, B2, B3];

export const CENTER: Point3 = [0, -16, 52];

export const at = (u: [number, number, number], scatter: Point3 = [0, 0, 0]): Point3 => [
  CENTER[0] + u[0] * B1[0] + u[1] * B2[0] + u[2] * B3[0] + scatter[0],
  CENTER[1] + u[0] * B1[1] + u[1] * B2[1] + u[2] * B3[1] + scatter[1],
  CENTER[2] + u[0] * B1[2] + u[1] * B2[2] + u[2] * B3[2] + scatter[2],
];

export interface Bead {
  hall: boolean;
  /** Coordinates along the three rails before any projection. */
  u: [number, number, number];
  /** The rest of the hidden state, a fixed scatter in world units. */
  scatter: Point3;
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const BEADS: Bead[] = (() => {
  const random = mulberry(9);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const beads: Bead[] = [];
  const seats: Point3[] = [];
  const far = (p: Point3) => seats.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) > 11);

  const make = (hall: boolean) => {
    for (let tries = 0; tries < 400; tries++) {
      // Hallucinating states sit far out along the first rail; correctly empty ones sit near the origin.
      const u1 = hall ? clamp(35 + 9 * gauss(), 21, 56) : clamp(-1 + 8 * gauss(), -24, 10);
      const side = (n: number) => (random() < 0.5 ? -1 : 1) * (9 + Math.abs(n) * 12);
      const u2 = clamp(side(random()), -30, 30);
      const u3 = clamp(side(random()), -28, 28);
      const scatter: Point3 = [(random() - 0.5) * 22, (random() - 0.5) * 22, (random() - 0.5) * 18];
      const p = at([u1, u2, u3], scatter);
      if (p[2] < 14 || !far(p)) continue;
      seats.push(p);
      beads.push({ hall, u: [u1, u2, u3], scatter });
      return;
    }
  };
  for (let i = 0; i < N_HALL; i++) make(true);
  for (let i = 0; i < N_EMPTY; i++) make(false);
  return beads;
})();

export interface Setting {
  /** Projection strength, 0 to 1. */
  alpha: number;
  /** Eased 0..1 flags: how far each rail is switched in. Rail 1 is always in. */
  keep: [number, number, number];
}

/** One bead's coordinates after the projection, along each rail. */
export function project(bead: Bead, { alpha, keep }: Setting): [number, number, number] {
  return [bead.u[0] * (1 - alpha * keep[0]), bead.u[1] * (1 - alpha * keep[1]), bead.u[2] * (1 - alpha * keep[2])];
}

/** Whether the gate lets this bead through as text: its coordinate on the first rail is past the threshold. */
export const emits = (u1: number) => u1 >= TAU;

export const keepFor = (rank: number): [number, number, number] => [1, rank >= 2 ? 1 : 0, rank >= 3 ? 1 : 0];

export function count(setting: Setting) {
  let text = 0;
  let hall = 0;
  for (const bead of BEADS) {
    if (!bead.hall) continue;
    hall++;
    if (emits(project(bead, setting)[0])) text++;
  }
  return { text, hall };
}

export const alphaText = (alpha: number) => alpha.toFixed(2);

export function readout(rank: number, alpha: number, text: number, hall: number) {
  return `r ${rank} · α ${alphaText(alpha)} · ${text}/${hall} emit`;
}

export function aria(rank: number, alpha: number, text: number, hall: number) {
  return `Projection strength ${alphaText(alpha)}, rank ${rank}: ${text} of ${hall} hallucinating states still pass the gate as text`;
}
