"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ProjectRow,
  ProjectDetail,
  type ProjectEntry,
} from "@/components/sections/project-entry";
import {
  WEBSITES,
  WebsiteShowcaseDetail,
} from "@/components/sections/website-showcase";
import { useReportSelection } from "@/components/ui/selection-context";
// Loaded only when its project is opened.
const SubspaceRig = dynamic(() => import("@/components/figures/subspace-rig/rig").then((m) => m.SubspaceRig), {
  ssr: false,
  loading: () => <div className="aspect-[8/5] w-full" />,
});

const ScanRig = dynamic(() => import("@/components/figures/aura-screen/scan").then((m) => m.ScanRig), {
  ssr: false,
  loading: () => <div className="aspect-[8/5] w-full" />,
});

const COURSE_PROJECTS: ProjectEntry[] = [
  {
    id: "whispr-hallucinations",
    figure: SubspaceRig,
    title: "Reducing Hallucinated Transcripts in Whisper via Hallucination Space Projection",
    listTitle: "Whisper Hallucinations",
    tagline: "Training-free fix for Whisper inventing text on non-speech audio",
    period: "2026",
    problem:
      "Whisper's decoder can produce fluent but invented text, like \"thank you\" or \"thanks for watching\", when a clip has no speech at all. The right transcript there is empty, so any output is a hallucination.\n\nThe question is how much a fix reduces this, and what it costs on real speech.",
    approach:
      "A course project re-implementing hallucination space projection (Abbasihafshejani and Jadliwala, 2026). Whisper is run on non-speech clips, and its decoder hidden states are split into those that hallucinate and those that stay correctly empty. An SVD of their difference gives a small subspace.\n\nAt inference the hidden state is pushed out of that subspace, which raises Whisper's own no-speech probability so its standard threshold rejects the output. It needs no retraining, voice activity detector or phrase list.\n\nI'm tracking the hallucination rate on non-speech audio, the word error rate on LibriSpeech, and how often real speech is wrongly rejected, and comparing an always-on version with a gated one that only acts when the no-speech probability is already high. Calibration uses ESC-50, and evaluation also uses UrbanSound8K and FSD50K.\n\nBeyond reproducing the paper, I'm adding a gate-only ablation, confidence intervals and a sensitivity check on the learned subspace.",
    links: [
      { label: "Paper", href: "https://arxiv.org/abs/2609.04561" },
      { label: "Code", href: "https://github.com/h4444n55555/Reducing-Hallucinations-in-Whispr" },
    ],
  },
  {
    id: "aura-screen",
    figure: ScanRig,
    title: "Aura Screen",
    tagline: "Contactless health screening app, with Himanshu",
    period: "2026",
    problem:
      "An HCI course project, built with Himanshu: a patient-facing way to get a quick health check without touching a device or reading a chart.",
    approach:
      "A kiosk camera estimates pulse from the face, and a thermal camera reads skin temperature. Patients start a scan by scanning a QR code on their phone.\n\nThey get plain-language results with step-by-step explanations, a timeline of past sessions, and a way to share reports with their doctor through a separate portal.\n\nIt's built with React and Vite on the front end, Express and MongoDB on the back end, and Python for the signal analysis, and it was shaped by user testing across the HCI labs.",
    links: [{ label: "Code", href: "https://github.com/hima1323/health-screening" }],
  },
  {
    id: "vln",
    title: "Vision-Language Navigation",
    tagline: "CLIP-based navigation agent in the Habitat Simulator",
    period: "2026",
    problem:
      "AI211 course project: from egocentric images and a language instruction, predict the next action (forward, turn left, turn right or stop) on Matterport3D scenes.",
    approach:
      "Pretrained CLIP ViT-B/16 encoders embed the images and the instruction. A cross-attention layer lets the text query the vision features, and a pooling step and a small MLP turn the result into an action.\n\nThe baseline reaches 70.32% validation accuracy. A lightweight fusion variant reaches 67.64% with 71.7% fewer trainable parameters, and a unified policy covers both ObjectNav and PointNav, scoring 79.49% on PointNav without language.\n\nTwo stress tests were telling: paraphrasing the instructions drops accuracy to 61.24%, and freezing the text encoder drops it to 17.52%.",
    links: [
      { label: "Code", href: "https://github.com/h4444n55555/AI211-Habitat-Lab-Project" },
    ],
  },
  {
    id: "riscv-assembler",
    title: "64-bit RISC-V Assembler",
    tagline: "Two-pass RV64I assembler in C, with Ravikant Sharma",
    period: "2026",
    problem:
      "A CS207 course project, built with Ravikant Sharma: translate RV64I base integer assembly into machine code.",
    approach:
      "A two-pass assembler written in C. The first pass builds the symbol table and resolves labels, and the second encodes each instruction into binary.\n\nIts output mirrors the Venus simulator, which made it easy to check against a known reference.",
  },
  {
    id: "petct-robust-seg",
    title: "PET/CT Segmentation Robustness",
    tagline: "How a two-channel U-Net degrades with worse inputs",
    period: "2026",
    problem:
      "Lesion segmentation models are usually scored on clean scans, but clinical images can be low-resolution, noisy, or missing a modality.\n\nHow much does performance fall, and which channel matters most?",
    approach:
      "I trained one small two-channel (PET and CT) U-Net on clean FDG studies from the public autoPET dataset: 1,014 whole-body studies from 900 patients, split by patient.\n\nI then tested it, without retraining, on lower-resolution images, on added noise and with the PET channel missing, tracking Dice and lesion recall. The aim is to measure robustness, not to propose a new architecture.",
    links: [
      { label: "Code", href: "https://github.com/h4444n55555/petct-robust-seg" },
    ],
  },
  {
    id: "petct-viewer",
    title: "PET/CT Viewer",
    tagline: "Local web viewer for PET/CT studies, with robustness views",
    period: "2026",
    problem:
      "PET/CT studies come as NIfTI volumes, and checking a segmentation model's behaviour on them usually means juggling separate scripts and viewers.\n\nI wanted one tool to browse the scans, see the lesion masks and see how they change when the input gets worse.",
    approach:
      "A web viewer that runs entirely on your own computer, so no patient data is uploaded. It is built for the public autoPET dataset and also reads any PET and CT pair with an optional lesion mask.\n\nIt has axial, coronal and sagittal views, a PET maximum-intensity projection, PET/CT fusion, a lesion-mask overlay, SUV and HU values on hover, a lesion list and dataset overview charts.\n\nIt also applies the robustness perturbations from my segmentation study (lower resolution, added noise and the PET channel removed), so the effect on a scan can be compared side by side.\n\nIt is a Python backend with a single-page HTML front end, and decoded studies are cached so reopening one is instant.",
    links: [
      { label: "Code", href: "https://github.com/h4444n55555/petct-viewer" },
    ],
  },
  {
    id: "mmac-dashboards",
    title: "Multimodal Affective Computing Dashboards",
    listTitle: "Affective Computing Dashboards",
    tagline: "Interactive study hub linking physiological signals to emotion",
    period: "2026",
    problem:
      "IIT Ropar's multimodal affective computing study links brief facial and body signals to emotional and cognitive state. It needed a way for people to understand the signals and to request the data.",
    approach:
      "A Next.js and React site with an interactive dashboard for each of the four signals: thermal skin temperature, ECG, EMG and camera-based rPPG pulse. Each has a plain-language explanation.\n\nUntil the study's own recordings are released, the dashboards show sample data from open datasets. Access to the full dataset goes through a request form and a data use agreement.",
    links: [
      {
        label: "Code",
        href: "https://github.com/h4444n55555/Multimodal-Analysis-Dashboards",
      },
    ],
  },
];

