"use client";

import React, { useState } from "react";
import { LoadingScene } from "@/components/sections/loading-scene";

export const SiteLoader: React.FC = () => {
  const [done, setDone] = useState(false);

  if (done) return null;
  return <LoadingScene onDone={() => setDone(true)} />;
};
