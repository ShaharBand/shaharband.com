"use client";

import { Footer } from "@/components/layout/footer/Footer";
import { Header } from "@/components/layout/header/Header";
import { AboutCard } from "@/components/portfolio/about/AboutCard";
import { CoursesCard } from "@/components/portfolio/education/CoursesCard";
import { EducationCard } from "@/components/portfolio/education/EducationCard";
import { ExperienceCard } from "@/components/portfolio/experience/ExperienceCard";
import { SocialMediaCard } from "@/components/portfolio/social-media/SocialMediaCard";

export default function Home() {
  return (
    <main className="container flex flex-col justify-center mx-auto my-2 relative gap-4">
      <Header />
      <AboutCard />
      <div className="flex flex-col gap-4 md:flex-row md:gap-x-4">
        <EducationCard />
        <ExperienceCard />
        <CoursesCard />
      </div>
      <SocialMediaCard />
      <Footer />
    </main>
  );
}
