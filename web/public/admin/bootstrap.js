const editorHosts = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "cms-auth.aravindakrishnan.cloud",
]);

if (editorHosts.has(window.location.hostname)) {
  document.querySelector("#editor-status")?.remove();
  const script = document.createElement("script");
  script.src = "./sveltia-cms-0.209.0.js";
  script.addEventListener("load", () => CMS.init(), { once: true });
  document.body.append(script);
}
