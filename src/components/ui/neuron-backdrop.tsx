"use client";

import React from "react";
import Image from "next/image";
import { useSelectionState } from "@/components/ui/selection-context";

/**
 * The dithered neuron, sitting behind the Research and Projects sections as
 * one continuous piece of artwork.
 *
 * Two things make it read as a backdrop rather than a pasted image:
 *
 * `mix-blend-multiply` does the masking. The source SVG is a dithered raster
 * — ~6,000 opaque white rects around ~5,000 black ones, with no alpha
 * anywhere — so dropped in as-is it would paint a white block over the
 * section. Multiply keeps the black halftone and lets the white drop out
 * against the light page, which is also why the parent must stay a light,
 * opaque colour: over a dark ground the whole plate would go black.
 *
 * It is anchored right and allowed to run off that edge, so the figure is
 * cropped by the viewport the way a plate bleeds off a printed page instead
 * of floating boxed-in beside the text.
 *
 * Each section hides its own slice. The artwork is drawn once per section,
 * each copy clipped to that section's vertical band and offset so the copies
 * line up into a single continuous figure — the seam is invisible because
 * every copy draws the same image at the same place and only their windows
 * differ. That is what lets Research's half disappear behind an open project
 * while Projects' half stays, and the reverse.
 *
 * The bands are measured rather than hardcoded, since the two sections are
 * different heights. But the artwork itself is laid out against a frozen
 * height captured while both sections are closed, not against their live
 * one: opening a detail pane makes a section taller, and scaling the figure
 * to that would slide it down the page every time something is selected. The
 * windows track the sections; the drawing inside them does not.
 */
export const NeuronBackdrop: React.FC<{
  /** Ids of the two sections the artwork spans, in document order. */
  sectionIds: [string, string];
}> = ({ sectionIds }) => {
  const selection = useSelectionState();
  const rootRef = React.useRef<HTMLDivElement>(null);
  // Each section's band as {top, height} in pixels, relative to the wrapper.
  const [bands, setBands] = React.useState<
    { top: number; height: number }[] | null
  >(null);
  // The artwork's own box, captured once from the closed layout and then held
  // still so selections cannot reflow the drawing. State rather than a ref
  // because it decides what gets rendered.
  const [frozen, setFrozen] = React.useState<
    { top: number; height: number }[] | null
  >(null);

  const [first, second] = sectionIds;

  React.useEffect(() => {
    const root = rootRef.current;
    const parent = root?.parentElement;
    if (!parent) return undefined;

    const ids = [first, second];

    const measure = () => {
      const base = parent.getBoundingClientRect().top;
      const next = ids.map((id) => {
        const el = document.getElementById(id);
        if (!el) return { top: 0, height: 0 };
        const r = el.getBoundingClientRect();
        return { top: r.top - base, height: r.height };
      });
      // Only commit real changes: ResizeObserver fires on every layout pass,
      // and setting an equal value each time would loop.
      // Only the closed layout defines where the artwork sits. Once a pane is
      // open the sections grow, and adopting that would drag the figure down.
      if (next.every((b) => b.height > 0)) {
        setFrozen((prev) => prev ?? next);
      }
      setBands((prev) =>
        prev &&
        prev.length === next.length &&
        prev.every(
          (b, i) =>
            Math.abs(b.top - next[i].top) < 0.5 &&
            Math.abs(b.height - next[i].height) < 0.5,
        )
          ? prev
          : next,
      );
    };

    measure();

    // Sections resize when a detail pane opens and when the viewport changes.
    const ro = new ResizeObserver(measure);
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) ro.observe(el);
    });
    ro.observe(parent);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [first, second]);

  const open = [selection?.research ?? false, selection?.projects ?? false];
  // Geometry for the drawing comes from the frozen layout; the clip windows
  // still follow the live sections so each half covers its own section.
  const art = frozen ?? bands;
  const total = art ? art[0].height + art[1].height : 0;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[min(58vw,760px)] select-none md:block lg:w-[min(52vw,880px)]"
    >
      {art &&
        total > 0 &&
        art.map((frozenBand, i) => (
          <div
            key={sectionIds[i]}
            // The window follows the live section, so a half can never spill
            // into its neighbour when the other one grows...
            style={{
              top: bands?.[i].top ?? frozenBand.top,
              height: bands?.[i].height ?? frozenBand.height,
            }}
            className={`absolute inset-x-0 overflow-hidden ${
              open[i] ? "invisible" : "visible"
            }`}
          >
            {/* ...while the drawing inside is placed from the frozen layout
                and counter-offset by the window's live position, so the figure
                stays put on the page no matter which pane is open. Every copy
                paints the same image in the same place; only the clip differs. */}
            <div
              style={{
                // Counter the window's live offset so the figure lands at the
                // same page position for both halves regardless of which pane
                // is open. (Reduces to -liveTop, kept explicit for clarity.)
                top: -(bands?.[i].top ?? frozenBand.top),
                height: total,
              }}
              className="absolute inset-x-0 translate-x-[18%] lg:translate-x-[12%]"
            >
              <Image
                src="/neuron-dithered.svg"
                alt=""
                fill
                priority={false}
                className="object-contain object-right mix-blend-multiply"
              />
            </div>
          </div>
        ))}
    </div>
  );
};
