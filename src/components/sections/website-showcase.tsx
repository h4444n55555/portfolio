"use client";

import React from "react";

export type WebsiteEntry = {
  id: string;
  title: string;
  /** Short blurb: what the site is, who it's for. Not a changelog. */
  description: string;
  period: string;
  /** Screen-capture loop. Without one, the entry shows its text and link only. */
  video?: string;
  poster?: string;
  href?: string;
};

export const WEBSITES: WebsiteEntry[] = [
  {
    id: "kshetri-industries",
    title: "Kshetri Industries",
    description:
      "Official website for Kshetri Industries Pvt. Ltd., an early-stage food and beverage startup from Imphal, Manipur and the home of Cha-bon, a line of traditional rice-based energy drinks. Designed, built and maintained by me.",
    period: "2025",
    video: "/websites/kshetri-industries.mp4",
    href: "https://www.kshetriindustries.com/",
  },
  {
    id: "nanotech-lab",
    title: "NanoTech Lab",
    description:
      "Website for the computational molecular science group in Chemical Engineering at IIT Ropar — research, publications, team, news and open positions.",
    period: "2026",
    video: "/websites/website-theta.mp4",
    href: "https://website-theta-six-66.vercel.app/",
  },
  {
    id: "nimbus-md",
    title: "Nimbus MD",
    description:
      "Marketing site for a cloud platform that runs docking, DFT and molecular dynamics simulations on supercomputer-class hardware, aimed at research groups and biotech.",
    period: "2026",
    href: "https://nimbus-md-website.vercel.app/",
  },
];

type WebsiteShowcaseDetailProps = {
  entry: WebsiteEntry | null;
};

/**
 * Right-column detail pane for the Websites group: a looping, muted,
 * autoplaying video of the site in motion rather than prose — the
 * uninterruptible showreel treatment premium marketing sites use, no
 * play/pause affordance offered.
 */
export const WebsiteShowcaseDetail: React.FC<WebsiteShowcaseDetailProps> = ({ entry }) => {
  if (!entry) {
    return (
      <div className="flex items-start font-mono text-sm text-muted-foreground">
        <p>
          <span className="select-none">&gt; </span>
          select a website to preview
          <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] animate-pulse bg-muted-foreground align-middle" />
        </p>
      </div>
    );
  }

  return (
    <article key={entry.id}>
      {entry.video && (
        <div className="relative aspect-video w-full overflow-hidden border border-border bg-tint-hover">
          <video
            key={entry.video}
            className="h-full w-full object-cover"
            src={entry.video}
            poster={entry.poster}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            controls={false}
            controlsList="nodownload noplaybackrate nofullscreen"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}

      <div className={entry.video ? "mt-4 flex items-baseline justify-between gap-3" : "flex items-baseline justify-between gap-3"}>
        <h3 className="font-serif text-xl font-semibold tracking-tight text-foreground">
          {entry.title}
        </h3>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{entry.period}</span>
      </div>
      <p className="mt-2 font-serif text-[15px] leading-relaxed text-muted-foreground">
        {entry.description}
      </p>

      {entry.href && (
        <div className="mt-4 font-mono text-sm">
          <a
            href={entry.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Visit ↗
          </a>
        </div>
      )}
    </article>
  );
};
