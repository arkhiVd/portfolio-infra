/**
 * Single source of truth for site-wide facts and switches.
 *
 * `openToWork` is a one-line change: flip it to false the day it stops being true.
 * A stale "open to work" indicator is worse than none.
 */
export const site = {
  name: "Aravindakrishnan V",
  role: "Cloud engineer",
  domain: "www.aravindakrishnan.cloud",
  email: "aravindakrishnanv@tutamail.com",
  github: "https://github.com/arkhiVd",
  // Taken from Aravind's own resume.tex, not guessed.
  linkedin: "https://linkedin.com/in/aravindakrishnan-v-2b0651218",
  openToWork: true,
  /**
   * Committed at web/public/resume.pdf — public and permanent, so it is a redacted build:
   * the personal phone number is removed from the header and nothing else is changed.
   * Rebuild instructions are in SPEC.md; verify the phone is absent from the PDF binary
   * before replacing this file.
   */
  resume: "/resume.pdf",
  description:
    "Cloud engineer working across AWS, Terraform, containers and CI/CD. Selected infrastructure work, with the decisions and failures behind it.",
} as const;

/**
 * Prefix a site-root path with Astro's configured base ("/preview" now, "/" after the
 * Phase 8 cutover). Never hardcode a leading-slash URL in a template — it 404s under the
 * preview prefix and silently changes meaning at cutover.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}` || "/";
}
