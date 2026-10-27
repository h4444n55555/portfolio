"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

// Types
interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
}

export interface DockIcon {
  src: string;
  alt: string;
  onClick?: () => void;
}

// Brand-mark data URIs (lucide-react ships generic icons only, no logos).
// `glyphScale` shrinks the symbol inside the tile without changing the tile
// size — the tile is always the full 24x24 viewBox.
export const svgDataUri = (
  path: string,
  viewBox = "0 0 24 24",
  glyphScale = 0.667
) => {
  const offset = (24 - 24 * glyphScale) / 2;
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="white"><rect width="24" height="24" rx="6" fill="black"/><g transform="translate(${offset},${offset}) scale(${glyphScale})">${path}</g></svg>`
  )}`;
};

const githubIconSrc = svgDataUri(
  '<path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.94 3.2 9.13 7.65 10.6.56.1.76-.24.76-.54 0-.27-.01-1.15-.02-2.09-3.11.68-3.77-1.32-3.77-1.32-.5-1.28-1.23-1.62-1.23-1.62-1-.7.08-.68.08-.68 1.11.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.48-.28-5.1-1.24-5.1-5.53 0-1.22.43-2.22 1.14-3-.11-.28-.49-1.42.11-2.96 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.11-1.44 3.04-1.14 3.04-1.14.6 1.54.22 2.68.11 2.96.71.78 1.14 1.78 1.14 3 0 4.3-2.62 5.24-5.12 5.52.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.77.54A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z" fill="white"/>'
);

const linkedinIconSrc = svgDataUri(
  '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z" fill="white"/>'
);

const xIconSrc = svgDataUri(
  '<path d="M18.24 2.5h3.32l-7.26 8.3 8.54 11.2h-6.69l-5.24-6.86-6 6.86H1.6l7.77-8.88L1.16 2.5h6.86l4.74 6.27 5.48-6.27Zm-1.17 17.5h1.84L7.02 4.36H5.05l12.02 15.64Z" fill="white"/>'
);

const mailIconSrc = svgDataUri(
  '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="m22 6-10 7L2 6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
);

const resumeIconSrc = svgDataUri(
  '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M14 2v6h6" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M9 13h6M9 17h6" stroke="white" stroke-width="2" stroke-linecap="round"/>'
);

// Glass Effect Wrapper Component
export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
}) => {
  const glassStyle = {
    boxShadow: "0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  const content = (
    <div
      className={`relative flex font-semibold overflow-hidden text-black cursor-pointer transition-all duration-700 ${className}`}
      style={glassStyle}
    >
      {/* Glass Layers */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-inherit rounded-3xl"
        style={{
          backdropFilter: "blur(3px)",
          filter: "url(#glass-distortion)",
          isolation: "isolate",
        }}
      />
      <div
        className="absolute inset-0 z-10 rounded-inherit"
        style={{ background: "rgba(255, 255, 255, 0.25)" }}
      />
      <div
        className="absolute inset-0 z-20 rounded-inherit rounded-3xl overflow-hidden"
        style={{
          boxShadow:
            "inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)",
        }}
      />

      {/* Content */}
      <div className="relative z-30">{children}</div>
    </div>
  );

  return href ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
};

// Dock Component
export const GlassDock: React.FC<{
  icons: DockIcon[];
  href?: string;
  iconSize?: number;
}> = ({ icons, href, iconSize = 64 }) => (
  <GlassEffect
    href={href}
    className="rounded-3xl p-4 hover:p-5 hover:rounded-4xl"
  >
    <div className="flex items-center justify-center gap-2 rounded-3xl p-3 py-0 px-0.5">
      {icons.map((icon, index) => (
        <img
          key={index}
          src={icon.src}
          alt={icon.alt}
          className="transition-all duration-700 hover:scale-110 cursor-pointer"
          style={{
            width: iconSize,
            height: iconSize,
            transformOrigin: "center center",
            transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
          }}
          onClick={icon.onClick}
        />
      ))}
    </div>
  </GlassEffect>
);

// Button Component
const GlassButton: React.FC<{ children: React.ReactNode; href?: string }> = ({
  children,
  href,
}) => (
  <GlassEffect
    href={href}
    className="rounded-3xl px-10 py-6 hover:px-11 hover:py-7 hover:rounded-4xl overflow-hidden"
  >
    <div
      className="transition-all duration-700 hover:scale-95"
      style={{
        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
      }}
    >
      {children}
    </div>
  </GlassEffect>
);

// SVG Filter Component
export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="200"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
// Main Component
export const Component = () => {
  const dockIcons: DockIcon[] = [
    {
      src: githubIconSrc,
      alt: "GitHub",
      onClick: () => window.open("https://github.com", "_blank"),
    },
    {
      src: linkedinIconSrc,
      alt: "LinkedIn",
      onClick: () => window.open("https://linkedin.com", "_blank"),
    },
    {
      src: xIconSrc,
      alt: "X",
      onClick: () => window.open("https://x.com", "_blank"),
    },
    {
      src: mailIconSrc,
      alt: "Email",
      onClick: () => window.open("mailto:hello@example.com"),
    },
    {
      src: resumeIconSrc,
      alt: "Resume",
      onClick: () => window.open("/cv.pdf", "_blank"),
    },
  ];

  return (
    <div
      className="min-h-screen h-full flex items-center justify-center font-light relative overflow-hidden w-full"
      style={{
        background: `url("https://images.unsplash.com/photo-1432251407527-504a6b4174a2?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D") center center`,
        animation: "moveBackground 60s linear infinite",
      }}
    >
      <GlassFilter />

      <div className="flex flex-col gap-6 items-center justify-center w-full">
        <GlassDock icons={dockIcons} />

        <GlassButton>
          <div className="text-white p-1">
            <ArrowDown className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </GlassButton>
      </div>
    </div>
  );
}
