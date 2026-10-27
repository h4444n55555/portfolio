import { Hero } from "@/components/sections/hero";
import { SiteDock } from "@/components/nav/site-dock";
import { SiteLoader } from "@/components/sections/site-loader";
import { PaperSection } from "@/components/sections/paper-section";
import { ResearchSection } from "@/components/sections/research-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { AboutSection } from "@/components/sections/about-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { NeuronBackdrop } from "@/components/ui/neuron-backdrop";
import { SelectionProvider } from "@/components/ui/selection-context";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteLoader />

      <main>
        {/* The door: opaque and stacked above the footer, so it slides up
            over the top of it on scroll instead of scrolling with it. */}
        <div className="relative z-10 bg-background">
          <div id="home">
            <Hero />
          </div>

          {/* Research and Projects share one backdrop, so they are wrapped
              together and the artwork spans the pair rather than repeating
              per section. The sections keep their own transparent grounds so
              the neuron shows through both. */}
          <SelectionProvider>
            <div className="relative isolate">
              <NeuronBackdrop sectionIds={["research", "skills"]} />

              <PaperSection
                id="research"
                index="I."
                title="Research"
                className="relative z-10"
              >
                <ResearchSection />
              </PaperSection>

              <PaperSection
                id="skills"
                index="II."
                title="Other Projects"
                className="relative z-10"
              >
                <ProjectsSection />
              </PaperSection>
            </div>
          </SelectionProvider>

          <PaperSection id="about" index="III." title="About">
            <AboutSection />
          </PaperSection>
        </div>

        <SiteFooter />
      </main>

      <SiteDock />
    </div>
  );
}
