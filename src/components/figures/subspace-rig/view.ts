import { boxCorners, fitProjection, iso, type Flat, type Plan, type Point3 } from "../../iso/iso-kit";
import { B1, B2, B3, CENTER, TAU, at as along } from "./model";

export const WIDTH = 640;
export const HEIGHT = 400;
export const AZIMUTH = 40;

export const BASE: Plan = { x: -150, y: -100, w: 300, d: 196, r: 10 };
export const BASE_H = 8;
export const FOOT_H = 4;

/** The platter the beads stand on. */
export const PLAT = { x: 0, y: -16, r: 78, h: 5 };

/** Rail extents along each singular vector, from the crossing. The third stands on the platter. */
const BOTTOM = PLAT.h + 1.8;
export const RAIL = {
  r1: [-34, 68] as [number, number],
  r2: [-50, 50] as [number, number],
  r3: [-(CENTER[2] - BOTTOM) / B3[2], 44] as [number, number],
};

/** The gate hoop, which slides on the first rail. */
export const HOOP = { half: 40, round: 11 };

/** The slider that sets α, along the front of the base. */
export const SLIDER: Plan = { x: -122, y: 64, w: 244, d: 16, r: 5 };
export const SLIDER_X0 = -110;
export const SLIDER_X1 = 110;
export const SLIDER_Y = SLIDER.y + SLIDER.d / 2;
export const CARRIAGE_Z = 3;

/** Three rank buttons down the right-hand side. */
export const BUTTONS: Plan[] = [-52, -24, 4].map((y) => ({ x: 104, y, w: 28, d: 22, r: 4 }));
export const BUTTON_H = 5;
export const BUTTON_PRESS = 2.2;

/** The emit gauge: ten cells down the left-hand side. */
export const GAUGE: Plan = { x: -134, y: -66, w: 22, d: 104, r: 5 };
export const GAUGE_CELLS = 10;

export const LABEL: Plan = { x: 92, y: -92, w: 46, d: 13, r: 2 };

const extremes: Point3[] = [
  ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
  along([RAIL.r1[1], 0, 0]),
  along([RAIL.r1[0], 0, 0]),
  along([0, RAIL.r2[1], 0]),
  along([0, RAIL.r2[0], 0]),
  along([0, 0, RAIL.r3[1]]),
  along([0, 0, RAIL.r3[0]]),
  along([TAU, HOOP.half, HOOP.half]),
  along([TAU, -HOOP.half, HOOP.half]),
];

export const P = fitProjection(extremes, WIDTH, HEIGHT, { pad: 22, azimuth: AZIMUTH });

export const pt = (point: Point3): Flat => iso(point, P);
export const railPoint = (axis: 0 | 1 | 2, t: number): Point3 => {
  const u: [number, number, number] = [0, 0, 0];
  u[axis] = t;
  return along(u);
};
export const BASES = [B1, B2, B3];
