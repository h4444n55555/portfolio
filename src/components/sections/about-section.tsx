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
  /** Label / value rows shown as a small spec table above the body. */
  facts?: { label: string; value: string }[];
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
  { name: "TypeScript", icon: "typescript" },
  { name: "Tailwind", icon: "tailwindcss" },
  { name: "MongoDB", icon: "mongodb" },
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
        children: [
          { id: "cert-intern", name: "iit-ropar-internship.md" },
          { id: "cert-ibm", name: "ibm-eda.md" },
        ],
      },
      {
        id: "personal",
        type: "folder",
        name: "personal",
        children: [
          { id: "interests-file", name: "about-me.md" },
        ],
      },
    ],
  },
];

const ENTRIES: Record<string, AboutEntry> = {
  "edu-degree": {
    id: "edu-degree",
    heading: "B.Tech in AI and Data Engineering, IIT Ropar",
    meta: "2024 – 2028",
    facts: [
      { label: "Degree", value: "Bachelor of Technology (B.Tech)" },
      { label: "Major", value: "Artificial Intelligence and Data Engineering" },
      { label: "Institute", value: "Indian Institute of Technology Ropar, Punjab" },
      { label: "Duration", value: "2024 – 2028" },
      {
        label: "Coursework",
        value:
          "Machine Learning, Artificial Intelligence, Linear Algebra, Optimization Techniques, Databases, Data Structures and Algorithms, Signals and Systems, Foundation of Computer Systems, Calculus, Differential Equations, HCI and Visualization, Ethics in AI, Deep Learning, Big Data Analytics, MLOps Lab",
      },
    ],
  },
  "exp-one": {
    id: "exp-one",
    heading: "Research Intern (ML & NLP), IIT Ropar",
    meta: "June – July 2026 · Advisor: Dr. Loitongbam Gyanendro Singh",
    body: "From June to July 2026 I was a research intern in machine learning and NLP at IIT Ropar, advised by Dr. Loitongbam Gyanendro Singh.\n\nThe work was on sentence embeddings: analysing models that embed several languages, and implementing NLP algorithms that evaluate embedding performance across diverse linguistic datasets.",
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
  "cert-intern": {
    id: "cert-intern",
    heading: "Internship Certificate, IIT Ropar",
    meta: "Dept. of Computer Science and Engineering · June 1 – July 16, 2026",
    body: "Sentence Representation Learning using Contrastive Loss Function, under Dr. Loitongbam Gyanendro Singh.",
    image: { src: "/certs/iit-ropar-internship.jpg", alt: "IIT Ropar internship certificate: Sentence Representation Learning using Contrastive Loss Function" },
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
    heading: "Hi, I'm Hans",
    body: "I'm from Shillong, Meghalaya, and I'm now studying at IIT Ropar, where I'm an active member of the campus weightlifting club at IIT Ropar. Lifting is the part of the day I don't negotiate with.\n\nI enjoy building PCs, picking the parts and putting the whole thing together. I also trade CS2 skins now and then, and I like seeing how that market moves.\n\nOutside that I like travelling, good food, and frontend design, which is as much a hobby as a job for me.",
  },
};

const DEFAULT_ID = "edu-degree";

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
          initialExpandedItems={["about", "education", "experience", "skills", "certifications", "personal"]}
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
        {entry.facts && (
          <dl className="mt-6 border-t border-dashed border-border">
            {entry.facts.map((fact) => (
              <div
                key={fact.label}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-dashed border-border py-3"
              >
                <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="text-[16px] leading-snug text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
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
