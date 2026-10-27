"use client";

import * as React from "react";
import "../../iso/iso.css";
import {
  circleRing,
  cylinder,
  depthOf,
  insetPlan,
  knurl,
  lineOnTop,
  onTop,
  pathOf,
  planOutline,
  pointsAt,
  radialTicks,
  ring,
  slabOf,
  topTicks,
  translateAlong,
  type Flat,
  type Plan,
  type Plane,
  type Point3,
} from "../../iso/iso-kit";
import { Dots, IsoFigure, Line, Plate, Solid } from "../../iso/react/draw";
import { follow, useInView, useLoop, useReadout } from "../../iso/react/live";
import {
  BEADS,
  RANK_MAX,
  TAU,
  aria as ariaText,
  at as along,
  count,
  emits,
  keepFor,
  project,
  readout as readoutText,
  type Setting,
} from "./model";
import {
  BASE,
  BASE_H,
  BUTTONS,
  BUTTON_H,
  BUTTON_PRESS,
  CARRIAGE_Z,
  FOOT_H,
  GAUGE,
  GAUGE_CELLS,
  HEIGHT,
  HOOP,
  LABEL,
  P,
  PLAT,
  RAIL,
  SLIDER,
  SLIDER_X0,
  SLIDER_X1,
  SLIDER_Y,
  WIDTH,
  pt,
  railPoint,
} from "./view";

const solid = (plan: Plan, z: number, h: number, steps = 6, bevel = 0) => slabOf(plan, z, h, P, steps, bevel);
const cyl = (cx: number, cy: number, r: number, z: number, h: number, steps = 28, bevel = 0) => cylinder(cx, cy, r, z, h, P, steps, bevel);
const join = (paths: string[]) => paths.join("");
const fine = (v: number) => Math.round(v * 100) / 100;

/* ---------- static geometry, computed once ---------- */

const FEET: Plane[] = [
  [BASE.x + 20, BASE.y + 18],
  [BASE.x + BASE.w - 20, BASE.y + 18],
  [BASE.x + 20, BASE.y + BASE.d - 18],
  [BASE.x + BASE.w - 20, BASE.y + BASE.d - 18],
];
const SCREWS: Plane[] = [
  [BASE.x + 8, BASE.y + 8],
  [BASE.x + BASE.w - 8, BASE.y + 8],
  [BASE.x + 8, BASE.y + BASE.d - 8],
  [BASE.x + BASE.w - 8, BASE.y + BASE.d - 8],
];

const BASE_ART = {
  halo: solid(BASE, -BASE_H - FOOT_H, BASE_H).fill,
  feet: FEET.map(([x, y]) => [cyl(x, y, 7, -BASE_H - FOOT_H, 1.6, 20), cyl(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, 20)]),
  slab: solid(BASE, -BASE_H, BASE_H, 8, 1.6),
  groove: planOutline(insetPlan(BASE, 4.5), 0, P),
  screws: pointsAt(SCREWS.map(([x, y]) => [x, y, 0] as Point3), P),
  screwRings: join(SCREWS.map(([x, y]) => ring(x, y, 2.2, 0, P, 16))),
  plate: solid(LABEL, 0, 0.8, 4),
  plateLine: planOutline(insetPlan(LABEL, 1.6), 0.8, P),
  plateScrews: pointsAt([[LABEL.x + 3.4, LABEL.y + LABEL.d / 2, 0.8], [LABEL.x + LABEL.w - 3.4, LABEL.y + LABEL.d / 2, 0.8]], P),
  plateRule: join([0, 1, 2].map((row) => onTop([[LABEL.x + 8, LABEL.y + 3.6 + row * 2.6], [LABEL.x + (row === 1 ? 26 : 36), LABEL.y + 3.6 + row * 2.6]], 0.8, P))),
};

