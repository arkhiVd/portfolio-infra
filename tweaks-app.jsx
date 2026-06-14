/* Tweaks app — applies live theme changes to the terminal portfolio.
   Mounts only the panel; the page itself stays vanilla. */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "green",
  "scanlines": true,
  "grid": true,
  "boot": true,
  "uiScale": 100
}/*EDITMODE-END*/;

const ACCENTS = {
  green:  { base: "#4ef08a", bright: "#8dffb6", deep: "#1f7a48", glow: "78,240,138" },
  cyan:   { base: "#34d8e8", bright: "#8af0fb", deep: "#1d6f7a", glow: "52,216,232" },
  amber:  { base: "#ffb02e", bright: "#ffce6e", deep: "#9a6a14", glow: "255,176,46" },
  violet: { base: "#a98bff", bright: "#cdb9ff", deep: "#5a47a8", glow: "169,139,255" },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    const a = ACCENTS[t.accent] || ACCENTS.green;
    root.style.setProperty("--green", a.base);
    root.style.setProperty("--green-bright", a.bright);
    root.style.setProperty("--green-deep", a.deep);
    root.style.setProperty("--glow-green", `0 0 12px rgba(${a.glow},0.4)`);
    root.style.setProperty("--border", `rgba(${a.glow},0.14)`);
    root.style.setProperty("--border-soft", `rgba(${a.glow},0.08)`);
    root.style.setProperty("--border-bright", `rgba(${a.glow},0.32)`);

    document.body.classList.toggle("scanlines", !!t.scanlines);
    const grid = document.querySelector(".grid-bg");
    if (grid) grid.style.display = t.grid ? "" : "none";

    root.style.fontSize = (16 * (t.uiScale / 100)) + "px";
  }, [t]);

  return (
    <TweaksPanel>
      <TweakSection label="Theme" />
      <TweakColor label="Accent" value={ACCENTS[t.accent].base}
        options={[ACCENTS.green.base, ACCENTS.cyan.base, ACCENTS.amber.base, ACCENTS.violet.base]}
        onChange={(hex) => {
          const key = Object.keys(ACCENTS).find(k => ACCENTS[k].base === hex) || "green";
          setTweak("accent", key);
        }} />
      <TweakSection label="CRT effects" />
      <TweakToggle label="Scanlines" value={t.scanlines} onChange={(v) => setTweak("scanlines", v)} />
      <TweakToggle label="Background grid" value={t.grid} onChange={(v) => setTweak("grid", v)} />
      <TweakToggle label="Boot sequence" value={t.boot} onChange={(v) => {
        setTweak("boot", v);
        sessionStorage.setItem("skip-boot", v ? "" : "1");
      }} />

      <TweakSection label="Layout" />
      <TweakSlider label="UI scale" value={t.uiScale} min={85} max={120} step={5} unit="%"
        onChange={(v) => setTweak("uiScale", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
