import type { Metadata } from "next";
import { Parallax } from "@/components/media/Parallax";
import { Photo } from "@/components/media/Photo";
import { PageSetup } from "@/components/scene/PageSetup";
import { SceneSection } from "@/components/scene/SceneSection";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { LineReveal } from "@/components/ui/LineReveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `How ${site.name} works: the cloth first, a fit tried on five women, and seams made to be repaired.`,
};

/** The three things the studio is built on. Kept specific: a number, a place or a method in each. */
const values = [
  {
    title: "Fabric",
    text: "We buy the yarn and the cloth before we draw anything. Cashmere at 15.5 microns from Inner Mongolia, merino from Tasmania, silk woven near Como. If a fibre cannot be traced back to its mill, we do not use it.",
  },
  {
    title: "Fit",
    text: "A pattern is fitted on five women, one in each size from XS to XL, never graded up from a single sample. The shoulder seam moves by millimetres for weeks before a piece is allowed into work.",
  },
  {
    title: "Longevity",
    text: "Seams are linked or French-seamed, so they can be opened and closed again. We keep yarn from every dye lot for ten years and mend what we have made, at no charge.",
  },
];

/*
  About. The 3D set shows behind the header section only (chapter 0 of the
  "about" preset: one quiet view of the arch from outside). Everything after
  it is an opaque cream page, marked `occludes` so the canvas stops rendering
  once it is covered.
*/
export default function AboutPage() {
  return (
    <>
      <PageSetup scene="about" header="overlay" />

      <SceneSection
        chapter={0}
        aria-labelledby="about-title"
        className="flex min-h-[88svh] flex-col justify-end pb-[9vh] pt-header"
      >
        <Container>
          <LineReveal delay={0.3} duration={1.4}>
            <Label>The studio</Label>
          </LineReveal>
          <Heading id="about-title" level={1} size="display" className="mt-5 max-w-[14ch]">
            <LineReveal delay={0.4} duration={1.5}>
              Few pieces,
            </LineReveal>
            <LineReveal delay={0.54} duration={1.5}>
              made slowly
            </LineReveal>
          </Heading>
        </Container>
      </SceneSection>

      <SceneSection as="div" occludes className="relative z-10 bg-cream">
        <section aria-labelledby="about-story" className="border-t border-sand py-section">
          <Container className="grid gap-x-6 gap-y-10 md:grid-cols-12">
            <Label as="p" id="about-story" className="md:col-span-3">
              Since 2017
            </Label>
            <div className="md:col-span-8 md:col-start-5">
              <p className="font-serif text-section font-light">
                {site.name} began with one sweater, knitted forty times until the shoulder sat right.
              </p>
              <div className="mt-10 grid gap-8 md:grid-cols-2">
                <p>
                  That first season was a single style in three colours, sold from a rented room above
                  a knitting workshop in Biella. We still work with the same nine people there, and we
                  still release fewer than thirty pieces a year.
                </p>
                <p>
                  Nothing is made ahead of an order by more than one small run. When a run sells out it
                  is knitted again from the same yarn lot, or it is not made again at all.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* One large photograph, edge to edge, sliding slowly inside its frame. */}
        <figure>
          <Parallax inside amount={0.1} className="aspect-[4/5] bg-sand md:aspect-[16/9]">
            <Photo id="about-interior" sizes="100vw" className="h-full w-full object-cover" />
          </Parallax>
          <figcaption className="px-page pt-3">
            <Label>Collared knit polo, merino and cashmere, in oat</Label>
          </figcaption>
        </figure>

        <section aria-labelledby="about-values" className="py-section">
          <Container>
            <Heading id="about-values" level={2} size="title">
              Three things we hold to
            </Heading>
            <ol className="mt-14 grid gap-x-6 gap-y-12 border-t border-sand md:mt-20 md:grid-cols-3">
              {values.map((value, index) => (
                <li key={value.title} className="border-b border-sand pb-10 pt-6 md:border-b-0 md:pb-0">
                  <Label className="tabular-nums">0{index + 1}</Label>
                  <h3 className="mt-6 font-serif text-section font-light">{value.title}</h3>
                  <p className="mt-5 max-w-[26rem]">{value.text}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section aria-label="Next" className="border-t border-sand py-section">
          <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <p className="max-w-[30rem] font-serif text-section font-light">
              The studio is open by appointment.
            </p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
              <Button href="/collection">View the collection</Button>
              <AnimatedLink href="/lookbook">Lookbook</AnimatedLink>
            </div>
          </Container>
        </section>
      </SceneSection>
    </>
  );
}