const WEBSITE_IDS = new Set(WEBSITES.map((site) => site.id));

export const ProjectsSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [websitesOpen, setWebsitesOpen] = useState(true);

  const selectedWebsite = WEBSITES.find((w) => w.id === selectedId) ?? null;
  const selectedProject =
    !selectedWebsite && selectedId
      ? (COURSE_PROJECTS.find((p) => p.id === selectedId) ?? null)
      : null;

  // Lets the shared backdrop know whether this section is open.
  useReportSelection("projects", selectedId !== null);

  const toggleSelect = (id: string) =>
    setSelectedId((current) => (current === id ? null : id));

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
      {/* Left: grouped project list */}
      <nav
        aria-label="Other projects"
        className="lg:border-r lg:border-border lg:pr-10"
      >
        <ul className="flex flex-col">
          {/* Websites — collapsible group, header only toggles visibility */}
          <li>
            <button
              type="button"
              onClick={() => setWebsitesOpen((open) => !open)}
              aria-expanded={websitesOpen}
              className="flex w-full items-center gap-2 border-t border-dashed border-border px-2 py-3 text-left transition-colors hover:bg-tint-hover"
            >
              <ChevronRightIcon
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                  websitesOpen && "rotate-90",
                )}
              />
              <span className="font-mono text-xs font-semibold tracking-wide uppercase">
                Websites I Made
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                ({WEBSITES.length})
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-200 ease-in-out"
              style={{ gridTemplateRows: websitesOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-col">
                  {WEBSITES.map((site) => (
                    <li key={site.id}>
                      <button
                        type="button"
                        onClick={() => toggleSelect(site.id)}
                        aria-current={site.id === selectedId}
                        style={{ paddingLeft: "2.25rem" }}
                        className={cn(
                          "flex w-full items-baseline gap-4 border-t border-dashed border-border px-2 py-3 text-left transition-colors",
                          site.id === selectedId
                            ? "bg-tint-active/60"
                            : "hover:bg-tint-hover",
                        )}
                      >
                        <span className="min-w-0 truncate font-mono text-xs font-semibold tracking-wide uppercase">
                          {site.title}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                          {site.description}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {site.period}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>

          {/* Projects — flat, no grouping */}
          {COURSE_PROJECTS.map((project) => (
            <li key={project.id}>
              <ProjectRow
                entry={project}
                isActive={project.id === selectedId}
                onToggle={() => toggleSelect(project.id)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Right: video showcase for a selected website, essay detail for a
          selected startup/course project, or an idle state. */}
      {selectedId && WEBSITE_IDS.has(selectedId) ? (
        <WebsiteShowcaseDetail entry={selectedWebsite} />
      ) : (
        <ProjectDetail
          entry={selectedProject}
          idleLabel="select a project to inspect"
        />
      )}
    </div>
  );
};
