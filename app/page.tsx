import Image from "next/image";
import { profile } from "@/lib/profile";

export default function Home() {
  return (
    <main className="stage">
      <div className="slice" aria-hidden="true">
        <div className="slice-panel slice-left" />
        <div className="slice-panel slice-right" />
        <svg className="slice-seam" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="66" y1="0" x2="34" y2="100" />
        </svg>
      </div>

      <section className="identity">
        <div className="portrait">
          <Image
            src={profile.image}
            alt={profile.name}
            width={108}
            height={108}
            priority
            unoptimized
          />
        </div>
        <p className="status">
          <i />
          {profile.status}
        </p>
        <h1>{profile.name}</h1>
        <p className="subtitle">{profile.subtitle}</p>
      </section>

      <section className="panel" aria-label="Writing and contact">
        <div className="panel-col">
          <h2>Articles</h2>
          {profile.articles.map((article) => (
            <a
              key={article.href}
              className="article"
              href={article.href}
              target="_blank"
              rel="noreferrer"
            >
              <strong>{article.title}</strong>
              <time dateTime="2026-03">{article.date}</time>
            </a>
          ))}
          <a className="more" href={profile.writingHref} target="_blank" rel="noreferrer">
            All writing <b aria-hidden="true">→</b>
          </a>
        </div>
        <div className="panel-col">
          <h2>Contact</h2>
          <ul className="contact-list">
            {profile.contact.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  {...(item.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  <span className="k">{item.label}</span>
                  <span className="v">{item.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
