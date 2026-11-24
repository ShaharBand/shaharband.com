import { ArticlesCard } from "@/components/articles-card";
import { BuildingCard } from "@/components/building-card";
import { ContactCard } from "@/components/contact-card";
import { Identity } from "@/components/identity";
import { NotifyBar } from "@/components/notify-bar";
import { ProfileCard } from "@/components/profile-card";
import { ProgressCard } from "@/components/progress-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <main className="stage" id="top">
      <div className="stage-glow" aria-hidden="true" />
      <SiteNav />
      <Identity />
      <section className="bento" aria-label="Building, writing and contact">
        <BuildingCard />
        <ProfileCard />
        <ProgressCard />
        <ArticlesCard />
        <ContactCard />
      </section>
      <NotifyBar />
      <SiteFooter />
    </main>
  );
}
