export function NotifyBar() {
  return (
    <section className="notify" id="notify" aria-label="Early access">
      <div>
        <span className="notify-title">Be first to know.</span>
        <span className="mono">One email when it&apos;s ready. Nothing else.</span>
      </div>
      {/* No backend: opens the visitor's mail app with a pre-filled request. */}
      <form className="notify-form" action="mailto:Shahar1531@gmail.com" method="get">
        <input type="hidden" name="subject" value="Notify me when it's ready" />
        <input
          type="email"
          name="body"
          placeholder="you@email.com"
          aria-label="Your email"
          required
        />
        <button type="submit">Notify me →</button>
      </form>
    </section>
  );
}
