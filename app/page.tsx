import Image from "next/image";
import { Entrance } from "@/components/entrance";
import { profile } from "@/lib/profile";

export default function Home() {
  return (
    <Entrance>
    <main className="stage">
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
        <h1>
          <span>Shahar</span>
          <span>Band</span>
        </h1>
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
    </Entrance>
  );
}
