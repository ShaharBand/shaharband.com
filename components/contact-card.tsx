export function ContactCard() {
  return (
    <div className="panel-col">
      <h2>Contact</h2>
      <ul className="contact-list">
        <li>
          <a href="mailto:Shahar1531@gmail.com">
            <span className="k">Email</span>
            <span className="v">Shahar1531@gmail.com</span>
          </a>
        </li>
        <li>
          <a href="https://github.com/ShaharBand" target="_blank" rel="noreferrer">
            <span className="k">GitHub</span>
            <span className="v">ShaharBand</span>
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/shahar-band/" target="_blank" rel="noreferrer">
            <span className="k">LinkedIn</span>
            <span className="v">shahar-band</span>
          </a>
        </li>
        <li>
          <a href="https://x.com/shahar_band" target="_blank" rel="noreferrer">
            <span className="k">X</span>
            <span className="v">@shahar_band</span>
          </a>
        </li>
      </ul>
    </div>
  );
}
