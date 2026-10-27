"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LiquidGlassProps {
  children?: React.ReactNode;
  /** Applied to the glass element itself — put size and border-radius here. */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A frosted-glass surface built on `backdrop-filter`.
 *
 * This used to be a WebGL lens (liquidGL) that rasterised the whole page into
 * a texture and re-projected it. That approach could never be made reliable
 * here: the snapshot went stale as sections animated, fixed layers (the
 * footer) were baked in at the wrong place, the lens canvas lagged behind the
 * morphing card, and every DOM mutation triggered a ~55ms full-page raster.
 *
 * `backdrop-filter` is composited by the browser against what is actually
 * behind the element each frame, so it can't go stale, can't desync from the
 * animation, and costs nothing when the page is idle.
 */
export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className,
  style,
}) => (
  <div
    className={cn("relative overflow-hidden", className)}
    style={{
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 100%)",
      backdropFilter: "blur(16px) saturate(180%) brightness(1.05)",
      WebkitBackdropFilter: "blur(16px) saturate(180%) brightness(1.05)",
      // Inner rim light + soft bottom shade give the bevelled-glass edge.
      boxShadow:
        "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(0,0,0,0.06), inset 0 0 0 0.5px rgba(255,255,255,0.5)",
      ...style,
    }}
  >
    <div className="pointer-events-none relative h-full w-full">{children}</div>
  </div>
);
