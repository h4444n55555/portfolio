import React from "react";
import {
  ParallaxLayers,
  ParallaxPlate,
} from "@/components/ui/parallax-scrolling";

/**
 * Hero: a printed plate — halftone figures walking across paper, with the
 * caption set behind them and the wordmark in the nav position.
 *
 * The figures are fixed to the section rather than being a parallax layer:
 * they stay planted on the bottom border while the caption drifts up behind
 * them on scroll. That's what sells the depth — a static foreground reading
 * against moving background type.
 *
 * Light ground rather than dark: the artwork is black ink drawn for paper,
 * so a dark field would swallow it, and inverting it would throw away the
 * printed character that makes it work. Contrast comes from the ink/paper
 * separation instead of from a dark backdrop.
 *
 * Deliberately sparse — About carries the biography, so this is a wordmark,
 * a one-line framing, and depth.
 */
export const Hero: React.FC = () => {
  return (
    <section className="relative h-screen overflow-hidden bg-[oklch(0.975_0.002_85)] text-foreground">
      <ParallaxLayers className="absolute inset-0">
        {/* Layer 1 — furthest back, moves most. A faint measurement grid:
            the graph paper under the research-paper aesthetic. */}
        <div
          data-parallax-layer="1"
          className="pointer-events-none absolute inset-x-0 -top-[20%] h-[140%] opacity-[0.45]"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.145 0 0 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.145 0 0 / 0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Layer 2 — the caption, set as a figure note. Drifts behind the
            plate on scroll, which is what reads as depth. */}
        <div
          data-parallax-layer="2"
          className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-32 md:px-10 lg:px-16"
        >
          <div className="flex flex-col items-start gap-5 text-left">
            <p className="max-w-3xl font-serif text-3xl leading-[1.15] text-foreground/85 md:text-5xl lg:text-6xl">
              There&apos;s always something
              <br />
              worth figuring out.
            </p>
            <p className="max-w-xl font-serif text-lg leading-relaxed text-foreground/55 italic md:text-2xl">
              I build, experiment, and research around AI and machine learning.
            </p>
          </div>
        </div>
      </ParallaxLayers>

      {/* Wordmark — nav position, top left. Positioned independently of the
          caption below: changing one must not move the other. Outside the
          parallax so it stays put like a nav bar rather than drifting. */}
      <div className="absolute top-0 left-0 z-20 px-6 pt-8 md:px-10 lg:px-16">
        <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
          Hans Nongmaithem
        </span>
      </div>

      {/* The plate — the figures the page scrolls under. Owned by the
          parallax module since it is the near-field element the whole
          effect reads against; the hero only positions it. */}
      <ParallaxPlate />

      {/* The border the figures walk on. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-border" />
    </section>
  );
};