const FOOT3 = railPoint(2, RAIL.r3[0]);
const PLATTER_ART = {
  disc: cyl(PLAT.x, PLAT.y, PLAT.r, 0, PLAT.h, 72, 0.8),
  rim: onTop(circleRing(PLAT.x, PLAT.y, PLAT.r - 4.2, 72), PLAT.h, P, true),
  polar: join([26, 52].map((r) => onTop(circleRing(PLAT.x, PLAT.y, r, 48), PLAT.h, P, true))),
  spokes: join([0, 1, 2, 3, 4, 5].map((k) => {
    const a = (k / 6) * Math.PI;
    return lineOnTop([PLAT.x + Math.cos(a) * 52, PLAT.y + Math.sin(a) * 52], [PLAT.x - Math.cos(a) * 52, PLAT.y - Math.sin(a) * 52], PLAT.h, P);
  })),
  ticks: radialTicks(PLAT.x, PLAT.y, PLAT.r - 4.2, 72, 6, PLAT.h, [1.6, 3], P),
  flange: cyl(FOOT3[0], FOOT3[1], 6.4, PLAT.h, 1.8, 24, 0.3),
  flangeRing: ring(FOOT3[0], FOOT3[1], 4.2, PLAT.h + 1.8, P, 20),
  flangeScrews: pointsAt([0, 1, 2, 3].map((k) => [FOOT3[0] + Math.cos(k * 1.5708 + 0.8) * 5.2, FOOT3[1] + Math.sin(k * 1.5708 + 0.8) * 5.2, PLAT.h + 1.8] as Point3), P),
};

const GAUGE_ART = (() => {
  const pitch = (GAUGE.d - 6) / GAUGE_CELLS;
  const cells = Array.from({ length: GAUGE_CELLS }, (_, i) => {
    const plan: Plan = { x: GAUGE.x + 4, y: GAUGE.y + GAUGE.d - 3 - (i + 1) * pitch + 1, w: GAUGE.w - 8, d: pitch - 2, r: 1.6 };
    return solid(plan, 1.8, 1.6, 3, 0.3);
  });
  return {
    slab: solid(GAUGE, 0, 1.8, 5, 0.4),
    inner: planOutline(insetPlan(GAUGE, 2.2), 1.8, P),
    cells,
    ticks: topTicks(GAUGE.y + 3, GAUGE.y + GAUGE.d - 3, pitch, 5, GAUGE.x - 4.4, 0, [2, 3.6], P, "y"),
  };
})();

const SLIDER_ART = {
  track: solid(SLIDER, 0, 2.5, 4, 0.5),
  slot: planOutline(insetPlan(SLIDER, 4.6), 2.5, P),
  ticks: topTicks(SLIDER_X0, SLIDER_X1, 22, 5, SLIDER.y + SLIDER.d + 3.4, 0, [2, 3.6], P),
};
const CARRIAGE_ART = {
  body: solid({ x: SLIDER_X0 - 9, y: SLIDER.y + 1.5, w: 18, d: SLIDER.d - 3, r: 3 }, CARRIAGE_Z - 0.5, 3.5, 4, 0.5),
  knob: cyl(SLIDER_X0, SLIDER_Y, 5.4, CARRIAGE_Z + 3, 6.2, 20, 0.5),
  knurl: knurl(SLIDER_X0, SLIDER_Y, 5.4, CARRIAGE_Z + 3, CARRIAGE_Z + 9.2, 18, P),
  pointer: solid({ x: SLIDER_X0 - 1.1, y: SLIDER.y + SLIDER.d - 0.5, w: 2.2, d: 6.5, r: 0.7 }, CARRIAGE_Z - 0.5, 1.2, 2),
  index: lineOnTop([SLIDER_X0, SLIDER_Y - 3.4], [SLIDER_X0, SLIDER_Y + 1], CARRIAGE_Z + 9.2, P),
};
const SLIDER_STEP = SLIDER_X1 - SLIDER_X0;

const BUTTON_ART = BUTTONS.map((plan, index) => {
  const n = index + 1;
  const cx = plan.x + plan.w / 2;
  const cy = plan.y + plan.d / 2;
  return {
    well: planOutline(insetPlan(plan, -2), 0, P, 6),
    cap: solid(plan, 0, BUTTON_H, 4, 0.6),
    dots: pointsAt(Array.from({ length: n }, (_, k) => [cx + (k - (n - 1) / 2) * 6, cy, BUTTON_H] as Point3), P),
  };
});

/* ---------- the parts that move ---------- */

