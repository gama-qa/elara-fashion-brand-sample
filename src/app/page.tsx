import { Featured } from "@/components/home/Featured";
import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { PageSetup } from "@/components/scene/PageSetup";

/*
  Home. Real footage runs behind the page and scroll moves through it; each
  section is a chapter of the home reel (src/three/presets.ts):
    0 Hero       a tree's shadow on a plaster wall, then the same wall with twigs
    1 Statement  linen in close-up, washing out to sand
    2 Featured   plain sand behind three pieces
  Material and lookbook sections are still to come.
*/
export default function HomePage() {
  return (
    <>
      <PageSetup scene="home" header="overlay" />
      <Hero />
      <Statement />
      <Featured />
    </>
  );
}
