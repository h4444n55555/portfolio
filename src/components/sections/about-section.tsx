"use client";

import React, { useState } from "react";
import { DatabaseIcon } from "lucide-react";
import { Tree, type TreeViewElement } from "@/components/ui/file-tree";

type AboutEntry = {
  id: string;
  heading: string;
  meta?: string;
  body?: string;
  link?: { label: string; href: string };
  image?: { src: string; alt: string };
  skills?: Skill[];
};

/** A skill is shown as its logo; the few without one are just named. */
type Skill = { name: string; icon?: string | "sql" };

const SKILLS: Skill[] = [
  { name: "Python", icon: "python" },
  { name: "C", icon: "c" },
  { name: "SQL", icon: "sql" },
  { name: "PyTorch", icon: "pytorch" },
  { name: "Pandas", icon: "pandas" },
  { name: "FastAPI", icon: "fastapi" },
  { name: "React", icon: "react" },
  { name: "Next.js", icon: "nextjs" },
  { name: "Vite", icon: "vitejs" },
  { name: "TypeScript", icon: "typescript" },
  { name: "Tailwind", icon: "tailwindcss" },
  { name: "Express", icon: "express" },
  { name: "MongoDB", icon: "mongodb" },
  { name: "Docker", icon: "docker" },
  { name: "Kubernetes", icon: "kubernetes" },
  { name: "Git", icon: "git" },
  { name: "Claude Code", icon: "claude" },
];

// The tree on the left (ELEMENTS) and the text on the right (ENTRIES) are
// matched by id. A blank line inside a body starts a new paragraph.
const ELEMENTS: TreeViewElement[] = [
  {
    id: "about",
    type: "folder",
    name: "about",
    children: [
      {
        id: "readme",
        name: "README.md",
      },
      {
        id: "education",
        type: "folder",
        name: "education",
        children: [
          { id: "edu-degree", name: "btech-iit-ropar.md" },
        ],
      },
      {
        id: "experience",
        type: "folder",
        name: "experience",
        children: [
          { id: "exp-one", name: "iit-ropar-research.md" },
          { id: "exp-two", name: "kshetri-industries.md" },
          { id: "exp-three", name: "nimbus-md.md" },
        ],
      },
      {
        id: "skills",
        type: "folder",
        name: "skills",
        children: [{ id: "skills-all", name: "skills.md" }],
      },
      {
        id: "certifications",
        type: "folder",
        name: "certifications",
        children: [{ id: "cert-ibm", name: "ibm-eda.md" }],
      },
      {
        id: "interests",
        type: "folder",
        name: "interests",
        children: [
          { id: "interests-file", name: "beyond-work.md" },
        ],
      },
    ],
  },
];

