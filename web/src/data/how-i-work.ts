export type WorkflowStage = {
  id: string;
  label: string;
  question: string;
  artifact: string;
  owner: string;
};

export const workflowStages: WorkflowStage[] = [
  { id: "understand", label: "Understand", question: "What is true now?", artifact: "code · behavior · constraints", owner: "human + agent" },
  { id: "decide", label: "Decide", question: "Which direction survives the tradeoffs?", artifact: "decision · rationale", owner: "human" },
  { id: "specify", label: "Specify", question: "What may change, and what proves success?", artifact: "SPEC · acceptance · boundary", owner: "agent drafts · human approves" },
  { id: "slice", label: "Slice", question: "What can one worker own cleanly?", artifact: "tasks · dependencies · owners", owner: "human approves" },
  { id: "implement", label: "Implement", question: "Can this bounded slice satisfy the contract?", artifact: "branch · worktree · diff", owner: "agent works" },
  { id: "validate", label: "Validate", question: "What external evidence supports the claim?", artifact: "tests · plan · render", owner: "agent gathers · human judges" },
  { id: "review", label: "Review", question: "What did the implementer miss?", artifact: "fresh findings", owner: "independent reviewer" },
  { id: "record", label: "Record", question: "What must outlive the session?", artifact: "Git · docs · durable notes", owner: "human confirms" },
];

export const changeClasses = [
  { key: "trivial", label: "Trivial", posture: "compress the gates", examples: "Documentation or harmless presentation changes.", planning: "A short brief can be enough when scope is obvious.", proof: "Focused command or rendered/manual check." },
  { key: "standard", label: "Standard", posture: "make ownership explicit", examples: "Features, refactors and ordinary bug fixes.", planning: "Specify acceptance, slice the work and name the owner.", proof: "Focused checks plus complete diff review." },
  { key: "risky", label: "Risky", posture: "slow the authority boundary", examples: "Permissions, secrets, networking, data stores, deployment, deletion or cost-bearing resources.", planning: "Make decisions and safety boundaries explicit before editing.", proof: "Full relevant gate, independent review and human authorization." },
] as const;

export const workerBrief = [
  ["Goal", "Implement the responsive agent-plane section for the How I Work page."],
  ["Scope", "May change the assigned How Work component and page stylesheet only; do not alter Base, global tokens or unrelated reference pages."],
  ["Context", "Read DESIGN.md, the page content contract, current source and the agent-plane diagram contract."],
  ["Acceptance", "The diagram communicates contract → execution → evidence → human authority at desktop and phone widths."],
  ["Verify", "Run the real repository checks/build; inspect 1280px and 375px renders, keyboard flow, no-JS behavior and horizontal overflow."],
  ["Constraints", "No new client runtime, no remote assets, no invented private infrastructure details, no merge/deploy action."],
  ["Report", "Return changed paths, commit/diff, commands + results, skipped checks, deviations and blockers."],
  ["Owner", "One worker/worktree; a fresh reviewer reads the complete diff after integration."],
] as const;

export const routingTiers = [
  { tier: "Fast", fit: "Bounded, low-risk work", work: "inventory · link checks · mechanical edits · narrow research", evidence: "command output or cited paths" },
  { tier: "Standard", fit: "Implementation + analysis", work: "scoped feature · focused bug fix · contract update · test review", evidence: "focused checks + complete diff" },
  { tier: "Deep review", fit: "High judgment or high risk", work: "architecture · security boundary · complex review · incident/conflicting evidence", evidence: "design rationale + independent review + full relevant gate" },
] as const;

export const operatingRules = [
  ["git is the contract", "A fresh session should recover the project from repository state, not from an old conversation."],
  ["one writer per boundary", "If two workers need the same file, I rescope or serialize instead of racing edits."],
  ["reports are not proof", "Completion points to a diff, command output, plan, rendered result, or documented manual check."],
  ["authority stays human", "Architecture, risky scope changes, merge, apply and deployment remain explicit human gates."],
] as const;

export const ownershipLanes = [
  { key: "coordinator", title: "Coordinator", mode: "control", badge: "state owner", output: "work state + integration order", steps: ["loads the contract", "splits non-overlapping work", "tracks dependency order", "revalidates the combined result"] },
  { key: "audit", title: "Audit / research", mode: "read", badge: "read-only", output: "findings + cited evidence", steps: ["maps current behavior", "collects evidence", "finds hidden coupling", "returns findings without competing edits"] },
  { key: "implementation", title: "Implementation", mode: "write", badge: "exclusive writer", output: "bounded diff + focused checks", steps: ["owns named paths/worktree", "writes one bounded slice", "runs focused checks", "hands back diff + evidence"] },
  { key: "review", title: "Fresh reviewer", mode: "review", badge: "new context", output: "findings, never merge authority", steps: ["starts with new context", "reads contract + full diff", "challenges skipped evidence", "recommends; does not merge"] },
] as const;

