import React from "react";
import { cn } from "@/lib/utils";

type PaperSectionProps = {
  id: string;
  index: string;
  title: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Shared journal-article chrome: numbered header over a bordered section.
 * Body layout (single column, two-column flow, custom grid) is left to
 * the caller since it differs per section.
 */
export const PaperSection: React.FC<PaperSectionProps> = ({
  id,
  index,
  title,
  className,
  children,
}) => {
  return (
    <section
      id={id}
      className={cn(
        "border-t border-border px-6 py-20 md:px-10 lg:px-16",
        className
      )}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-baseline gap-4">
          <span className="font-mono text-sm text-muted-foreground">{index}</span>
          <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h2>
        </header>

        {children}
      </div>
    </section>
  );
};