const ENTRIES: Record<string, AboutEntry> = {
  readme: {
    id: "readme",
    heading: "About me",
    body: "I'm a B.Tech student in AI and Data Engineering at IIT Ropar. I build, experiment and research around AI and machine learning.\n\nMy research is in machine learning and NLP, from sentence embeddings to medical-image segmentation, and I'm working on health pre-screening from wearable-device signals.\n\nAround it I build the software: websites for a research lab and two startups, and full-stack ML systems for course projects. I'm co-founder of Kshetri Industries and frontend lead at Nimbus MD.",
  },
  "edu-degree": {
    id: "edu-degree",
    heading: "B.Tech in AI and Data Engineering, IIT Ropar",
    meta: "2024 – 2028",
    body: "A four-year B.Tech programme at the Indian Institute of Technology Ropar, in Punjab.\n\nCoursework so far spans machine learning, AI systems programming, linear algebra, data structures and algorithms, the foundations of computer systems, and optimization methods.\n\nMany of my projects started as course work, including a vision-language navigation agent, a RISC-V assembler, a Whisper hallucination study and Aura Screen.",
  },
  "exp-one": {
    id: "exp-one",
    heading: "Research Intern (ML & NLP), IIT Ropar",
    meta: "June 2026 – Present · Advisor: Dr. Loitongbam Gyanendro Singh",
    body: "Since June 2026 I've been a research intern in machine learning and NLP at IIT Ropar, advised by Dr. Loitongbam Gyanendro Singh.\n\nThe work is on sentence embeddings: analysing models that embed several languages, and implementing NLP algorithms that evaluate embedding performance across diverse linguistic datasets.",
  },
  "exp-two": {
    id: "exp-two",
    heading: "AI & Technology Head, Kshetri Industries",
    meta: "March 2025 – Present · Imphal East, Manipur",
    body: "Kshetri Industries Pvt. Ltd. is an early-stage food and beverage startup based in Imphal East, Manipur. I'm a co-founder and its AI & Technology Head.\n\nI founded and registered the company, oversee product development and operations, and integrate the technology behind inventory and process management.\n\nOn the product side I use AI and data analysis for development and branding, including Cha-bon, a flagship line of traditional rice-based energy drinks. I also designed, built and maintain the company website.",
  },
  "exp-three": {
    id: "exp-three",
    heading: "Frontend Lead, Nimbus MD",
    meta: "2026 – Present · Pre-incubation startup",
    body: "Nimbus MD is a cloud platform that runs docking, DFT and molecular dynamics simulations on supercomputer-class hardware. It's for research groups, experimental labs and biotech teams that don't have an HPC setup of their own.\n\nI'm the frontend lead, and I built the product site. We're pre-incubation and offering early access to academic and industry groups.",
  },
  "skills-all": {
    id: "skills-all",
    heading: "Skills",
    skills: SKILLS,
  },
  "cert-ibm": {
    id: "cert-ibm",
    heading: "Exploratory Data Analysis for Machine Learning",
    meta: "IBM · 2026",
    image: { src: "/certs/ibm-eda.jpeg", alt: "IBM certificate: Exploratory Data Analysis for Machine Learning" },
    link: { label: "Verify the certificate", href: "https://coursera.org/verify/VXFH3CYVP33J" },
  },
  "interests-file": {
    id: "interests-file",
    heading: "Beyond work",
    body: "I lift weights. I'm an active member of the campus weightlifting club, and I helped organize the IIT Ropar weightlifting team's event at Aarohan '26.\n\nI also like digging into odd datasets for fun. I once researched rare aesthetic patterns and the market price dynamics of CS2 digital assets.",
  },
};

const DEFAULT_ID = "readme";

export const AboutSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const entry = ENTRIES[selectedId] ?? ENTRIES[DEFAULT_ID];

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:gap-14">
      {/* Left: file tree */}
      <div className="md:border-r md:border-border md:pr-10">
        <Tree
          elements={ELEMENTS}
          initialSelectedId={DEFAULT_ID}
          initialExpandedItems={["about", "education", "experience", "skills", "certifications", "interests"]}
          onSelect={(id) => {
            if (ENTRIES[id]) setSelectedId(id);
          }}
        />
      </div>

      {/* Right: detail pane for the selected entry */}
      <article
        key={entry.id}
        className="font-serif text-[17px] leading-relaxed text-foreground/90"
      >
        <h3 className="font-serif text-2xl font-semibold tracking-tight">
          {entry.heading}
        </h3>
        {entry.meta && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">{entry.meta}</p>
        )}
        {entry.body?.split("\n\n").map((paragraph, index) => (
          <p key={index} className="mt-4">
            {paragraph}
          </p>
        ))}
        {entry.skills && (
          <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {entry.skills.map((skill) => (
              <li
                key={skill.name}
                className="group flex h-20 flex-col items-center justify-center gap-2 px-2 text-center"
              >
                {skill.icon === "sql" ? (
                  <DatabaseIcon className="size-7 text-foreground" strokeWidth={1.4} />
                ) : skill.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/skills/${skill.icon}.svg`}
                    alt=""
                    className="size-7 transition-transform duration-200 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : null}
                <span className="font-mono text-[11px] tracking-wide text-muted-foreground">{skill.name}</span>
              </li>
            ))}
          </ul>
        )}
        {entry.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.image.src} alt={entry.image.alt} className="mt-5 w-full" loading="lazy" />
        )}
        {entry.link && (
          <p className="mt-4 font-mono text-sm">
            <a
              href={entry.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {entry.link.label} ↗
            </a>
          </p>
        )}
      </article>
    </div>
  );
};
