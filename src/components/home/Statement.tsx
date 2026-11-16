import { Parallax } from "@/components/media/Parallax";
import { Photo } from "@/components/media/Photo";
import { RevealImage } from "@/components/media/RevealImage";
import { SceneSection } from "@/components/scene/SceneSection";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { ScrubText } from "@/components/ui/ScrubText";

/** Kept near 190 characters so it sets in three to four lines at desktop width. */
const statement =
  "Every piece starts as yarn, not as cloth. Cashmere and merino are knitted to shape on a twelve-gauge frame, so nothing is cut away. The seams are linked by hand, loop to loop, then washed and dried flat.";

/**
 * Second section of the home page (chapter 1). Behind it the footage turns
 * from the wall to linen in close-up, under a heavier wash so the paragraph
 * reads. The paragraph lights up word by word; one small photograph drifts
 * past below it. Early in this section the page washes over to sand for the
 * products that follow (the home reel in presets.ts).
 */
export function Statement() {
  return (
    <SceneSection chapter={1} aria-labelledby="statement-label" className="pb-[22svh] pt-[24svh]">
      <Container>
        {/* Over footage: espresso, not the muted tone (see Hero). */}
        <Label as="p" id="statement-label" tone="strong">
          How a piece is made
        </Label>
        <ScrubText text={statement} className="mt-8 max-w-[76rem] font-serif text-section font-light" />

        <div className="mt-24 grid grid-cols-12 gap-x-6 md:mt-32">
          <Parallax amount={0.14} className="col-span-7 col-start-6 md:col-span-3 md:col-start-9">
            <figure>
              <RevealImage inView className="aspect-[4/5] bg-sand">
                <Photo
                  id="statement-cardigan"
                  sizes="(min-width: 768px) 25vw, 58vw"
                  className="h-full w-full object-cover"
                />
              </RevealImage>
              <figcaption className="mt-3">
                <Label>Ribbed cardigan, linked at the shoulder</Label>
              </figcaption>
            </figure>
          </Parallax>
        </div>
      </Container>
    </SceneSection>
  );
}
