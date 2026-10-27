"use client";

import React, { useEffect, useState } from "react";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";

interface LoadingSceneProps {
  onDone?: () => void;
}

export const LoadingScene: React.FC<LoadingSceneProps> = ({ onDone }) => {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (leaving) return;

    // Roughly the length of the sequence below, then fade out.
    const done = window.setTimeout(() => setLeaving(true), 7600);
    return () => window.clearTimeout(done);
  }, [leaving]);

  useEffect(() => {
    // Once leaving starts (naturally or via skip), let the fade play out
    // before handing off.
    if (!leaving) return;
    const finish = window.setTimeout(() => onDone?.(), 700);
    return () => window.clearTimeout(finish);
  }, [leaving, onDone]);

  useEffect(() => {
    const skip = () => setLeaving(true);
    window.addEventListener("keydown", skip);
    window.addEventListener("mousedown", skip);
    window.addEventListener("touchstart", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("mousedown", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-700"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <Terminal className="w-[min(560px,92vw)]" startOnView={false} chrome={false}>
        <TypingAnimation>&gt; python identify.py --target &quot;hans&quot;</TypingAnimation>

        <AnimatedSpan className="text-green-500">
          ✔ Loading checkpoint: vision-transformer-b16.
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500">
          ✔ Embedding 1,284 research artifacts.
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500">
          ✔ Clustering latent space. 3 dense regions found.
        </AnimatedSpan>

        <AnimatedSpan className="text-blue-500">
          <span>ℹ Nearest neighbours:</span>
          <span className="pl-2">- machine learning</span>
          <span className="pl-2">- computer vision</span>
          <span className="pl-2">- generative models</span>
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500">
          ✔ Decoding identity vector. confidence 0.98.
        </AnimatedSpan>

        <TypingAnimation className="text-muted-foreground">
          Match: Hans Nongmaithem — researcher, based in India.
        </TypingAnimation>

        <TypingAnimation className="text-muted-foreground">
          Rendering portfolio...
        </TypingAnimation>
      </Terminal>

      <p className="absolute bottom-8 font-mono text-xs text-muted-foreground">
        press any key or click to skip
      </p>
    </div>
  );
};
