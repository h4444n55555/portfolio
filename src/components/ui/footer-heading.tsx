"use client";

import React from "react";
import { HandwritingText } from "@/components/ui/handwriting-text";

/**
 * The footer's handwritten heading, drawn only once the plate is actually
 * uncovered.
 *
 * The footer is `sticky bottom-0` sitting behind the page: the sections above
 * slide up and off to reveal it. That means it intersects the viewport from
 * the very first frame even while it is completely covered, so an
 * IntersectionObserver on the heading fires at the top of the page and the
 * stroke would be long finished before anyone saw it.
 *
 * Scroll progress is the honest signal instead. The footer is revealed as the
 * document reaches its end, so the pen starts once the bottom of the window
 * is within a plate's height of the bottom of the page.
 */
export const FooterHeading: React.FC = () => {
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    if (revealed) return undefined;

    const check = () => {
      const el = document.scrollingElement ?? document.documentElement;
      const remaining = el.scrollHeight - (el.scrollTop + window.innerHeight);
      // The footer is one viewport tall and revealed as the door slides off
      // it, so the plate is only actually uncovered near the very end of the
      // scroll. Waiting for that stops the pen running behind a closed door.
      if (remaining <= window.innerHeight * 0.15) setRevealed(true);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [revealed]);

  return (
    <h2 className="font-serif leading-[1.05] font-semibold tracking-tight">
      <HandwritingText
        text="That's it. For Now"
        height="clamp(2.75rem, 7vw, 4rem)"
        duration={2.1}
        strokeWidth={1.4}
        start={revealed}
        trimSides
        className="block text-neutral-900"
      />
    </h2>
  );
};
