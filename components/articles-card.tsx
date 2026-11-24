export function ArticlesCard() {
  return (
    <div className="tile" id="writing">
      <span className="mono">Writing</span>
      <a
        className="tile-title"
        href="https://medium.com/@Shahar_Band/the-orchestration-tax-why-we-built-fluxly-c7796f49cd48"
        target="_blank"
        rel="noreferrer"
      >
        Fluxly: Lightweight Workflow Orchestration
      </a>
      <span className="tile-meta">
        <time dateTime="2026-03">Mar 2026</time>
        {" · "}
        <a href="https://medium.com/@Shahar_Band" target="_blank" rel="noreferrer">
          All writing <span aria-hidden="true">→</span>
        </a>
      </span>
    </div>
  );
}
