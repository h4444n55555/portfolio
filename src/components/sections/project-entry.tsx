"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type ProjectEntry = {
  id: string;
  title: string;
  /** A shorter title for the list row, when the full one is long. */
  listTitle?: string;
  tagline: string;
  period: string;
  problem: string;
  approach: string;
  links?: { label: string; href: string }[];
  /** An interactive figure shown under the title, above the write-up. */
  figure?: React.ComponentType;
};

type ProjectRowProps = {
  entry: ProjectEntry;
  isActive: boolean;
  onToggle: () => void;
  /** Indents nested rows (e.g. inside a collapsible group). */
  depth?: number;
};

/**
 * A single clickable table row — name / tagline / year, dashed top border —
 * shared between Research and Projects so both stay visually identical.
 */
export const ProjectRow: React.FC<ProjectRowProps> = ({
  entry,
  isActive,
  onToggle,
  depth = 0,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-current={isActive}
      style={depth ? { paddingLeft: `${depth * 1.25}rem` } : undefined}
      className={cn(
        "flex w-full items-baseline gap-4 border-t border-dashed border-border px-2 py-3 text-left transition-colors",
        isActive ? "bg-tint-active/60" : "hover:bg-tint-hover"
      )}
    >
      <span className="shrink-0 font-mono text-xs font-semibold tracking-wide uppercase">
        {entry.listTitle ?? entry.title}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
        {entry.tagline}
      </span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">
        {entry.period}
      </span>
    </button>
  );
};

/** A write-up's paragraphs: blank lines in the text become separate paragraphs. */
const Paragraphs: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mt-3 first:mt-2">
        {paragraph}
      </p>
    ))}
  </>
);

type ProjectDetailProps = {
  entry: ProjectEntry | null;
  idleLabel?: string;
};

/**
 * Right-hand detail pane: Problem / Approach for
 * the selected entry, or a terminal-style idle prompt when nothing's
 * selected.
 */
export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  entry,
  idleLabel = "select a project to inspect",
}) => {
  if (!entry) {
    return (
      <div className="flex items-start font-mono text-sm text-muted-foreground">
        <p>
          <span className="select-none">&gt; </span>
          {idleLabel}
          <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] animate-pulse bg-muted-foreground align-middle" />
        </p>
      </div>
    );
  }

  return (
    <article key={entry.id} className="font-serif text-[17px] leading-relaxed text-foreground/90">
      <h3 className="font-serif text-2xl font-semibold tracking-tight">{entry.title}</h3>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{entry.period}</p>

      {entry.figure ? (
        <div className="mt-6">
          <entry.figure />
        </div>
      ) : null}

      <div className="mt-6">
        <h4 className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Problem
        </h4>
        <Paragraphs text={entry.problem} />
      </div>

      <div className="mt-6">
        <h4 className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Approach
        </h4>
        <Paragraphs text={entry.approach} />
      </div>

      {entry.links && entry.links.length > 0 && (
        <div className="mt-8 flex gap-4 font-mono text-sm">
          {entry.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  );
};
