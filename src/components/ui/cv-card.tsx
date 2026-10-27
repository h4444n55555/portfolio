"use client";

import React from "react";
import { createPortal } from "react-dom";

/**
 * Where the CV file lives. Drop the PDF at this path in `public/` and flip
 * `hasFile`; the card then embeds the real document. Until then it shows a
 * placeholder sheet rather than an empty viewer or a download that 404s.
 */
const CV_PATH = "/cv/hans-nongmaithem-cv.pdf";
const hasFile = false;

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal CV card, opened from the footer bar: the PDF itself, sized to be
 * read rather than previewed.
 *
 * The chrome is deliberately thin — a hairline border, a mono caption bar,
 * and the page's serif title — so the document is what the card shows. It
 * fills the viewport up to a page-shaped cap, since a CV read at postcard
 * size is no use to anyone.
 *
 * Dialog semantics are hand-rolled rather than pulled from a library: the
 * project ships no dialog primitive, and this needs only the behaviours a
 * modal must get right — Escape closes, focus moves into the card on open
 * and returns to the trigger on close, Tab stays inside, and the page
 * behind neither scrolls nor takes clicks.
 */
export const CvCard: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  // The element focused before opening, so focus can be handed back on close
  // instead of falling to the top of the document.
  const restoreRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      // Keep Tab inside the card: a modal that lets focus wander into the
      // page behind it is a modal in appearance only.
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    // Hold the page still: without this the footer behind creeps as the
    // overlay takes over the wheel.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const restore = restoreRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restore?.focus?.();
    };
  }, [open, onClose]);

  // The footer paints in its own stacking context (it is a positioned,
  // z-indexed sticky element), so a modal rendered inside it competes only
  // with its siblings — the stickers and floor bar would sit on top however
  // high its z-index went. Portalling to <body> lifts the card clear of that
  // context so it covers the page for real.
  // Only ever rendered in response to a click, so `document` is available by
  // the time this runs and no mount guard is needed.
  if (!open) return null;

  return createPortal(
    // Above the floating dock, which anchors itself at z-index 9999; a CV
    // opened over it should cover it like anything else on the page.
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      {/* Scrim. It carries the dismiss handler itself rather than a wrapper
          around both layers: as the topmost full-bleed element it is what a
          click outside the card actually lands on. */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-card-title"
        tabIndex={-1}
        // A page-shaped cap: tall enough to read, never wider than A4 needs.
        className="relative flex h-full max-h-[min(94vh,1100px)] w-full max-w-[min(96vw,860px)] flex-col overflow-hidden border border-neutral-300 bg-white text-neutral-900 shadow-[0_24px_60px_rgba(0,0,0,0.3)] outline-none"
      >
        <header className="flex shrink-0 items-center justify-between gap-6 border-b border-neutral-200 px-5 py-3">
          <div className="flex min-w-0 items-baseline gap-3">
            <h2
              id="cv-card-title"
              className="truncate font-serif text-lg font-semibold tracking-tight"
            >
              Curriculum Vitae
            </h2>
            <span className="hidden font-mono text-[11px] tracking-wide text-neutral-500 uppercase sm:inline">
              Hans Nongmaithem
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {hasFile && (
              <a
                href={CV_PATH}
                download
                className="border border-neutral-900 bg-neutral-900 px-3 py-1.5 font-mono text-[10px] tracking-wide text-white uppercase transition-colors hover:bg-neutral-700"
              >
                Download ↓
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 font-mono text-sm text-neutral-400 transition-colors hover:text-neutral-900"
            >
              ✕
            </button>
          </div>
        </header>

        {/* The document. */}
        <div className="min-h-0 flex-1 bg-neutral-100">
          {hasFile ? (
            <object
              data={`${CV_PATH}#view=FitH`}
              type="application/pdf"
              className="h-full w-full"
              aria-label="Curriculum vitae, PDF"
            >
              {/* Shown where inline PDF viewing is unavailable, which is the
                  norm on mobile browsers. */}
              <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="font-mono text-[11px] leading-relaxed text-neutral-500">
                  Your browser can&apos;t display the PDF inline.
                </p>
                <a
                  href={CV_PATH}
                  download
                  className="border border-neutral-900 bg-neutral-900 px-4 py-2 font-mono text-[11px] tracking-wide text-white uppercase transition-colors hover:bg-neutral-700"
                >
                  Download ↓
                </a>
              </div>
            </object>
          ) : (
            // Placeholder sheet: a blank page in the reader's proportions, so
            // the card is laid out for the real document before it arrives.
            <div className="flex h-full items-center justify-center p-6">
              <div className="flex h-full w-full max-w-[620px] flex-col items-center justify-center gap-3 border border-dashed border-neutral-300 bg-white px-8 text-center">
                <p className="font-serif text-lg text-neutral-400">
                  CV not attached yet
                </p>
                <p className="max-w-sm font-mono text-[11px] leading-relaxed text-neutral-500">
                  Drop the PDF at{" "}
                  <span className="text-neutral-800">public{CV_PATH}</span>,
                  then set <span className="text-neutral-800">hasFile</span> to
                  true in{" "}
                  <span className="text-neutral-800">
                    src/components/ui/cv-card.tsx
                  </span>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
