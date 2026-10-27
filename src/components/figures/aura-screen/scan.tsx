"use client";

import * as React from "react";
import "../../iso/iso.css";
import { Dots, IsoFigure, Line, Plate, Solid } from "../../iso/react/draw";
import { useInView, useLoop, useReadout } from "../../iso/react/live";
import {
  ANCHORS,
  CABLES,
  CHANNELS,
  DEVICES,
  EMG_LINK,
  FLOOR_PARTS,
  GLOW,
  HEIGHT,
  WIDTH,
  type Part,
  type Wire,
} from "./scene";

const fine = (v: number) => Math.round(v * 10) / 10;
const TOUR_STEP = 2.8;
const QUIET = 3;
const SPEED = 90; // screen units per second along a cable
const PICK = 34;

/* ---------- parts ---------- */

function PartView({ part }: { part: Part }) {
  switch (part.t) {
    case "solid": {
      const solid = <Solid paths={part.paths} tone={part.tone} crease={part.crease ?? "faint"} />;
      return part.chain === undefined ? solid : (
        <g data-chain={part.chain} data-kind={part.kind ?? "body"}>
          {solid}
        </g>
      );
    }
    case "line": {
      const line = <Line d={part.d} tone={part.tone} />;
      return part.chain === undefined ? line : (
        <g data-chain={part.chain} data-kind="wire" data-base={part.tone}>
          {line}
        </g>
      );
    }
    case "dots":
      return <Dots points={part.points} size={part.size} tone={part.tone} />;
    case "rod":
      return (
        <>
          <path className="iso-fill" d={part.fill} />
          <path className="iso-line" data-tone={part.tone} d={part.sides} />
        </>
      );
    case "halo":
      return <path className="iso-halo" d={part.d} style={{ opacity: part.opacity, filter: `blur(${part.blur}px)`, transform: "none" }} />;
  }
}

const Parts = ({ parts }: { parts: Part[] }) => (
  <>
    {parts.map((part, i) => (
      <PartView key={i} part={part} />
    ))}
  </>
);

/* ---------- cables ---------- */

const CableLayer = ({ wires, layer }: { wires: Wire[]; layer: "low" | "high" }) => (
  <>
    {wires.map((wire, i) => {
      const piece = wire[layer];
      if (!piece.fill) return null;
      const body = (
        <>
          <path className="iso-fill" d={piece.fill} />
          <path className="iso-line" data-tone="mid" d={piece.sides} />
        </>
      );
      return wire.channel === null ? (
        <g key={i}>{body}</g>
      ) : (
        <g key={i} data-chain={wire.channel} data-kind="wire" data-base="mid">
          {body}
        </g>
      );
    })}
  </>
);

/* ---------- signals that run along the cables ---------- */

interface Run {
  channel: number;
  points: Array<[number, number]>;
  length: number;
  cumulative: number[];
}

