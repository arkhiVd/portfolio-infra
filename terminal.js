/* ============================================================
   Interactive terminal engine + content
   ============================================================ */
(function () {
  const USER = "aravind";
  const HOST = "cloud";
  const PROMPT = `<span class="user">${USER}</span><span class="dim">@</span><span class="host">${HOST}</span><span class="dim">:</span><span class="green">~</span><span class="dim">$</span>`;

  // ---------- content ----------
  const PROJECTS = [
    { id: "portfolio",  name: "Cloud-Native Portfolio", status: "live",
      stack: "AWS · Terraform · Lambda · GitHub Actions",
      blurb: "Serverless site on S3 + CloudFront, custom domain, Python/Lambda visitor counter on DynamoDB. Fully IaC, CI/CD via GitHub Actions + OIDC." },
    { id: "cicd",       name: "CI/CD for AWS Containers", status: "live",
      stack: "ECS Fargate · App Runner · Docker · Terraform",
      blurb: "Two automated pipelines deploying a containerized app: one to ECS Fargate behind an ALB, one fully serverless on App Runner. Keyless OIDC auth." },
    { id: "homelab",    name: "Self-Hosted Homelab", status: "live",
      stack: "Arch Linux · Docker · CouchDB · iptables",
      blurb: "End-to-end encrypted real-time sync service on a headless Arch box. Containerized CouchDB, hardened at the network layer." },
    { id: "netauto",    name: "Network Automation Scripts", status: "wip",
      stack: "Python · Netmiko · GNS3 · Git",
      blurb: "Python + Netmiko scripts automating config backups for network devices in a simulated GNS3 lab, versioned in Git." },
  ];

  const SKILLS = {
    "cloud / infra": ["AWS", "Terraform", "Docker", "CloudFront", "Lambda", "DynamoDB"],
    "languages":     ["Python", "Bash", "SQL", "JavaScript"],
    "platforms":     ["Linux", "Git", "GitHub Actions", "Kubernetes"],
    "focus":         ["IaC", "DevOps", "CI/CD", "Networking"],
  };

  const ABOUT = `Cloud Engineer at Centilytics. I build scalable infrastructure
and automate the boring parts — IaC, pipelines, and the plumbing
that lets things ship without drama. ECE grad, homelab tinkerer,
AWS SAA + CCNA certified.`;

  const HELP = [
    ["help",     "show this list of commands"],
    ["whoami",   "who is this guy"],
    ["about",    "the short version"],
    ["skills",   "tech stack & focus areas"],
    ["projects", "list projects (alias: ls)"],
    ["open <id>","open a project's repo"],
    ["neofetch", "system info, the classic flex"],
    ["contact",  "how to reach me"],
    ["resume",   "where to find the long form"],
    ["clear",    "clear the screen"],
  ];

  // ---------- engine ----------
  let body, inputRow, input, history = [], hIdx = -1;

  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function scroll(){ body.scrollTop = body.scrollHeight; }

  function printPromptLine(cmd) {
    const div = document.createElement("div");
    div.className = "term-line";
    div.innerHTML = `${PROMPT} <span class="cmd">${esc(cmd)}</span>`;
    body.insertBefore(div, inputRow);
  }
  function out(html) {
    const div = document.createElement("div");
    div.className = "term-out";
    div.innerHTML = html;
    body.insertBefore(div, inputRow);
  }

  const commands = {
    help() {
      out(
        `<span class="muted">available commands</span><br>` +
        HELP.map(([c, d]) => `  <span class="k">${c.padEnd(11)}</span> <span class="muted">${d}</span>`).join("<br>")
      );
    },
    whoami() {
      out(`<span class="v">Aravindakrishnan V</span> — Cloud Engineer.<br><span class="muted">building scalable infra · automating solutions · ${SKILLS["cloud / infra"].slice(0,3).join(", ")} & more</span>`);
    },
    about() { out(ABOUT.split("\n").map(esc).join("<br>")); },
    skills() {
      let s = "";
      for (const [k, list] of Object.entries(SKILLS)) {
        s += `<span class="k">${k.padEnd(14)}</span> ${list.map(x=>`<span class="v">${x}</span>`).join(`<span class="muted"> · </span>`)}<br>`;
      }
      out(s);
    },
    stack() { commands.skills(); },
    ls() { commands.projects(); },
    projects() {
      let s = `<span class="muted">${PROJECTS.length} projects — type</span> <span class="k">open &lt;id&gt;</span> <span class="muted">to visit a repo</span><br>`;
      s += PROJECTS.map(p => {
        const dot = p.status === "live" ? `<span class="k">●</span>` : `<span style="color:var(--amber)">◐</span>`;
        return `  ${dot} <span class="v">${p.id.padEnd(11)}</span> <span class="muted">${p.name}</span>`;
      }).join("<br>");
      out(s);
    },
    open(arg) {
      const map = {
        portfolio: "https://github.com/arkhiVd/portfolio-frontend",
        cicd: "https://github.com/arkhiVd/aws-ecs-containerized-webapp",
        homelab: "https://github.com/arkhiVd",
        netauto: "https://github.com/arkhiVd",
      };
      if (!arg) return out(`<span style="color:var(--amber)">usage:</span> open &lt;id&gt; <span class="muted">— try: ${PROJECTS.map(p=>p.id).join(", ")}</span>`);
      if (map[arg]) { out(`opening <a href="${map[arg]}" target="_blank">${arg}</a> …`); window.open(map[arg], "_blank"); }
      else out(`<span style="color:var(--amber)">not found:</span> ${esc(arg)} <span class="muted">— see</span> <span class="k">projects</span>`);
    },
    neofetch() {
      out(`<div class="neofetch">
        <div class="nf-info">
          <span class="title">aravindakrishnan@cloud</span><hr>
          <span class="k">role</span>     <span class="v">Cloud Engineer</span> <span class="muted">· ~1 yr experience</span><br>
          <span class="k">focus</span>    <span class="v">AWS · Terraform · Docker · CI/CD</span><br>
          <span class="k">certs</span>    <span class="cyan">AWS Solutions Architect – Associate</span><br>
                   <span class="cyan">Cisco CCNA</span><br>
          <span class="k">edu</span>      <span class="v">B.Tech ECE · Govt. Model Engineering College</span><br>
          <span class="k">location</span> <span class="v">India · UTC+5:30</span><br>
          <span class="k">status</span>   <span style="color:var(--amber)">serving notice · open to work</span>
          <div class="nf-swatch">
            <i style="background:#05080a"></i><i style="background:#1f7a48"></i>
            <i style="background:#4ef08a"></i><i style="background:#22d3ee"></i>
            <i style="background:#a78bfa"></i><i style="background:#ffb02e"></i>
            <i style="background:#b6c7be"></i><i style="background:#e9f6ee"></i>
          </div>
        </div></div>`);
    },
    contact() {
      out(`<span class="k">email</span>    <a href="mailto:aravindakrishnanv@tutamail.com">aravindakrishnanv@tutamail.com</a><br>` +
          `<span class="k">linkedin</span> <a href="https://www.linkedin.com/in/aravindakrishnan-v-2b0651218" target="_blank">/in/aravindakrishnan-v</a><br>` +
          `<span class="k">github</span>   <a href="https://github.com/arkhiVd" target="_blank">@arkhiVd</a>`);
    },
    email() { commands.contact(); },
    social() { commands.contact(); },
    github() { out(`<a href="https://github.com/arkhiVd" target="_blank">github.com/arkhiVd</a>`); window.open("https://github.com/arkhiVd","_blank"); },
    resume() { out(`<span class="muted">the full story lives on</span> <a href="about.html">~/about</a> <span class="muted">and</span> <a href="projects.html">~/projects</a>.`); },
    date() { out(`<span class="v">${new Date().toString()}</span>`); },
    echo(arg, raw) { out(esc(raw || "")); },
    sudo() { out(`<span style="color:var(--amber)">aravind is not in the sudoers file. This incident will be reported.</span> <span class="muted">;)</span>`); },
    clear() { body.querySelectorAll(".term-line, .term-out").forEach(n => n.remove()); },
    banner() { commands.neofetch(); },
  };

  function run(raw) {
    const line = raw.trim();
    if (line) { history.unshift(line); hIdx = -1; }
    printPromptLine(raw);
    if (!line) return;
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn) fn(rest[0], rest.join(" "));
    else out(`<span style="color:var(--amber)">command not found:</span> ${esc(cmd)} <span class="muted">— type</span> <span class="k">help</span>`);
    scroll();
  }
  window.runTerminal = run; // for command chips

  function intro() {
    out(`<span class="muted">Last login: ${new Date().toDateString()} on ttys001</span>`);
    setTimeout(() => { run('neofetch'); }, 700);
  }

  function init() {
    body = document.getElementById("term-body");
    inputRow = document.getElementById("term-input-row");
    input = document.getElementById("term-input");
    if (!body || !input) return;

    intro();
    scroll();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { run(input.value); input.value = ""; }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (hIdx > 0) { hIdx--; input.value = history[hIdx]; } else { hIdx = -1; input.value = ""; } }
      else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); commands.clear(); }
    });

    // focus on click anywhere in terminal
    body.parentElement.addEventListener("click", (e) => {
      if (window.getSelection().toString()) return;
      input.focus();
    });

    // command chips
    document.querySelectorAll("[data-cmd]").forEach(btn => {
      btn.addEventListener("click", () => { run(btn.dataset.cmd); input.value=""; input.focus(); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
