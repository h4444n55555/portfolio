"use client";

import React from "react";
import Image from "next/image";

export type StickerSpec = {
  src: string;
  /** CSS width, e.g. "min(7vw, 110px)". */
  w: string;
  /** CSS width below the `sm` breakpoint, where vw units run too small. */
  wNarrow: string;
  rotate: number;
  /** Start position as a share of the wall box, 0–1. */
  x: number;
  y: number;
};

type Placed = { x: number; y: number; z: number };

/**
 * The sticker run, draggable anywhere inside the footer plate.
 *
 * Positions live in fractions of the wall box rather than pixels, so a
 * sticker dropped at the right edge stays at the right edge when the
 * viewport resizes instead of drifting off the plate.
 *
 * Overlap is resolved by pointer capture, not z-order: `setPointerCapture`
 * on press routes every subsequent move and the release to the sticker that
 * was actually hit, so a drag started on the top sticker cannot be stolen
 * mid-gesture by one it passes under. The pressed sticker is also lifted to
 * the front of the stack, which keeps the piece you grabbed the piece you
 * see. `touch-none` stops the browser from claiming the gesture as a scroll.
 */
export const StickerWall: React.FC<{ stickers: StickerSpec[] }> = ({
  stickers,
}) => {
  const wallRef = React.useRef<HTMLDivElement>(null);
  // The plate is tall and narrow on phones, where the wide desktop scatter
  // would ride up over the links. Compress the opening run into the lower
  // band instead, and keep the right lane clear for the cat.
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const [placed, setPlaced] = React.useState<Record<string, Placed>>(() =>
    Object.fromEntries(
      stickers.map((s, i) => [s.src, { x: s.x, y: s.y, z: i + 1 }]),
    ),
  );
  // Re-deal to the narrow layout on breakpoint change, but only while nothing
  // has been dragged — once the visitor has arranged the wall, it is theirs.
  const touched = React.useRef(false);
  React.useEffect(() => {
    if (touched.current) return;
    setPlaced(
      Object.fromEntries(
        stickers.map((s, i) => [
          s.src,
          {
            x: narrow ? 0.14 + (i % 3) * 0.29 : s.x,
            y: narrow ? 0.72 + Math.floor(i / 3) * 0.09 : s.y,
            z: i + 1,
          },
        ]),
      ),
    );
  }, [narrow, stickers]);
  // Grab offset between the pointer and the sticker's own origin, so the
  // sticker does not snap its centre to the cursor on press.
  const grab = React.useRef({ dx: 0, dy: 0 });
  const [dragging, setDragging] = React.useState<string | null>(null);

  const topZ = React.useRef(stickers.length);

  const onPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    src: string,
  ) => {
    const wall = wallRef.current;
    if (!wall) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const box = wall.getBoundingClientRect();
    const cur = placed[src];
    grab.current = {
      dx: (e.clientX - box.left) / box.width - cur.x,
      dy: (e.clientY - box.top) / box.height - cur.y,
    };

    touched.current = true;
    topZ.current += 1;
    const z = topZ.current;
    setPlaced((p) => ({ ...p, [src]: { ...p[src], z } }));
    setDragging(src);
  };

  const onPointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
    src: string,
  ) => {
    if (dragging !== src) return;
    const wall = wallRef.current;
    if (!wall) return;
    const box = wall.getBoundingClientRect();

    // Clamp to the plate so a sticker can't be thrown out of the footer.
    const x = Math.min(
      1,
      Math.max(0, (e.clientX - box.left) / box.width - grab.current.dx),
    );
    const y = Math.min(
      1,
      Math.max(0, (e.clientY - box.top) / box.height - grab.current.dy),
    );
    setPlaced((p) => ({ ...p, [src]: { ...p[src], x, y } }));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(null);
  };

  return (
    // The box spans the whole plate so stickers can be dragged anywhere, but
    // it must not swallow clicks meant for the footer links underneath, so
    // only the stickers themselves take pointer events.
    <div
      ref={wallRef}
      className="pointer-events-none absolute inset-0 z-20 select-none"
    >
      {stickers.map((s) => {
        const p = placed[s.src];
        const isDragging = dragging === s.src;
        return (
          <div
            key={s.src}
            onPointerDown={(e) => onPointerDown(e, s.src)}
            onPointerMove={(e) => onPointerMove(e, s.src)}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              width: narrow ? s.wNarrow : s.w,
              zIndex: p.z,
              transform: `translate(-50%, -50%) rotate(${s.rotate}deg) scale(${
                isDragging ? 1.08 : 1
              })`,
            }}
            className={`pointer-events-auto absolute touch-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            } transition-[filter,scale] duration-150`}
          >
            <Image
              src={s.src}
              alt=""
              width={400}
              height={400}
              draggable={false}
              aria-hidden="true"
              className={`h-auto w-full select-none ${
                isDragging
                  ? "drop-shadow-[0_10px_18px_rgba(0,0,0,0.30)]"
                  : "drop-shadow-[0_3px_6px_rgba(0,0,0,0.18)]"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};
