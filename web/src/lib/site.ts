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
  // Taken from Aravind's own resume header, not guessed.
  linkedin: "https://linkedin.com/in/aravindakrishnan-v-2b0651218",
  openToWork: true,
  availability: "open to work",
  /**
   * Committed at web/public/resume.pdf — public and permanent, so it is a redacted build:
   * the personal phone number is removed from the header and nothing else is changed.
   * Rebuild instructions are in SPEC.md. Verify on `pdftotext` output, not on a grep of
   * the PDF binary: Chrome subsets fonts, so a literal search passes even when the number
   * is still rendered on the page.
   */
  resume: "/resume.pdf",
  description:
    "Cloud engineer with experience in AWS operations, Linux, networking, Terraform, containers and CI/CD.",
} as const;

/**
 * Prefix a site-root path with Astro's configured base. Never hardcode a leading-slash URL
 * in a template.
 *
 * Page links are extensionless (`/about`). Astro still emits `about.html`, and the
 * viewer-request CloudFront Function in `edge/clean-urls.js` maps the clean path to that
 * object. File paths (`/resume.pdf`, `/feed.xml`) pass through unchanged.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${clean}` : clean;
}

/** The public, extensionless path for a built page path such as `/about.html`. */
export function cleanPath(pathname: string): string {
  if (pathname === "/index.html") return "/";
  if (pathname.endsWith("/index.html")) return pathname.slice(0, -"index.html".length);
  return pathname.endsWith(".html") ? pathname.slice(0, -".html".length) : pathname;
}
