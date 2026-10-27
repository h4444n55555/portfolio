import React from "react";
import Image from "next/image";

/**
 * Dithered cat at the bottom-right of the footer, standing on the black
 * floor bar. Left as the black ink it was drawn as.
 *
 * The bar is now a sibling below this box rather than a strip inside it, so
 * the cat sits flush on the container's own bottom edge — that edge is the
 * floor line.
 *
 * Sits at the bar's height, then sinks the bottom slice of the artwork
 * behind it: ink runs to the image's final row, but that last stretch is the
 * outstretched paw and tail, drawn as halftone too sparse to read as
 * contact. Burying it puts the cat's solid mass on the line instead.
 *
 * The offset is a share of the image's own width (percentage margins resolve
 * against the containing block's width, and the box is the image's width),
 * so it tracks the artwork as it scales across breakpoints rather than
 * drifting the way a fixed pixel value would.
 */
export const CornerCat: React.FC = () => {
  return (
    <div className="pointer-events-none absolute right-4 bottom-0 z-0 w-[200px] overflow-hidden sm:w-[260px] md:right-10 md:w-[320px]">
      <Image
        src="/dithered_cat.png"
        alt=""
        width={802}
        height={597}
        // 9% of the artwork's height is faint fringe; as a share of width
        // that is 9% x 597/802 ≈ 6.7%.
        className="mb-[-6.7%] h-auto w-full select-none"
        aria-hidden="true"
        priority={false}
      />
    </div>
  );
};
