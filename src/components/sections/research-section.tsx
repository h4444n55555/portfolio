"use client";

import React, { useState } from "react";
import {
  ProjectRow,
  ProjectDetail,
  type ProjectEntry,
} from "@/components/sections/project-entry";
import { useReportSelection } from "@/components/ui/selection-context";
/**
 * Ongoing work, kept deliberately high level: the aim and the shape of the
 * approach, with no datasets under data-use agreements, unpublished results,
 * collaborators or study details.
 */
const CURRENT: ProjectEntry[] = [
  {
    id: "wearable-prescreening",
    title: "Wearable Medical Pre-screening",
    listTitle: "Wearable Pre-screening",
    tagline: "Flagging who may need a check-up from consumer-device signals",
    period: "2026–present",
    problem:
      "Many people only learn they needed a clinical check-up after the fact, while others pay for check-ups they didn't need.\n\nConsumer wearables already record heart rate and related signals every day, which could help decide who should be seen first.",
    approach:
      "This is ongoing. I'm reviewing what published work reports for heart-rate and HRV tasks on public wearable datasets, and how far those numbers can be trusted, so that my own models have honest baselines to beat.\n\nIn parallel I'm designing an explainable decision layer for multimodal sensor evidence. Code works out the findings and a cautious suggestion (refer, don't refer, or repeat the scan), and a language model only words them.\n\nIt is a triage aid, never a diagnosis.",
  },
];

const PROJECTS: ProjectEntry[] = [
  {
    id: "sentence-embeddings",
    title: "Multilingual Sentence Embeddings",
    listTitle: "Multilingual Embeddings",
    tagline: "Evaluating embedding models across languages",
    period: "2026–present",
    problem:
      "Sentence embedding models are trained and judged mostly on high-resource languages, so it's unclear how well they hold up across a diverse set of languages.",
    approach:
      "A research internship at IIT Ropar, advised by Dr. Loitongbam Gyanendro Singh.\n\nI'm analysing models that embed several languages, and implementing NLP algorithms that evaluate embedding performance across diverse linguistic datasets.",
  },
];

export const ResearchSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = [...CURRENT, ...PROJECTS].find((p) => p.id === selectedId) ?? null;

  // Lets the shared backdrop know whether this section is open.
  useReportSelection("research", selectedId !== null);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
      {/* Left: project list */}
      <nav
        aria-label="Research projects"
        className="lg:border-r lg:border-border lg:pr-10"
      >
        <ul className="flex flex-col">
          {PROJECTS.map((project) => (
            <li key={project.id}>
              <ProjectRow
                entry={project}
                isActive={project.id === selectedId}
                onToggle={() =>
                  setSelectedId((current) =>
                    current === project.id ? null : project.id,
                  )
                }
              />
            </li>
          ))}
          {/* Ongoing work: a separate group, set apart from the finished
              projects above rather than listed with them. */}
          <li className="mt-10">
            <p className="px-2 pb-2 font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Currently working on
            </p>
            <ul className="flex flex-col">
              {CURRENT.map((project) => (
                <li key={project.id}>
                  <ProjectRow
                    entry={project}
                    isActive={project.id === selectedId}
                    onToggle={() =>
                      setSelectedId((current) =>
                        current === project.id ? null : project.id,
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>

      {/* Right: detail pane for the selected project, or an idle prompt
          when nothing's picked yet. */}
      <ProjectDetail entry={selected} />
    </div>
  );
};
