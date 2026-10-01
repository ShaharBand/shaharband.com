import { ArticlesCard } from "@/components/articles-card";
import { ContactCard } from "@/components/contact-card";
import { Identity } from "@/components/identity";

export default function Home() {
  return (
    <main className="stage">
      <Identity />
      <section className="panel" aria-label="Writing and contact">
        <ArticlesCard />
        <ContactCard />
      </section>
    </main>
  );
}