const rod = (a: Point3, b: Point3, width: number) => {
  const A = pt(a);
  const B = pt(b);
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

interface Item {
  id: string;
  key: number;
  node: React.ReactNode;
}

const SEGMENT = 7;
const RAIL_RANGE: Array<[number, number]> = [RAIL.r1, RAIL.r2, RAIL.r3];
const railTone = (axis: number, keep: number) => (axis === 0 || keep > 0.5 ? "hi" : "faint");

const RAIL_ITEMS: Item[] = RAIL_RANGE.flatMap(([from, to], axis) => {
  const items: Item[] = [];
  const count = Math.ceil((to - from) / SEGMENT);
  for (let s = 0; s < count; s++) {
    const t0 = from + s * SEGMENT;
    const t1 = Math.min(to, t0 + SEGMENT);
    const a = railPoint(axis as 0 | 1 | 2, t0);
    const b = railPoint(axis as 0 | 1 | 2, t1);
    const piece = rod(a, b, 1.15);
    const tick = Math.abs(t0 / (SEGMENT * 2) - Math.round(t0 / (SEGMENT * 2))) < 0.01;
    items.push({
      id: `rail-${axis}-${s}`,
      key: depthOf([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], P),
      node: (
        <g key={`rail-${axis}-${s}`} data-rail={axis}>
          <path className="iso-fill" d={piece.fill} />
          <path className="iso-line" data-tone={railTone(axis, axis === 0 ? 1 : 0)} d={piece.sides} />
          {tick && s > 0 ? <circle className="iso-wire-end" cx={fine(pt(a)[0])} cy={fine(pt(a)[1])} r={0.9} /> : null}
        </g>
      ),
    });
  }
  return items;
});

const END_ITEMS: Item[] = RAIL_RANGE.flatMap(([from, to], axis) =>
  [from, to].map((t, end) => {
    if (axis === 2 && end === 0) return null;
    const p = railPoint(axis as 0 | 1 | 2, t);
    const q = pt(p);
    return {
      id: `end-${axis}-${end}`,
      key: depthOf(p, P),
      node: <circle key={`end-${axis}-${end}`} className="iso-wire-end" data-rail={axis} cx={fine(q[0])} cy={fine(q[1])} r={2.1} />,
    } as Item;
  }),
).filter((item): item is Item => item !== null);

/* The gate hoop: a rounded square in the plane the first rail's coordinate TAU, with four spokes to a hub on the rail. */
const HOOP_POINTS: Point3[] = (() => {
  const out: Point3[] = [];
  const h = HOOP.half;
  const r = HOOP.round;
  const corners: Array<[number, number, number]> = [
    [h - r, h - r, 0],
    [-(h - r), h - r, 90],
    [-(h - r), -(h - r), 180],
    [h - r, -(h - r), 270],
  ];
  for (const [cx, cy, start] of corners) {
    for (let k = 0; k <= 6; k++) {
      const a = ((start + (k / 6) * 90) * Math.PI) / 180;
      out.push(along([TAU, cx + Math.cos(a) * r, cy + Math.sin(a) * r]));
    }
  }
  return out;
})();

const HUB = along([TAU, 0, 0]);
const HOOP_ITEMS: Item[] = [
  ...HOOP_POINTS.map((a, i) => {
    const b = HOOP_POINTS[(i + 1) % HOOP_POINTS.length];
    const piece = rod(a, b, 0.9);
    return {
      id: `hoop-${i}`,
      key: depthOf([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], P),
      node: (
        <g key={`hoop-${i}`}>
          <path className="iso-fill" d={piece.fill} />
          <path className="iso-line" data-tone="mid" d={piece.sides} />
        </g>
      ),
    } as Item;
  }),
  ...[
    [HOOP.half, 0],
    [0, HOOP.half],
    [-HOOP.half, 0],
    [0, -HOOP.half],
  ].map(([a, b], i) => {
    const end = along([TAU, a, b]);
    const piece = rod(HUB, end, 0.6);
    return {
      id: `spoke-${i}`,
      key: depthOf([(HUB[0] + end[0]) / 2, (HUB[1] + end[1]) / 2, (HUB[2] + end[2]) / 2], P),
      node: (
        <g key={`spoke-${i}`}>
          <path className="iso-fill" d={piece.fill} />
          <path className="iso-line" data-tone="lo" d={piece.sides} />
        </g>
      ),
    } as Item;
  }),
  {
    id: "hub",
    key: depthOf(HUB, P),
    node: <circle key="hub" className="iso-wire-end" cx={fine(pt(HUB)[0])} cy={fine(pt(HUB)[1])} r={2.6} />,
  } as Item,
];

const PUCK_R = 3.6;
const PUCK = cylinder(0, 0, PUCK_R, -1.5, 3, P, 18, 0.5);
const FLOOR = PLAT.h;

interface Place {
  point: Point3;
  text: boolean;
}

function place(index: number, setting: Setting): Place {
  const bead = BEADS[index];
  const u = project(bead, setting);
  return { point: along(u, bead.scatter), text: emits(u[0]) };
}

const stemOf = (p: Point3) => pathOf([pt([p[0], p[1], FLOOR]), pt([p[0], p[1], p[2] - 1.5])]);

const REST: Setting = { alpha: 0, keep: keepFor(1) };

/* ---------- the live figure ---------- */

const ALPHA_STEP = 0.05;
const TOUR_PHASE = 9;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);
const smooth = (x: number) => x * x * (3 - 2 * x);

