import React from "react";
import { CornerCat } from "@/components/ui/corner-cat";
import { StickerWall, type StickerSpec } from "@/components/ui/sticker-wall";
import { FooterHeading } from "@/components/ui/footer-heading";
import { HoloSticker } from "@/components/ui/holo-sticker";

const navItems = [
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#skills" },
  { label: "About", href: "#about" },
];

/** Rotations are hand-set so the three read as stuck on by hand, not set. */
const socials = [
  {
    label: "GitHub",
    href: "https://github.com/h4444n55555",
    src: "/stickers/github.png",
    rotate: -6,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/hans-nongmaithem-88504a320",
    src: "/stickers/linkedin.png",
    rotate: 4,
  },
  {
    label: "Kaggle",
    href: "https://www.kaggle.com/hansnongmaithem",
    src: "/stickers/kaggle.png",
    rotate: 6,
  },
  {
    label: "Email",
    href: "mailto:hansnongmaithem@gmail.com",
    src: "/stickers/gmail.png",
    rotate: -3,
  },
] as const;

/**
 * The sticker run, as first dealt onto the plate. `x`/`y` are fractions of
 * the footer box; the right-hand lane past ~0.80 is left clear so the
 * opening layout does not bury the cat. Everything is draggable from here.
 */
const stickers: StickerSpec[] = [
  {
    src: "/stickers/Python.png",
    wNarrow: "70px",
    w: "min(12vw, 112px)",
    rotate: -7,
    x: 0.08,
    y: 0.8,
  },
  {
    src: "/stickers/Motherboard.png",
    wNarrow: "62px",
    w: "min(11vw, 100px)",
    rotate: 5,
    x: 0.21,
    y: 0.9,
  },
  {
    src: "/stickers/RTX.png",
    wNarrow: "72px",
    w: "min(13vw, 118px)",
    rotate: -5,
    x: 0.35,
    y: 0.78,
  },
  {
    src: "/stickers/Gapple.png",
    wNarrow: "54px",
    w: "min(9vw, 82px)",
    rotate: 11,
    x: 0.47,
    y: 0.91,
  },
  {
    src: "/stickers/companion.png",
    wNarrow: "56px",
    w: "min(9.5vw, 86px)",
    rotate: -9,
    x: 0.58,
    y: 0.78,
  },
  {
    src: "/stickers/BB&B.png",
    wNarrow: "58px",
    w: "min(10vw, 90px)",
    rotate: 4,
    x: 0.69,
    y: 0.91,
  },
  {
    src: "/stickers/Jerk.png",
    wNarrow: "52px",
    w: "min(8.5vw, 78px)",
    rotate: 13,
    x: 0.78,
    y: 0.78,
  },
];

/**
 * Closing plate, revealed like a garage door: the page's last section slides
 * up and off, uncovering this footer sitting behind it.
 *
 * The reveal is pure CSS, and the mechanism is the `clip-path` on the outer
 * <footer>. That element sits in normal flow and so contributes its own height
 * to the page — which is the scroll distance the door needs in order to travel
 * clear of the viewport. Its child is `fixed`, so the plate itself stays
 * pinned to the bottom of the screen rather than scrolling. On its own a fixed
 * child would be visible from the first frame; the clip-path confines it to
 * the footer's own box, so it is only seen through the part of that box which
 * has actually scrolled into view.
 *
 * The important property is that none of this measures anything. Earlier
 * versions reserved the runway with a spacer and kept the smooth-scroll
 * library's cached scroll limit in sync as sections grew — which worked, but
 * cost a full ScrollTrigger refresh on every layout change and visibly dropped
 * frames. Here the footer's flow height *is* the runway, so however tall
 * Research, Projects and About become, the page always has exactly the extra
 * scroll needed to expose the plate, with no observers and no bookkeeping.
 *
 * The door (everything above) is opaque and stacked above this, which is what
 * makes the reveal read as a door rather than a crossfade.
 */
export const SiteFooter: React.FC = () => {
  return (
    <footer
      className="relative z-0 h-screen w-full"
      // Confines the fixed child below to this element's own box, so the plate
      // is revealed only as this box scrolls into view.
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
    >
      <div
        className="fixed inset-x-0 bottom-0 flex h-screen flex-col bg-white text-neutral-900"
      >
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <CornerCat />

          {/* Centred in the plate rather than pinned to its top: the footer is a
            full viewport tall, so top-aligned copy leaves it stranded above a
            screen of empty space. */}
          <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col justify-center px-6 pt-16 pb-40 md:px-10 lg:px-16">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                {/* Written rather than set: the pen crossing the line is the
                  first thing that moves once the footer is uncovered. */}
                <FooterHeading />

                <p className="mt-4 ml-8 max-w-sm font-serif text-[15px] leading-relaxed text-neutral-600">
                  Thanks for making it this far.
                </p>
              </div>

              <div className="flex flex-wrap items-start gap-x-8 gap-y-5 lg:justify-end">
                <nav aria-label="Footer" className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="font-mono text-xs tracking-wide text-neutral-500 uppercase transition-colors hover:text-neutral-900"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                {/* Stickers rather than a list: they sit in the same visual
                  register as the wall below, so the links read as part of
                  the plate instead of a second nav. Laid out in a row with
                  a little overlap, the way a strip gets stuck down. */}
                <div className="flex items-start -space-x-2 sm:-space-x-3">
                  {socials.map(({ label, href, src, rotate }) => (
                    <HoloSticker
                      key={label}
                      href={href}
                      label={label}
                      src={src}
                      rotate={rotate}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <StickerWall stickers={stickers} />
        </div>

        {/* The floor: the cat's ground line and the last row of the page. */}
        <div className="relative z-10 shrink-0 border-t border-white/20 bg-neutral-900 text-white">
          <p className="px-4 py-4 text-center font-pixel text-[9px] leading-relaxed tracking-wider text-white/80 uppercase sm:text-[10px]">
            Handmade with <span className="text-red-500">&hearts;</span> by Hans
          </p>
        </div>
      </div>
    </footer>
  );
};