export const evidenceRows = [
  { system: "terraform", kind: "machine + human read", checks: "fmt · validate · plan · scan", inspect: "I read the actual plan for add/change/destroy/replace behavior before an apply can exist.", links: [
    { label: "plan workflow", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/.github/workflows/plan.yml" },
    { label: "apply boundary", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/.github/workflows/apply.yml" },
  ] },
  { system: "frontend", kind: "machine + rendered", checks: "lint · build · 375/1280 render", inspect: "I inspect keyboard flow, no-JS behavior, overflow, accessibility and whether the rendered page still matches the design contract.", links: [
    { label: "design contract", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/DESIGN.md" },
    { label: "web tests", href: "https://github.com/arkhiVd/portfolio-infra/tree/main/web/tests" },
  ] },
  { system: "automation", kind: "machine evidence", checks: "tests · fixtures · deterministic output", inspect: "The result must be rerunnable outside the agent session; a narration of what supposedly happened is not enough.", links: [
    { label: "evidence rule", href: "https://github.com/arkhiVd/agent-workbench/blob/main/README.md" },
  ] },
  { system: "documentation", kind: "source + publication", checks: "source diff · links · publication review", inspect: "I check provenance, private/public boundaries and whether source and rendered output say the same thing.", links: [
    { label: "public boundary", href: "https://github.com/arkhiVd/homelab-atlas/blob/main/SPEC.md" },
  ] },
  { system: "integration", kind: "combined-state proof", checks: "combined diff · full gate", inspect: "A clean merge only proves Git found no textual conflict. I re-run evidence after branches or worktrees are reconciled.", links: [
    { label: "worktree rules", href: "https://github.com/arkhiVd/agent-workbench/blob/main/coordination/ownership-and-worktrees.md" },
  ] },
] as const;

export const skills = [
  {
    key: "align",
    title: "Align before editing",
    trigger: "The request is underspecified, subjective, or likely to reopen product decisions during implementation.",
    practice: "I turn fuzzy intent into questions, acceptance criteria, non-goals and a durable spec before asking an agent to write code.",
    why: "The cheapest bug is the one removed before implementation starts.",
    influence: "Matt Pocock · composable grilling / clarification skills",
    href: "https://github.com/mattpocock/skills",
  },
  {
    key: "understand",
    title: "Explain the system first",
    trigger: "A change crosses files, services or an ownership boundary I do not fully understand yet.",
    practice: "Read the code and trace the runtime/data flow before critique. Produce a compact mental model, then decide where the change belongs.",
    why: "Agents are good at plausible edits; architecture context is what prevents a plausible edit from landing in the wrong layer.",
    influence: "pstack · /how, /why and architecture-first exploration",
    href: "https://github.com/cursor/plugins/tree/main/pstack",
  },
  {
    key: "slice",
    title: "Slice by ownership",
    trigger: "A task is large enough to benefit from parallel work.",
    practice: "Split by paths, worktrees and dependency boundaries. One writer owns a file at a time; shared integration has a named owner.",
    why: "Parallel agents are only useful when coordination cost stays below the work they save.",
    influence: "My Agent Workbench · ownership/worktree contract",
    href: "https://github.com/arkhiVd/agent-workbench/blob/main/coordination/ownership-and-worktrees.md",
  },
  {
    key: "diagnose",
    title: "Diagnose, then change",
    trigger: "A bug, failed check or unexpected behavior does not have an obvious single cause.",
    practice: "Reproduce, narrow the failure, inspect the relevant boundary and prefer the smallest causal fix over speculative refactoring.",
    why: "A faster edit is not useful if it only hides the symptom.",
    influence: "Matt Pocock · diagnosis / engineering skills",
    href: "https://github.com/mattpocock/skills",
  },
  {
    key: "verify",
    title: "Prove behavior outside the chat",
    trigger: "Any implementation claims to be complete.",
    practice: "Require command output, tests, plans, rendered behavior or documented manual checks. Re-run the gate after integration.",
    why: "An agent report is an assertion. Evidence is something another reviewer can independently inspect.",
    influence: "pstack · verification-first posture + my evidence rule",
    href: "https://github.com/cursor/plugins/tree/main/pstack",
  },
  {
    key: "write",
    title: "Edit the prose like code",
    trigger: "Documentation, PR text or portfolio copy sounds generic, inflated or model-shaped.",
    practice: "Remove filler, name the actual tradeoff, keep claims sourceable and do a final human pass for language I would genuinely use.",
    why: "Clear writing exposes unclear thinking; polished vagueness hides it.",
    influence: "pstack · /unslop + technical-writing",
    href: "https://github.com/cursor/plugins/tree/main/pstack",
  },
] as const;

export const tools = [
  { icon: "pi", name: "Pi", category: "agent interface", role: "Default bounded coding session", when: "One scoped task needs inspect → edit → verify without a large orchestration layer.", why: "The terminal surface is small and the repository contract stays visible.", boundary: "The session can propose and edit; it does not own architecture, merge or release authority.", proof: "diff · checks · handoff", source: "Workbench", href: "https://github.com/arkhiVd/agent-workbench" },
  { icon: "herdr", name: "Herdr", category: "coordination", role: "Independent work coordination", when: "Several tasks are truly independent and each can own an exclusive worktree/path boundary.", why: "It makes workspace ownership, state, blockers and handoffs visible without turning chat into project state.", boundary: "I do not start a standing swarm for ordinary work, and Herdr never outranks Git.", proof: "worktrees · statuses · integration", source: "coordination", href: "https://github.com/arkhiVd/agent-workbench/blob/main/coordination/herdr-coordination.md" },
  { icon: "providers", name: "Codex + Claude", category: "model routes", role: "Replaceable execution and review routes", when: "The task needs a coding/reasoning route or an independent second model family for review.", why: "Different routes are useful for different kinds of work; the contract and verification stay portable.", boundary: "I route by risk and reasoning load, not by a permanent model leaderboard.", proof: "independent evidence · fresh review", source: "routing policy", href: "https://github.com/arkhiVd/agent-workbench/blob/main/coordination/model-routing.md" },
  { icon: "github", name: "Git + GitHub", category: "project state", role: "Durable contract and review surface", when: "Always: requirements, current state, ownership, diffs and review need to survive any individual session.", why: "Branches and worktrees make ownership physical; the full diff is inspectable by humans and fresh agents.", boundary: "A pane label, transcript or local memory never outranks repository state.", proof: "commit · diff · PR/CI", source: "ownership", href: "https://github.com/arkhiVd/agent-workbench/blob/main/coordination/ownership-and-worktrees.md" },
  { icon: "terraform", name: "Terraform + AWS", category: "infrastructure", role: "Inspectable infrastructure changes", when: "Public cloud resources or delivery infrastructure change.", why: "The intended change can be inspected as code and again as a plan before there is an apply.", boundary: "Agents may author and inspect; human approval separates plan from merge/apply.", proof: "fmt · validate · plan · CI", source: "plan workflow", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/.github/workflows/plan.yml" },
  { icon: "obsidian-mcp", name: "Obsidian + MCP", category: "knowledge", role: "Private durable context through narrow contracts", when: "Cross-project research or learning is useful but should not be copied into every repository.", why: "It separates private durable knowledge from public project truth while still allowing selected retrieval.", boundary: "Access is allow-listed; private notes are never silent project authority or an implicit publication source.", proof: "explicit reads/writes · audit", source: "Atlas AI plane", href: "https://github.com/arkhiVd/homelab-atlas/blob/main/src/08-ai-plane.mmd" },
  { icon: "docker", name: "Remote homelab sandbox", category: "execution host", role: "Long-running isolated agent workspace", when: "Agent work needs to keep running independently of my laptop, or I want a private preview I can reach from trusted devices without exposing a dev server publicly.", why: "The remote homelab keeps longer sessions, containers and parallel worktrees running in a separate environment, and I can review browser-visible work over Tailscale from my laptop or phone.", boundary: "The host is only an execution surface. Tailscale provides private reachability, not extra authority: scoped credentials, repository contracts, worktree ownership and human merge/apply/deploy gates still apply.", proof: "worktree · process/logs · container boundary · Tailscale preview · diff + checks", source: "Homelab Atlas", href: "https://github.com/arkhiVd/homelab-atlas" },
  { icon: "browser", name: "Headless browser QA", category: "rendered evidence", role: "Browser-visible verification outside the agent report", when: "A UI, reference page or browser-facing change needs proof beyond source review and a successful build.", why: "Rendered checks catch responsive layout, overflow, console, focus and interaction failures that are easy to miss in code review.", boundary: "Automation gathers evidence; it does not replace human visual judgment for meaningful design changes, and it never turns a preview into release authority.", proof: "desktop/mobile render · console · keyboard · a11y · screenshots", source: "static-site review", href: "https://github.com/arkhiVd/portfolio-infra/tree/main/web/public/skills/static-site-review" },
] as const;

export const failureModes = [
  ["context drift", "Repository contracts + fresh review; the old chat is not required to continue."],
  ["overlapping writers", "Exclusive file/worktree ownership; serialize when ownership cannot be split."],
  ["agent says “done”", "Ask for the current diff and external evidence behind each completion claim."],
  ["model overkill", "Start with the cheapest route that can answer the question; escalate on risk/evidence."],
  ["generic frontend", "Write a visual contract, use real content early, then review the rendered page."],
  ["self-review", "Important changes get a fresh reviewer without the implementer’s conversation history."],
  ["unsafe infra authority", "Planning and applying remain different capabilities; destructive gates stay human."],
  ["private → public leakage", "Explicit publication boundary, sanitized diagrams and source/output review."],
] as const;

export const walkthrough = [
  { stage: "Inspect", detail: "Read the existing How I Work page, DESIGN.md, the Homelab Atlas visual grammar and the Agent Workbench contracts before touching UI.", evidence: "design contract", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/DESIGN.md" },
  { stage: "Decide", detail: "Treat the page as an operating reference: decisions, ownership, evidence and authority first; tools and models remain supporting detail.", evidence: "main flow", href: "https://github.com/arkhiVd/agent-workbench/blob/main/kb/main-flow.md" },
  { stage: "Specify", detail: "Record the content hierarchy, responsive diagram rules, public/private boundary and acceptance criteria before implementation.", evidence: "reference source", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/web/src/content/reference/how-i-work.md" },
  { stage: "Slice", detail: "Separate page integration, architecture panels, structured data and visual validation so each change has an explicit ownership surface.", evidence: "ownership rules", href: "https://github.com/arkhiVd/agent-workbench/blob/main/coordination/ownership-and-worktrees.md" },
  { stage: "Implement", detail: "Render through the existing content-driven reference route and shared site layout, so the page inherits the real nav, footer, design tokens and Ocean background instead of recreating them.", evidence: "reference route", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/web/src/pages/%5Breference%5D.astro" },
  { stage: "Validate", detail: "Run the repository gate and inspect actual browser output at desktop and phone widths. Check keyboard focus, reduced motion, no-JS readability, links, icon loads, console errors and overflow.", evidence: "web tests", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/web/tests/content.test.mjs" },
  { stage: "Review", detail: "Give a fresh reviewer the contract, complete diff and evidence. The reviewer recommends; the implementer does not grade its own work.", evidence: "review model", href: "https://github.com/arkhiVd/agent-workbench/blob/main/coordination/model-routing.md" },
  { stage: "Release gate", detail: "Human approval is the boundary. Only reviewed repository state may proceed into the existing CI/OIDC path; this workflow deliberately stops before merge/apply/deploy unless I authorize it.", evidence: "apply boundary", href: "https://github.com/arkhiVd/portfolio-infra/blob/main/.github/workflows/apply.yml" },
] as const;

export const influences = [
  {
    title: "Matt Pocock — Skills for Real Engineers",
    href: "https://github.com/mattpocock/skills",
    idea: "Small, composable skills that improve how an engineer and agent clarify, diagnose and implement without handing the whole process to a framework.",
    adaptation: "I keep that composability, but make Git-held contracts, evidence gates and human release authority the stable layer around whichever skills/models I use.",
  },
  {
    title: "pstack — Lauren Tan / poteto",
    href: "https://github.com/cursor/plugins/tree/main/pstack",
    idea: "Go deep before going fast: understand the system, route work deliberately, verify behavior and clean up model-shaped prose instead of optimizing for raw output.",
    adaptation: "I use those ideas selectively inside my own Workbench: independent ownership for parallel work, explicit verification, fresh review and portable model routing.",
  },
] as const;

export const sources = [
  { label: "workflow source", title: "Agent Workbench", href: "https://github.com/arkhiVd/agent-workbench", detail: "gates · ownership/worktrees · worker briefs · model routing · evidence" },
  { label: "architecture source", title: "Homelab Atlas", href: "https://github.com/arkhiVd/homelab-atlas", detail: "diagram-first architecture · data flows · original agent-plane icons · sanitized boundaries" },
  { label: "delivery source", title: "Portfolio Infra", href: "https://github.com/arkhiVd/portfolio-infra", detail: "design contract · static delivery · Terraform · GitHub Actions/OIDC" },
  { label: "influence", title: "Matt Pocock / skills", href: "https://github.com/mattpocock/skills", detail: "composable engineering skills · clarification · diagnosis · human control" },
  { label: "influence", title: "pstack / poteto", href: "https://github.com/cursor/plugins/tree/main/pstack", detail: "understand first · deliberate routing · verification · technical-writing / unslop" },
] as const;
