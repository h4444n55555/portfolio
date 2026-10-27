"use client";

import React from "react";
import Image from "next/image";

/**
 * A social link as a vinyl sticker with a light holographic sheen.
 *
 * The sheen is deliberately restrained. Real holo vinyl reads as artwork
 * first with a faint rainbow riding over it at a glancing angle — not as a
 * rainbow with a logo on it. So this stays subtle: a low-opacity foil in
 * `overlay`, which tints what is already there rather than replacing it,
 * plus a single soft sweep of white for the wet-laminate highlight.
 *
 * Both are masked with the sticker's own PNG, so the sheen follows the
 * die-cut silhouette instead of painting the image's bounding box. The
 * artwork itself is untouched underneath.
 *
 * The foil slides against the pointer while the sticker tilts toward it —
 * holographic film diffracts by viewing angle, so the rainbow has to travel
 * the other way for the effect to read as depth rather than a texture stuck
 * to the surface.
 *
 * Everything rides on two CSS variables set on the root, so a pointer move
 * writes them and the compositor does the rest — no per-frame React render.
 *
 * Deliberately not draggable: these are links first, and a drag gesture
 * would compete with the click. The decorative stickers on the wall keep
 * that behaviour; these stay put.
 */
export const HoloSticker: React.FC<{
  href: string;
  label: string;
  src: string;
  rotate?: number;
}> = ({ href, label, src, rotate = 0 }) => {
  const ref = React.useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // -1..1 from the sticker's centre.
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--px", "0");
    el.style.setProperty("--py", "0");
  };

  const external = /^https?:/.test(href);

  return (
    <a
      ref={ref}
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onPointerMove={onMove}
      onPointerEnter={onMove}
      onPointerLeave={reset}
      onBlur={reset}
      className="holo"
      style={
        { "--rot": `${rotate}deg`, "--sticker": `url(${src})` } as React.CSSProperties
      }
    >
      <Image
        src={src}
        alt=""
        width={512}
        height={512}
        draggable={false}
        aria-hidden="true"
        className="holo-art"
      />
      {/* Masked to the artwork's own silhouette, so the sheen stops at the
          die-cut edge rather than squaring off at the image box. */}
      <span className="holo-foil" aria-hidden="true" />
      <span className="holo-shine" aria-hidden="true" />
    </a>
  );
};
