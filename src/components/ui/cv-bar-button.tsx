"use client";

import React from "react";
import { CvCard } from "@/components/ui/cv-card";

/**
 * The footer bar's CV cell: the trigger and the card it opens.
 *
 * Only this cell needs client state, so the modal is mounted here rather
 * than lifting the whole footer across the server/client boundary. The
 * button carries the same pixel-text styling as its sibling cells, so the
 * bar still reads as one continuous strip.
 */
export const CvBarButton: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="px-4 py-4 text-center font-pixel text-[9px] leading-relaxed tracking-wider text-white/80 uppercase transition-colors hover:bg-white hover:text-neutral-900 sm:text-[10px]"
      >
        CV
      </button>

      <CvCard open={open} onClose={() => setOpen(false)} />
    </>
  );
};
