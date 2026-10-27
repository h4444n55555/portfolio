"use client";

import { useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

type OnHover = "slowDown" | "speedUp" | "pause" | "goBonkers" | false;

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: OnHover;
  className?: string;
  /** Distance from centre to the baseline of each glyph, in px. */
  radius?: number;
}

const getRotationTransition = (duration: number, from: number, loop = true) =>
  ({
    from,
    to: from + 360,
    ease: "linear",
    duration,
    type: "tween",
    repeat: loop ? Infinity : 0,
  }) as const;

const getTransition = (duration: number, from: number) => ({
  rotate: getRotationTransition(duration, from),
  scale: { type: "spring", damping: 20, stiffness: 300 } as const,
});

/**
 * Text laid out around a circle, continuously rotating. Adapted from the
 * React Bits CircularText recipe, but positioning each glyph with a real
 * radius translate so the ring size is controllable.
 */
export const CircularText: React.FC<CircularTextProps> = ({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className,
  radius = 60,
}) => {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  useEffect(() => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  }, [spinDuration, text, onHover, controls, rotation]);

  const spinTo = (duration: number, scaleVal = 1) => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: getTransition(duration, start),
    });
  };

  const handleHoverStart = () => {
    if (!onHover) return;
    const start = rotation.get();

    switch (onHover) {
      case "slowDown":
        return spinTo(spinDuration * 2);
      case "speedUp":
        return spinTo(spinDuration / 4);
      case "goBonkers":
        return spinTo(spinDuration / 20, 0.8);
      case "pause":
        return controls.start({
          rotate: start,
          scale: 1,
          transition: {
            rotate: { type: "spring", damping: 20, stiffness: 300 },
            scale: { type: "spring", damping: 20, stiffness: 300 },
          },
        });
    }
  };

  const handleHoverEnd = () => spinTo(spinDuration);

  return (
    <motion.div
      className={cn(
        "relative w-full h-full origin-center select-none",
        className
      )}
      style={{ rotate: rotation }}
      initial={{ rotate: 0 }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        // Each glyph is pinned to the centre, then rotated out to the rim.
        const transform = `translate(-50%, -50%) rotate(${rotationDeg}deg) translateY(-${radius}px)`;

        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 inline-block"
            style={{ transform, WebkitTransform: transform }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
};
