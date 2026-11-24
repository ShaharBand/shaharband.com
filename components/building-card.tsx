export function BuildingCard() {
  return (
    <div className="tile tile-hero" id="building">
      <span className="ring ring-1" aria-hidden="true" />
      <span className="ring ring-2" aria-hidden="true" />
      <span className="ring ring-3" aria-hidden="true" />
      <div className="tile-top">
        <span className="mono" style={{ color: "var(--ink)" }}>
          Building
        </span>
        <span className="mono">Stealth · 2026</span>
      </div>
      <h2>
        The next thing,
        <br />
        <em>not ready to show yet.</em>
      </h2>
    </div>
  );
}
