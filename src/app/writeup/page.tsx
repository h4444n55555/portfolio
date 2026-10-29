import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write-up · Hans Nongmaithem",
  description:
    "The detail behind my projects and experience: the small decisions, dead ends and workarounds, and how the projects connect.",
};

const H2 = "mt-14 font-serif text-2xl font-semibold";
const H3 = "mt-8 font-mono text-xs font-semibold uppercase tracking-wide text-black/60";
const P = "mt-4 leading-relaxed text-black/80";
const CODE = "rounded bg-black/5 px-1 py-0.5 font-mono text-[0.85em]";

export default function WriteupPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-black">
      <a href="/" className="font-mono text-xs uppercase tracking-wide text-black/50">
        ← Back
      </a>

      <h1 className="mt-6 font-serif text-4xl font-semibold">Write-up</h1>
      <p className={P}>
        The portfolio shows what I built. This page is the detail behind it: the smaller
        decisions, the dead ends and workarounds that never make it into a project
        description, and how the projects connect to each other. It&apos;s written to sit
        alongside my CV.
      </p>

      <nav className="mt-6 font-mono text-xs uppercase tracking-wide text-black/60">
        <a href="#multimodal" className="underline underline-offset-4">
          Multimodal research
        </a>
      </nav>

      <section id="multimodal">
        <h2 className={H2}>Multimodal research</h2>
        <p className={P}>
          This is the research thread that three projects grew out of: the multimodal
          dashboard, the medical pre-screening work, and Aura Screen. It started with data
          collection, so that&apos;s where this write-up starts too.
        </p>

        <h3 className={H3}>Choosing the modalities</h3>
        <p className={P}>
          I began by picking the sensors and signals I was most interested in: ECG and
          thermal video. For hardware I chose a FLIR C5 thermal camera and a Fourth
          Frontier Frontier X2 chest strap. After reading up on how each modality works, I
          started building a dashboard to run recording sessions and collect the data, and
          that&apos;s where most of the problems showed up.
        </p>

        <h3 className={H3}>ECG: getting at the raw data</h3>
        <p className={P}>
          The raw numerical ECG, which is what I needed, was locked behind an app
          subscription. The only export available without it was the ECG waveform as a PDF.
          Pulling numbers back out of a plotted waveform with computer vision would have
          meant approximating data the device already had exactly, so I looked for another
          way in.
        </p>
        <p className={P}>
          While going through the app and the strap, I noticed it offers a live-stream share
          link that lets anyone watch the ECG in a browser. I wanted to know whether that was
          just video relayed from the app or actual data. Watching the traffic showed it was
          data: the page was receiving packets over a WebSocket and drawing them itself.
        </p>
        <p className={P}>
          So I wrote a Python script that connects the same way and stores what it receives.
          I read the protocol from the web page&apos;s own JavaScript bundle instead of
          guessing: it connects to a <code className={CODE}>wss://</code> endpoint, sends one
          subscribe message for the user ID in the share link, and then receives
          waveform packets. It has worked reliably since.
        </p>

        <h3 className={H3}>What the stream actually contains</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-black/80">
          <li>
            <strong>125 Hz.</strong> One packet per second, each carrying 125 samples.
          </li>
          <li>
            <strong>Every packet arrives about three times.</strong> The server re-sends
            them, so duplicates and out-of-order packets are dropped using the packet number,
            the same way the web page does it. Gaps in the numbering are counted as missed
            data, so each recording has a measure of how complete it is.
          </li>
          <li>
            <strong>Timing comes from the packet number.</strong> The timestamp field is the
            session start and never changes; the packet number counts seconds from it, which
            gives every sample a wall-clock time.
          </li>
          <li>
            <strong>Extra fields.</strong> Packets also carry the device&apos;s own heart
            rate, activity type and some subject metadata, which is useful for cross-checking.
          </li>
          <li>
            <strong>Amplitude units are unlabelled.</strong> The web page multiplies raw
            counts by a fixed constant but never says what unit results. The swing it
            produces matches a normal ECG in millivolts, so the dashboard treats it as mV and
            labels the axis &ldquo;uncalibrated&rdquo;. The untouched raw counts are always
            saved alongside.
          </li>
        </ul>

        <h3 className={H3}>The ECG dashboard</h3>
        <p className={P}>
          The dashboard is a Streamlit app: paste the share link, press start, and it
          captures on a background thread while showing a live 10-second strip, heart rate,
          packet health and signal-quality indicators. After a recording it offers a
          scrollable waveform view (raw against filtered, with detected R-peaks), heart-rate
          variability, average beat shape, and export of the samples, raw packets and the
          processing settings used. A separate command-line version records long sessions
          without a browser.
        </p>
        <p className={P}>
          R-peaks are found with a Pan-Tompkins pipeline (band-pass, derivative, squaring,
          moving-window integration), with zero-phase filtering so peak timing isn&apos;t
          shifted. Implausible or ectopic-looking beat intervals are flagged and left out of
          the variability metrics but still shown. I checked it two ways: on a synthetic ECG
          with known beat times it found 216 of 216 beats, and on a real 150-second capture
          its heart-rate range (56.4 to 91.5 bpm) matched the strap&apos;s own reported range
          (55 to 90 bpm).
        </p>

        <h3 className={H3}>Thermal: the harder problem</h3>
        <p className={P}>
          The thermal camera was harder. Radiometric data, meaning an actual temperature for
          every pixel rather than a colour picture of heat, is what a research-grade FLIR
          camera records. Mine isn&apos;t one, and getting raw radiometric video out of it
          looked like it would need jailbreaking both the app and the camera, which I wasn&apos;t
          willing to do.
        </p>
        <p className={P}>
          What the C5 does give you is radiometric data embedded in still photos. Each photo
          is a normal-looking JPEG with a 16-bit thermal image and the camera&apos;s
          calibration constants hidden inside it. I wrote an extractor that turns each photo
          into a per-pixel temperature array plus a metadata record, and built a dashboard
          around it with a capture checklist and warm-up timer, a subject and session log
          (skin type, ambient temperature, distance and so on), and quality flags for things
          like glasses, facial hair or hair over the forehead so bad regions can be filtered
          out later.
        </p>
        <p className={P}>
          Stills alone weren&apos;t enough, because I wanted video. The camera has no
          intervalometer, so it can&apos;t take photos continuously, and I confirmed over USB
          that the live video stream is only the 8-bit colourised image, with no radiometric
          format offered.
        </p>
        <p className={P}>
          So the decision was to record the thermal video anyway, without the radiometric
          data, and use machine learning to get the temperatures back: train a model on the
          radiometric photos so that it can estimate the per-pixel temperature of each frame
          of the video and store it.
        </p>
      </section>

      <p className="mt-16 border-t border-black/10 pt-6 font-mono text-xs text-black/40">
        More sections on the way.
      </p>
    </main>
  );
}
