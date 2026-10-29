import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write-up · Hans Nongmaithem",
  description: "Detailed write-up of personal, smaller projects.",
};

export default function WriteupPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-black">
      <a href="/" className="font-mono text-xs uppercase tracking-wide text-black/50">
        ← Back
      </a>
      <h1 className="mt-6 font-serif text-3xl font-semibold">Personal projects, in detail</h1>
      <p className="mt-4 text-black/70">Write-up coming soon.</p>
    </main>
  );
}
