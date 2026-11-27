import { Gas } from "@/components/gas/gas";
import { GasIntro } from "@/components/gas/intro";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";

export default function Home() {
  return (
    <>
      <Gas>
        <GasIntro />
      </Gas>
      <Nav />
      <main className="stage">
        <Hero />
      </main>
    </>
  );
}
