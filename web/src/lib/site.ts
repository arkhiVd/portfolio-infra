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
   * Empty until the PDF is cleared for publication. Two things block it:
   * the committed PDF is public and permanent in a public repo, and the current
   * ~/Documents/resume/resume.pdf carries a personal phone number; and it is stale —
   * resume.tex is newer than the built PDF and there is no LaTeX toolchain on this
   * machine to rebuild it. The download CTA is hidden while this is empty.
   */
  resume: "",
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
