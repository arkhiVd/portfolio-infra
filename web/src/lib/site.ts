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
  availability: "open to work",
  /**
   * Committed at web/public/resume.pdf — public and permanent, so it is a redacted build:
   * the personal phone number is removed from the header and nothing else is changed.
   * Rebuild instructions are in SPEC.md; verify the phone is absent from the PDF binary
   * before replacing this file.
   */
  resume: "/resume.pdf",
  description:
    "Cloud engineer with experience in AWS operations, Linux, networking, Terraform, containers and CI/CD.",
} as const;

/**
 * Prefix a site-root path with Astro's configured base ("/preview" now, "/" after the
 * Phase 8 cutover). Never hardcode a leading-slash URL in a template — it 404s under the
 * preview prefix and silently changes meaning at cutover.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;

  // CloudFront serves a private S3 origin, not S3 website hosting. It resolves only the
  // distribution root to index.html; extensionless subpaths have no rewrite and return 403.
  if (clean === "/") return base ? `${base}/index.html` : "/";

  const segment = clean.slice(clean.lastIndexOf("/") + 1);
  const objectPath = segment.includes(".") ? clean : `${clean}.html`;
  return `${base}${objectPath}`;
}
