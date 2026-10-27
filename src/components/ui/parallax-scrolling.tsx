"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

type ParallaxLayersProps = {
  /** Rendered back-to-front; index 0 moves least, giving it the most depth. */
  children: React.ReactNode;
  className?: string;
};

/**
 * Depth-scrub parallax driven by ScrollTrigger.
 *
 * Layers are declared in markup with `data-parallax-layer="N"` and pushed
 * down at different rates as the pinned header scrolls past, so the further
 * layers appear to lag behind. Layer content is left entirely to the caller —
 * this only owns the motion.
 *
 * Adapted from Osmo's parallax resource (https://www.osmo.supply/).
 */
export const ParallaxLayers: React.FC<ParallaxLayersProps> = ({
  children,
  className,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect a user's reduced-motion setting: the layers still render, they
    // just don't move. Parallax is the exact kind of vestibular trigger this
    // setting exists for.
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    if (!root) return;

    // Scoping to `root` keeps this component's cleanup from killing
    // ScrollTriggers or tweens belonging to anything else on the page.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 },
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          root.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          { yPercent: layerObj.yPercent, ease: "none" },
          // All layers share one scrub position — they differ only in
          // distance travelled, which is what reads as depth.
          idx === 0 ? undefined : "<",
        );
      });
    }, root);

    // Lenis smooths the wheel input that drives the scrub. Without it the
    // layers step in discrete wheel deltas instead of gliding.
    const lenis = new Lenis();
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Remove only what this instance added, in reverse order.
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} data-parallax-layers className={className}>
      {children}
    </div>
  );
};

/**
 * The foreground plate: halftone figures walking along the bottom of the
 * hero, fixed to the page rather than parallaxing.
 *
 * It lives here, next to the motion it belongs to, because it is the
 * near-field element the whole parallax reads against — the page scrolls up
 * underneath it while the hero's type drifts behind. Keeping it out of
 * `ParallaxLayers` is deliberate: it must NOT carry a `data-parallax-layer`
 * attribute, since any independent motion would break the illusion that it
 * is attached to the page.
 *
 * The PNG is cropped flush to the ink, so the element's bottom edge is the
 * figures' feet — `bottom-0` lands them exactly on the hero's bottom border
 * at any viewport size.
 */
export const ParallaxPlate: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={
        "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center " +
        (className ?? "")
      }
    >
      <Image
        src="/evolution-plate.png"
        alt=""
        width={2500}
        height={1101}
        priority
        className="block h-auto w-full max-w-[1150px] select-none"
      />
    </div>
  );
};
