import { ArticlesCard } from "@/components/articles-card";
import { ContactCard } from "@/components/contact-card";
import { Entrance } from "@/components/entrance";
import { Identity } from "@/components/identity";

export default function Home() {
  return (
    <Entrance>
      <main className="stage">
        <Identity />
        <section className="panel" aria-label="Writing and contact">
          <ArticlesCard />
          <ContactCard />
        </section>
      </main>
    </Entrance>
  );
}