const runOf = (channel: number, points: Array<[number, number]>): Run => {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(cumulative[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return { channel, points, length: cumulative[cumulative.length - 1], cumulative };
};

const RUNS: Run[] = [
  ...CABLES.filter((cable) => cable.channel !== null).map((cable) => runOf(cable.channel as number, cable.points as Array<[number, number]>)),
  runOf(3, [EMG_LINK.from as [number, number], EMG_LINK.to as [number, number]]),
];

function pointAt(run: Run, t: number): [number, number] {
  const target = Math.min(Math.max(t, 0), 1) * run.length;
  for (let i = 1; i < run.points.length; i++) {
    if (run.cumulative[i] >= target) {
      const span = run.cumulative[i] - run.cumulative[i - 1] || 1;
      const k = (target - run.cumulative[i - 1]) / span;
      const a = run.points[i - 1];
      const b = run.points[i];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
  }
  return run.points[run.points.length - 1];
}

/* ---------- the figure ---------- */

export function ScanRig() {
  const wrap = React.useRef<HTMLDivElement>(null);
  const svg = React.useRef<SVGSVGElement | null>(null);
  const packets = React.useRef<Array<SVGCircleElement | null>>([]);
  const { anchor, say } = useReadout<HTMLDivElement>();
  const spoken = React.useRef<HTMLParagraphElement>(null);
  const inView = useInView(wrap);

  const state = React.useRef({ channel: 0, shown: -1, over: false, focus: false, quiet: 0, clock: 0, wasIdle: false, signal: 0 });

  const apply = React.useCallback(
    (channel: number) => {
      const root = svg.current;
      if (!root) return;
      root.querySelectorAll<SVGElement>("[data-chain]").forEach((el) => {
        const chain = Number(el.getAttribute("data-chain"));
        const kind = el.getAttribute("data-kind");
        if (kind === "cell") {
          // the screen's progress: every channel up to the one being read
          el.querySelector(".iso-solid")?.toggleAttribute("data-lit", chain <= channel);
        } else if (kind === "body") {
          el.querySelector(".iso-solid")?.toggleAttribute("data-lit", chain === channel);
        } else {
          const base = el.getAttribute("data-base") ?? "mid";
          el.querySelectorAll(".iso-line").forEach((path) => path.setAttribute("data-tone", chain === channel ? "lit" : base));
        }
      });
      say(CHANNELS[channel].readout);
      if (spoken.current) spoken.current.textContent = CHANNELS[channel].means;
    },
    [say],
  );

  React.useEffect(() => {
    apply(state.current.channel);
    state.current.shown = state.current.channel;
  }, [apply]);

  const tick = React.useCallback(
    (dt: number, calm: boolean) => {
      const s = state.current;
      s.quiet += dt;
      const free = !s.over && !s.focus && !calm;
      const idle = free && s.quiet > QUIET;
      if (idle) {
        if (!s.wasIdle) s.clock = 0;
        s.clock += dt;
        s.channel = Math.floor(s.clock / TOUR_STEP) % CHANNELS.length;
      }
      s.wasIdle = idle;
      if (s.channel !== s.shown) {
        s.shown = s.channel;
        apply(s.channel);
        s.signal = 0;
      }
      s.signal += dt;
      RUNS.forEach((run, i) => {
        const dot = packets.current[i];
        if (!dot) return;
        if (run.channel !== s.channel) {
          dot.setAttribute("opacity", "0");
          return;
        }
        // a signal leaves the sensor and runs to the rack, then waits for the next
        const t = calm ? 0.5 : ((s.signal * SPEED) / run.length) % 1.5;
        const [x, y] = pointAt(run, t);
        dot.setAttribute("cx", String(fine(x)));
        dot.setAttribute("cy", String(fine(y)));
        dot.setAttribute("opacity", t <= 1 ? "1" : "0");
      });
      return free;
    },
    [apply],
  );

  const kick = useLoop(tick, inView);

  const woken = () => {
    state.current.quiet = 0;
    kick();
  };

  const pick = (event: React.PointerEvent) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((event.clientX - box.left) / box.width) * WIDTH;
    const y = ((event.clientY - box.top) / box.height) * HEIGHT;
    let best = -1;
    let near = PICK;
    for (const a of ANCHORS) {
      const d = Math.hypot(x - a.at[0], y - a.at[1]);
      if (d < near) {
        near = d;
        best = a.channel;
      }
    }
    if (best >= 0) state.current.channel = best;
  };

  const onKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const s = state.current;
    const count = CHANNELS.length;
    let handled = true;
    if (event.key >= "1" && event.key <= String(count)) s.channel = Number(event.key) - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") s.channel = (s.channel + 1) % count;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") s.channel = (s.channel + count - 1) % count;
    else handled = false;
    if (handled) {
      event.preventDefault();
      woken();
    }
  };

  return (
    <div
      ref={wrap}
      tabIndex={0}
      role="group"
      aria-label="Scan channels. Press 1 to 5, or the arrow keys, to pick one."
      onPointerMove={(event) => {
        state.current.over = true;
        pick(event);
        woken();
      }}
      onPointerDown={(event) => {
        state.current.over = true;
        pick(event);
        woken();
      }}
      onPointerLeave={() => {
        state.current.over = false;
        woken();
      }}
      onFocus={() => {
        state.current.focus = true;
        woken();
      }}
      onBlur={() => {
        state.current.focus = false;
        woken();
      }}
      onKeyDown={onKey}
      style={{ outline: "none", touchAction: "pan-y" }}
    >
      <div className="iso" data-theme="light">
        <Plate
          fig="Fig 1"
          title="Multimodal recording rig"
          hint="Hover a sensor"
          readout={CHANNELS[0].readout}
          keys={[
            { mark: "lit", label: "the channel being read" },
            { mark: "edge", label: "its cable to the rack" },
          ]}
          caption={
            <>
              The screen is lit and faces left; behind it stands the recording set-up for the multimodal study. An RGB camera
              reads pulse from the colour of the face and a thermal camera reads skin temperature, each on its own tripod. ECG
              leads clip onto a test plate on the equipment rack, wireless EMG pods sit in a dock beside their base station, and
              a boom microphone and a ring light complete the set. Every device is cabled to the rack, and the rack is cabled to
              the screen, whose progress cells fill as each channel is read.
            </>
          }
        >
          <div ref={anchor}>
            <IsoFigure
              width={WIDTH}
              height={HEIGHT}
              label="A thin lit screen faces left. Behind it, to the right, stands a recording set-up: an RGB camera and a thermal camera on tripods, a boom microphone, a ring light, and an equipment rack with ECG and EMG amplifiers, all cabled to the rack, which is cabled to the screen."
            >
              <g
                ref={(el) => {
                  svg.current = el?.ownerSVGElement ?? null;
                }}
              >
                <Parts parts={FLOOR_PARTS} />
                <Parts parts={GLOW} />
                <CableLayer wires={CABLES} layer="low" />
                {DEVICES.map((device) => (
                  <g key={device.id}>
                    <Parts parts={device.parts} />
                  </g>
                ))}
                <CableLayer wires={CABLES} layer="high" />
                {CABLES.map((wire, i) => (
                  <g key={`ends-${i}`} data-chain={wire.channel ?? undefined} data-kind="wire" data-base="mid">
                    <circle className="iso-wire-end" cx={fine(wire.from[0])} cy={fine(wire.from[1])} r={1.3} />
                    <circle className="iso-wire-end" cx={fine(wire.to[0])} cy={fine(wire.to[1])} r={1.3} />
                  </g>
                ))}
                <g data-chain={3} data-kind="wire" data-base="faint">
                  <path className="iso-line" data-tone="faint" data-dashed="" d={EMG_LINK.d} />
                </g>
                {RUNS.map((run, i) => (
                  <circle
                    key={`signal-${i}`}
                    ref={(el) => {
                      packets.current[i] = el;
                    }}
                    className="iso-wire-end"
                    cx={fine(run.points[0][0])}
                    cy={fine(run.points[0][1])}
                    r={2}
                    opacity={0}
                    style={{ stroke: "var(--anatomy-lit)", fill: "var(--anatomy-lit)" }}
                  />
                ))}
              </g>
            </IsoFigure>
          </div>
        </Plate>
        <p ref={spoken} aria-live="polite" className="sr-only" />
      </div>
    </div>
  );
}
