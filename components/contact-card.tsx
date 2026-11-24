const links = [
  { k: "GitHub", v: "ShaharBand", href: "https://github.com/ShaharBand" },
  { k: "LinkedIn", v: "shahar-band", href: "https://www.linkedin.com/in/shahar-band/" },
  { k: "X", v: "@shahar_band", href: "https://x.com/shahar_band" },
];

export function ContactCard() {
  return (
    <div className="tile" id="contact">
      <span className="mono">Contact</span>
      <ul className="contact-list">
        {links.map((l) => (
          <li key={l.k}>
            <a href={l.href} target="_blank" rel="noreferrer">
              <span className="k mono">{l.k}</span>
              <span className="v">{l.v}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
