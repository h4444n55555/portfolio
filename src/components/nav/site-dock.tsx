"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircularText } from "@/components/ui/circular-text";
import { LiquidGlass } from "@/components/ui/liquid-orb";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#skills" },
  { label: "About", href: "#about" },
];

const GithubMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.94 3.2 9.13 7.65 10.6.56.1.76-.24.76-.54 0-.27-.01-1.15-.02-2.09-3.11.68-3.77-1.32-3.77-1.32-.5-1.28-1.23-1.62-1.23-1.62-1-.7.08-.68.08-.68 1.11.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.48-.28-5.1-1.24-5.1-5.53 0-1.22.43-2.22 1.14-3-.11-.28-.49-1.42.11-2.96 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.11-1.44 3.04-1.14 3.04-1.14.6 1.54.22 2.68.11 2.96.71.78 1.14 1.78 1.14 3 0 4.3-2.62 5.24-5.12 5.52.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.77.54A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z" />
  </svg>
);

const LinkedinMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z" />
  </svg>
);

const MailMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const KaggleMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M7 3.5v17M17 3.5l-8.5 9 8.5 8" />
  </svg>
);

const socials = [
  { label: "GitHub", href: "https://github.com/h4444n55555", Icon: GithubMark },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/hans-nongmaithem-88504a320",
    Icon: LinkedinMark,
  },
  { label: "Kaggle", href: "https://www.kaggle.com/hansnongmaithem", Icon: KaggleMark },
  { label: "Email", href: "mailto:hansnongmaithem@gmail.com", Icon: MailMark },
];

const ORB = 72;
const RING_BOX = 128;
const CARD_W = 288;
const CARD_H = 384;
const EASE = [0.2, 0.8, 0.3, 1] as const;

export const SiteDock: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  // Clicking anywhere outside the card — or pressing Escape — closes it.
  // Capture phase, so a page element that stops propagation can't swallow it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!dockRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      className="pointer-events-none fixed bottom-8 right-8"
      style={{ zIndex: 9999 }}
    >
      {/* Sized to the ring when closed so the orbiting text has room, and to
          the card when open. Bottom-right anchored so it grows up and left. */}
      <motion.div
        className="relative"
        initial={false}
        animate={{
          width: open ? CARD_W : RING_BOX,
          height: open ? CARD_H : RING_BOX,
        }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        {/* Ring orbits outside the lens, so it is a sibling rather than a
            child — a child would sit inside the glass. */}
        <AnimatePresence>
          {!open && (
            <motion.div
              key="ring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-0 text-black"
              aria-hidden="true"
            >
              <CircularText
                text="CONTACT · MENU · "
                spinDuration={18}
                radius={RING_BOX / 2 - 8}
                className="font-mono text-[10px] font-semibold tracking-widest"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={dockRef}
          className="absolute"
          initial={false}
          animate={{
            width: open ? CARD_W : ORB,
            height: open ? CARD_H : ORB,
            left: open ? 0 : (RING_BOX - ORB) / 2,
            top: open ? 0 : (RING_BOX - ORB) / 2,
            borderRadius: open ? 28 : ORB / 2,
          }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.06)",
          }}
        >
          <LiquidGlass className="h-full w-full" style={{ borderRadius: "inherit" }}>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.2 }}
                className="pointer-events-auto h-full w-full p-6 text-black"
              >
                {/* The hit area is 32px square and sits 16px in, so the glyph
                    lands 32px from both edges — clear of the rounded corner
                    and level with the name's first line. */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm text-black/40 transition-colors hover:bg-white/40 hover:text-black"
                >
                  ✕
                </button>

                <p className="font-serif text-lg font-semibold">Hans Nongmaithem</p>
                <p className="mt-0.5 font-mono text-xs text-black/50">Undergrad AIDE</p>

                <nav className="mt-5 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="-mx-2 rounded-md px-2 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors hover:bg-white/40"
                    >
                      {item.label}
                    </a>
                  ))}
                  <a
                    href="/writeup"
                    onClick={() => setOpen(false)}
                    className="-mx-2 rounded-md px-2 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors hover:bg-white/40"
                  >
                    Write-up
                  </a>
                </nav>

                <div className="mt-5 flex items-center gap-1 border-t border-black/10 pt-4">
                  {socials.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      title={label}
                      {...(/^https?:/.test(href)
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/40"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </LiquidGlass>

          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open contact and navigation"
              className="pointer-events-auto absolute inset-0 cursor-pointer"
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
