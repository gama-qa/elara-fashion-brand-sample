import type { Metadata } from "next";
import { LookbookExperience } from "@/components/lookbook/LookbookExperience";
import { LookbookIndex } from "@/components/lookbook/LookbookIndex";
import { PageSetup } from "@/components/scene/PageSetup";
import { SceneSection } from "@/components/scene/SceneSection";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { LineReveal } from "@/components/ui/LineReveal";
import { looks } from "@/data/lookbook";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Eight looks from the Autumn–Winter collection, shown in a walk through the gallery.",
};

/*
  Lookbook. The set behind it is the gallery corridor (preset "lookbook"):
    chapter 0        this intro, outside the first arch
    chapters 1 to 8  one room and one look each (LookbookWalk)
    then             out of the last arch into the grid of all looks
  Without WebGL the looks are a stack of full-screen photographs instead.
*/
export default function LookbookPage() {
  return (
    <>
      <PageSetup scene="lookbook" header="overlay" />

      <SceneSection
        chapter={0}
        aria-labelledby="lookbook-title"
        className="flex min-h-svh flex-col justify-end pb-[10vh] pt-header"
      >
        <Container>
          <LineReveal delay={0.3} duration={1.4}>
            <Label>{site.season}</Label>
          </LineReveal>
          <Heading id="lookbook-title" level={1} size="display" className="mt-5">
            <LineReveal delay={0.4} duration={1.5}>
              Lookbook
            </LineReveal>
          </Heading>
          <p className="mt-7">
            <LineReveal delay={0.56} duration={1.5}>
              <Label tone="strong">
                {looks.length} looks, one room each. Scroll to walk through.
              </Label>
            </LineReveal>
          </p>
        </Container>
      </SceneSection>

      <LookbookExperience looks={looks} />
      <LookbookIndex looks={looks} />
    </>
  );
}