/** The idle tour: each rank in turn, α from nothing to full and back. */
function tourAt(seconds: number): { alpha: number; rank: number } {
  const phase = Math.floor(seconds / TOUR_PHASE) % RANK_MAX;
  const t = seconds % TOUR_PHASE;
  const alpha = smooth(ramp(t, 1, 3.6)) * (1 - smooth(ramp(t, 5.2, 7.4)));
  return { alpha, rank: phase + 1 };
}

const SLIDER_A = pt([SLIDER_X0, SLIDER_Y, 0]);
const SLIDER_B = pt([SLIDER_X1, SLIDER_Y, 0]);
const BUTTON_AT = BUTTONS.map((plan) => pt([plan.x + plan.w / 2, plan.y + plan.d / 2, BUTTON_H]));

export function SubspaceRig() {
  const wrap = React.useRef<HTMLDivElement>(null);
  const layer = React.useRef<SVGGElement>(null);
  const carriage = React.useRef<SVGGElement>(null);
  const beadEls = React.useRef<Array<{ stem: SVGPathElement; foot: SVGCircleElement; puck: SVGGElement } | null>>([]);
  const buttonEls = React.useRef<Array<SVGGElement | null>>([]);
  const cellEls = React.useRef<Array<SVGGElement | null>>([]);
  const { anchor, say } = useReadout<HTMLDivElement>();
  const inView = useInView(wrap);

  const want = React.useRef({ alpha: 0, rank: 1 });
  const shown = React.useRef({ alpha: 0, keep: [1, 0, 0] as [number, number, number] });
  const last = React.useRef({ order: "", cells: -1, text: "" });
  const hand = React.useRef({ over: false, drag: false, focus: false, quiet: 0, clock: 0, wasIdle: false });
  // id -> depth key and the item's wrapper, for the paint order
  const parts = React.useRef<Map<string, { key: number; el: Element }>>(new Map());

  const items = React.useMemo(() => {
    const beads: Item[] = BEADS.map((bead, i) => {
      const { point, text } = place(i, REST);
      const floor = pt([point[0], point[1], FLOOR]);
      return {
        id: `bead-${i}`,
        key: depthOf(point, P),
        node: (
          <g
            key={`bead-${i}`}
            ref={(el) => {
              if (el) beadEls.current[i] = { stem: el.querySelector(".stem") as SVGPathElement, foot: el.querySelector(".foot") as SVGCircleElement, puck: el.querySelector(".puck") as SVGGElement };
            }}
          >
            <path className="iso-line stem" data-tone="lo" d={stemOf(point)} />
            <circle className="iso-wire-end foot" cx={fine(floor[0])} cy={fine(floor[1])} r={0.9} />
            <g className="puck" transform={translateAlong(P, point)}>
              <Solid paths={PUCK} tone={bead.hall ? "hi" : "mid"} crease="faint" lit={text} />
            </g>
          </g>
        ),
      };
    });
    return [...RAIL_ITEMS, ...END_ITEMS, ...HOOP_ITEMS, ...beads].sort((a, b) => a.key - b.key);
  }, []);

  const layout = React.useCallback(() => {
    const holder = layer.current;
    if (!holder) return;
    const setting: Setting = { alpha: shown.current.alpha, keep: shown.current.keep };
    const rank = want.current.rank;

    BEADS.forEach((_, i) => {
      const els = beadEls.current[i];
      if (!els) return;
      const { point, text } = place(i, setting);
      const floor = pt([point[0], point[1], FLOOR]);
      els.stem.setAttribute("d", stemOf(point));
      els.foot.setAttribute("cx", String(fine(floor[0])));
      els.foot.setAttribute("cy", String(fine(floor[1])));
      els.puck.setAttribute("transform", translateAlong(P, point));
      const solid = els.puck.firstElementChild;
      if (solid) {
        if (text) solid.setAttribute("data-lit", "");
        else solid.removeAttribute("data-lit");
      }
      const part = parts.current.get(`bead-${i}`);
      if (part) part.key = depthOf(point, P);
    });

    // Paint order, back to front: only rewritten when it actually changes.
    const order = Array.from(parts.current.entries()).sort((a, b) => a[1].key - b[1].key);
    const signature = order.map(([id]) => id).join("|");
    if (signature !== last.current.order) {
      last.current.order = signature;
      holder.append(...order.map(([, v]) => v.el));
    }

    // A rail takes the strong tone once its switch is more than half in.
    holder.querySelectorAll("g[data-rail]").forEach((group) => {
      const axis = Number(group.getAttribute("data-rail"));
      group.querySelector(".iso-line")?.setAttribute("data-tone", railTone(axis, setting.keep[axis]));
    });

    carriage.current?.setAttribute("transform", translateAlong(P, [setting.alpha * SLIDER_STEP, 0, 0]));
    buttonEls.current.forEach((g, i) => {
      if (!g) return;
      const on = i + 1 === rank;
      g.setAttribute("transform", on ? translateAlong(P, [0, 0, -BUTTON_PRESS]) : "");
      const cap = g.querySelector(".iso-solid");
      if (cap) {
        if (on) cap.setAttribute("data-lit", "");
        else cap.removeAttribute("data-lit");
      }
    });

    const { text, hall } = count(setting);
    const lit = Math.round((text / hall) * GAUGE_CELLS);
    if (lit !== last.current.cells) {
      last.current.cells = lit;
      cellEls.current.forEach((g, i) => {
        const cap = g?.querySelector(".iso-solid");
        if (!cap) return;
        if (i < lit) cap.setAttribute("data-lit", "");
        else cap.removeAttribute("data-lit");
      });
    }
    const label = readoutText(rank, setting.alpha, text, hall);
    if (label !== last.current.text) {
      last.current.text = label;
      say(label);
      wrap.current?.setAttribute("aria-valuenow", setting.alpha.toFixed(2));
      wrap.current?.setAttribute("aria-valuetext", ariaText(rank, setting.alpha, text, hall));
    }
  }, [say]);

  React.useEffect(() => {
    parts.current.clear();
    layer.current?.querySelectorAll(":scope > [data-id]").forEach((wrapper) => {
      const id = wrapper.getAttribute("data-id") as string;
      const item = items.find((entry) => entry.id === id);
      parts.current.set(id, { key: item ? item.key : 0, el: wrapper });
    });
    last.current.order = items.map((item) => item.id).join("|");
    layout();
  }, [items, layout]);

  const tick = React.useCallback(
    (dt: number, calm: boolean) => {
      const h = hand.current;
      h.quiet += dt;
      const free = !h.over && !h.drag && !h.focus && !calm;
      const idle = free && h.quiet > 3;
      if (idle) {
        if (!h.wasIdle) h.clock = 0;
        h.clock += dt;
        const t = tourAt(h.clock);
        want.current.alpha = t.alpha;
        want.current.rank = t.rank;
      }
      h.wasIdle = idle;
      const goal = keepFor(want.current.rank);
      const s = shown.current;
      s.alpha = follow(s.alpha, want.current.alpha, dt, idle ? 0.25 : 0.1, calm);
      for (let i = 0; i < 3; i++) s.keep[i] = follow(s.keep[i], goal[i], dt, 0.16, calm);
      layout();
      // While nobody is touching it the loop keeps running, so the tour can begin once the quiet has passed.
      return free || s.alpha !== want.current.alpha || s.keep.some((k, i) => k !== goal[i]);
    },
    [layout],
  );

  const kick = useLoop(tick, inView);

  const woken = () => {
    hand.current.quiet = 0;
    kick();
  };

  const toBox = (event: React.PointerEvent): Flat | null => {
    const svg = wrap.current?.querySelector(".iso-svg");
    if (!svg) return null;
    const box = svg.getBoundingClientRect();
    return [((event.clientX - box.left) / box.width) * WIDTH, ((event.clientY - box.top) / box.height) * HEIGHT];
  };

  const alphaAt = ([x, y]: Flat): number | null => {
    const dx = SLIDER_B[0] - SLIDER_A[0];
    const dy = SLIDER_B[1] - SLIDER_A[1];
    const t = clamp(((x - SLIDER_A[0]) * dx + (y - SLIDER_A[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(x - (SLIDER_A[0] + dx * t), y - (SLIDER_A[1] + dy * t)) < 17 ? t : null;
  };

  const buttonAt = ([x, y]: Flat): number => {
    let best = -1;
    let near = 21;
    BUTTON_AT.forEach(([bx, by], i) => {
      const d = Math.hypot(x - bx, y - by);
      if (d < near) {
        near = d;
        best = i;
      }
    });
    return best;
  };

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const p = toBox(event);
    if (!p) return;
    const a = alphaAt(p);
    hand.current.over = true;
    if ((hand.current.drag || event.pointerType === "mouse") && a !== null) want.current.alpha = Math.round(a * 100) / 100;
    woken();
  };

  const onDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const p = toBox(event);
    if (!p) return;
    const b = buttonAt(p);
    if (b >= 0) want.current.rank = b + 1;
    const a = alphaAt(p);
    if (a !== null) {
      hand.current.drag = true;
      want.current.alpha = Math.round(a * 100) / 100;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* capture is a nicety */
      }
    }
    hand.current.over = true;
    woken();
  };

  const onKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const w = want.current;
    const big = event.shiftKey ? 4 : 1;
    let handled = true;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") w.alpha = clamp(w.alpha + ALPHA_STEP * big, 0, 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") w.alpha = clamp(w.alpha - ALPHA_STEP * big, 0, 1);
    else if (event.key === "Home" || event.key === "Escape") w.alpha = 0;
    else if (event.key === "End") w.alpha = 1;
    else if (event.key >= "1" && event.key <= String(RANK_MAX)) w.rank = Number(event.key);
    else handled = false;
    if (handled) {
      event.preventDefault();
      w.alpha = Math.round(w.alpha * 100) / 100;
      woken();
    }
  };

  const hall = BEADS.filter((b) => b.hall).length;

  return (
    <div
      ref={wrap}
      tabIndex={0}
      role="slider"
      aria-label="Projection strength"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={0}
      aria-valuetext={ariaText(1, 0, hall, hall)}
      onPointerMove={onMove}
      onPointerDown={onDown}
      onPointerUp={() => (hand.current.drag = false)}
      onPointerCancel={() => (hand.current.drag = false)}
      onPointerLeave={() => {
        if (!hand.current.drag) hand.current.over = false;
        woken();
      }}
      onFocus={() => {
        hand.current.focus = true;
        woken();
      }}
      onBlur={() => {
        hand.current.focus = false;
        woken();
      }}
      onKeyDown={onKey}
      style={{ outline: "none", touchAction: "pan-y" }}
    >
      <div className="iso" data-theme="light">
        <Plate
          fig="Fig 1"
          title="Subspace projection"
          hint="Slide α · press a rank"
          readout={readoutText(1, 0, hall, hall)}
          keys={[
            { mark: "lit", label: "state that still emits text" },
            { mark: "raised", label: "state that was hallucinating" },
            { mark: "edge", label: "the singular vectors and the gate" },
          ]}
          caption={
            <>
              Each bead is one decoder hidden state, drawn in three of its dimensions. The three rails are the top singular
              vectors of the hallucinating-minus-empty differences. The slider is the strength α and the buttons are the
              rank r: h′ = h − α(hBᵀ)B slides every bead along the kept rails, and a bead that falls back behind the hoop
              no longer clears the no-speech threshold. Positions are illustrative, not real activations.
            </>
          }
        >
          <div ref={anchor}>
          <IsoFigure
            width={WIDTH}
            height={HEIGHT}
            label="A bench rig: beads standing on a platter between three crossed rails and a gate hoop. Sliding the strength carriage pulls hallucinating beads along the first rail back through the hoop, and the rank buttons add rails."
          >
            <g key="base">
              <path className="iso-halo" d={BASE_ART.halo} />
              {BASE_ART.feet.map((feet, index) => (
                <g key={index}>
                  {feet.map((paths, part) => (
                    <Solid key={part} paths={paths} tone={part ? "mid" : "lo"} crease="faint" />
                  ))}
                </g>
              ))}
              <Solid paths={BASE_ART.slab} tone="mid" crease="faint" />
              <Line d={BASE_ART.groove} tone="lo" />
              <Line d={BASE_ART.screwRings} tone="lo" />
              <Dots points={BASE_ART.screws} size={0.5} tone="mid" />
              <Solid paths={BASE_ART.plate} tone="lo" crease="none" />
              <Line d={BASE_ART.plateLine} tone="faint" />
              <Line d={BASE_ART.plateRule} tone="lo" />
              <Dots points={BASE_ART.plateScrews} size={0.45} tone="mid" />
            </g>

            <g key="gauge">
              <Solid paths={GAUGE_ART.slab} tone="lo" crease="faint" />
              <Line d={GAUGE_ART.inner} tone="faint" />
              <Line d={GAUGE_ART.ticks.minor} tone="lo" />
              <Line d={GAUGE_ART.ticks.major} tone="mid" />
              {GAUGE_ART.cells.map((paths, i) => (
                <g
                  key={i}
                  ref={(el) => {
                    cellEls.current[i] = el;
                  }}
                >
                  <Solid paths={paths} tone="mid" crease="faint" lit />
                </g>
              ))}
            </g>

            <g key="slider">
              <Solid paths={SLIDER_ART.track} tone="mid" crease="faint" />
              <Line d={SLIDER_ART.slot} tone="faint" />
              <Line d={SLIDER_ART.ticks.minor} tone="lo" />
              <Line d={SLIDER_ART.ticks.major} tone="mid" />
            </g>

            <g key="buttons">
              {BUTTON_ART.map((art, i) => (
                <g key={i}>
                  <Line d={art.well} tone="lo" />
                  <g
                    ref={(el) => {
                      buttonEls.current[i] = el;
                    }}
                  >
                    <Solid paths={art.cap} tone="mid" crease="faint" lit={i === 0} />
                    <Dots points={art.dots} size={0.7} tone="hi" />
                  </g>
                </g>
              ))}
            </g>

            <g key="platter">
              <Solid paths={PLATTER_ART.disc} tone="mid" crease="faint" />
              <Line d={PLATTER_ART.rim} tone="lo" />
              <Line d={PLATTER_ART.polar} tone="faint" />
              <Line d={PLATTER_ART.spokes} tone="faint" />
              <Line d={PLATTER_ART.ticks.minor} tone="lo" />
              <Line d={PLATTER_ART.ticks.major} tone="mid" />
              <Solid paths={PLATTER_ART.flange} tone="mid" crease="faint" />
              <Line d={PLATTER_ART.flangeRing} tone="lo" />
              <Dots points={PLATTER_ART.flangeScrews} size={0.45} tone="mid" />
            </g>

            <g key="items" ref={layer}>
              {items.map((item) => (
                <g key={item.id} data-id={item.id}>
                  {item.node}
                </g>
              ))}
            </g>

            <g key="carriage" ref={carriage}>
              <Solid paths={CARRIAGE_ART.body} tone="mid" crease="faint" />
              <Solid paths={CARRIAGE_ART.pointer} tone="hi" crease="none" lit />
              <Solid paths={CARRIAGE_ART.knob} tone="hi" crease="faint" />
              <Line d={CARRIAGE_ART.knurl} tone="lo" />
              <Line d={CARRIAGE_ART.index} tone="lit" />
            </g>
          </IsoFigure>
          </div>
        </Plate>
      </div>
    </div>
  );
}
