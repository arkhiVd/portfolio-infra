/* ============================================================
   Boot sequence · nav · scanlines · visitor counter
   ============================================================ */
(function () {
  // scanline overlay (toggleable via tweaks)
  document.body.classList.add("scanlines");

  // ---------- boot sequence ----------
  const boot = document.getElementById("boot");
  if (boot && sessionStorage.getItem("skip-boot") === "1") {
    boot.remove();
    document.body.classList.add("booted");
  } else if (boot) {
    const lines = [
      `<span class="ok">[ ok ]</span> mounting /dev/portfolio`,
      `<span class="ok">[ ok ]</span> initializing aws-sdk · terraform-core`,
      `<span class="ok">[ ok ]</span> establishing secure tunnel (OIDC)`,
      `<span class="amber">[boot]</span> loading aravind@cloud …`,
    ];
    const inner = boot.querySelector(".boot-inner");
    let i = 0;
    const seen = sessionStorage.getItem("booted-once");
    const step = () => {
      if (i < lines.length) {
        const el = document.createElement("div");
        el.className = "boot-line";
        el.innerHTML = lines[i];
        inner.appendChild(el);
        i++;
        setTimeout(step, seen ? 60 : 230);
      } else {
        setTimeout(finish, seen ? 100 : 360);
      }
    };
    const finish = () => {
      boot.classList.add("done");
      document.body.classList.add("booted");
      sessionStorage.setItem("booted-once", "1");
      setTimeout(() => boot.remove(), 520);
    };
    step();
  } else {
    document.body.classList.add("booted");
  }

  // ---------- typewriter for hero name ----------
  const tw = document.querySelector("[data-typewriter]");
  if (tw) {
    const full = tw.dataset.typewriter;
    const cursor = tw.querySelector(".type-cursor");
    const target = document.createElement("span");
    target.className = "accent";
    tw.insertBefore(target, cursor);
    let n = 0;
    const delay = sessionStorage.getItem("booted-once") ? 700 : 1100;
    setTimeout(function typ() {
      if (n <= full.length) { target.textContent = full.slice(0, n); n++; setTimeout(typ, 70); }
    }, delay);
  }

  // ---------- mobile nav ----------
  const toggle = document.getElementById("menu-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) toggle.addEventListener("click", () => links.classList.toggle("open"));

  // ---------- visitor counter (restyled) ----------
  // In production this fetches the API Gateway endpoint (Lambda + DynamoDB).
  // Here we simulate a stable, incrementing count so the UI is alive.
  const counter = document.getElementById("visitor-count");
  if (counter) {
    const API = window.VISITOR_API || null;
    const render = (n) => { counter.textContent = String(n); };
    // Real backend only. No fabricated/localStorage fallback — show "----" if unavailable.
    if (API) {
      fetch(API, { method: "POST" })
        .then(r => r.json())
        .then(d => render(d.count))
        .catch(() => { counter.textContent = "----"; });
    } else {
      counter.textContent = "----";
    }
  }

  // ---------- hologram: nothing to poll; source is controlled via Tweaks ----------

  // ---------- reveal: content is visible by default; this only adds a
  // staggered fade for browsers that honor it, and never hides content. ----------
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window) {
    reveals.forEach((el, i) => {
      el.style.willChange = "opacity, transform";
    });
  }
})();
