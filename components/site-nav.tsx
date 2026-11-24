export function SiteNav() {
  return (
    <header className="nav">
      <a className="nav-mark mono" href="#top" aria-label="Shahar Band, home">
        S—B
      </a>
      <nav className="nav-links mono" aria-label="Sections">
        <a href="#building">Building</a>
        <a href="#writing">Writing</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="badge mono" href="#notify">
        Early access
      </a>
    </header>
  );
}
