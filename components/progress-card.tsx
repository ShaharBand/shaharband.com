export function ProgressCard() {
  return (
    <div className="tile">
      <span className="mono">Progress</span>
      <div className="bars" aria-hidden="true">
        <span style={{ height: "30%" }} />
        <span style={{ height: "46%" }} />
        <span style={{ height: "62%" }} />
        <span className="on" style={{ height: "80%" }} />
        <span className="next" style={{ height: "100%" }} />
      </div>
      <span className="tile-name">Prototype</span>
    </div>
  );
}
