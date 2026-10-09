export function ArticlesCard() {
  return (
    <div className="panel-col">
      <h2>Articles</h2>
      <a
        className="article"
        href="https://medium.com/@Shahar_Band/the-orchestration-tax-why-we-built-fluxly-c7796f49cd48"
        target="_blank"
        rel="noreferrer"
      >
        <strong>Fluxly: Lightweight Workflow Orchestration</strong>
        <time dateTime="2026-03">Mar 2026</time>
      </a>
      <a
        className="more"
        href="https://medium.com/@Shahar_Band"
        target="_blank"
        rel="noreferrer"
      >
        All writing <b aria-hidden="true">→</b>
      </a>
    </div>
  );
}
