import { Photo } from "@/components/media/Photo";
import { RevealImage } from "@/components/media/RevealImage";
import { SceneSection } from "@/components/scene/SceneSection";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { LineReveal } from "@/components/ui/LineReveal";
import { site } from "@/lib/site";

/**
 * Entrance timing for the hero's DOM layer, in seconds. The footage behind it
 * (which clip, when, how washed, grain and the rest) is tuned in
 * src/three/presets.ts and src/three/config.ts.
 */
const heroMotion = {
  /** Wait before anything moves, so the first paint has landed. */
  start: 0.3,
  /** How long each text line takes to rise. */
  lineDuration: 1.5,
  /** Gap between one text line starting and the next. */
  lineStagger: 0.16,
  /** When the photograph starts to unveil. */
  photoDelay: 0.55,
  /** How long the photograph's clip takes to open. */
  photoDuration: 1.9,
};

/**
 * How tall the whole hero is. The first screen holds the content; the rest is
 * left empty on purpose, so that for about half a screen of scrolling nothing
 * stands in front of the footage. The home reel in presets.ts is timed
 * against this height: change them together.
 */
const heroHeight = "min-h-[230svh]";

/**
 * Opening of the home page. Back to front: the footage (the fixed layer
 * behind the page, chapter 0 of the home reel), the wordmark and tagline, one
 * editorial photograph. Scrolling on lifts the wash off the wall, moves the
 * shadow with the scroll and dissolves the second clip in.
 *
 * Text here sits on moving footage: labels use the strong (espresso) tone,
 * which the reel's wash is measured for. The muted tone does not pass AA.
 */
export function Hero() {
  const { start, lineDuration, lineStagger, photoDelay, photoDuration } = heroMotion;

  return (
    <SceneSection chapter={0} aria-labelledby="home-title" className={heroHeight}>
      <div className="flex min-h-svh flex-col justify-end pb-[9vh] pt-[calc(var(--spacing-header)+2rem)]">
        <Container className="grid grid-cols-12 items-end gap-x-6 gap-y-10">
          <figure className="col-span-7 col-start-6 md:col-span-3 md:col-start-10 md:row-start-1">
            <figcaption className="flex min-h-11 items-center justify-between gap-4">
              <LineReveal delay={photoDelay + 0.5} duration={lineDuration}>
                <Label tone="strong" className="whitespace-nowrap pb-1">
                  {site.season}
                </Label>
              </LineReveal>
              {/* The photo is too narrow on phones for both; the menu has the link. */}
              <LineReveal delay={photoDelay + 0.5 + lineStagger} duration={lineDuration} className="hidden md:block">
                <AnimatedLink href="/lookbook">Lookbook</AnimatedLink>
              </LineReveal>
            </figcaption>
            <RevealImage delay={photoDelay} duration={photoDuration} className="aspect-[4/5] bg-sand">
              <Photo
                id="hero-knit-set"
                preload
                sizes="(min-width: 768px) 25vw, 58vw"
                className="h-full w-full object-cover"
              />
            </RevealImage>
          </figure>

          <div className="col-span-12 md:col-span-9 md:row-start-1">
            <h1 id="home-title" className="font-serif text-display font-light tracking-wordmark">
              <LineReveal delay={start} duration={lineDuration}>
                {site.name}
              </LineReveal>
            </h1>
            <p className="mt-7 md:mt-9">
              <LineReveal delay={start + lineStagger} duration={lineDuration}>
                <Label tone="strong">{site.tagline}</Label>
              </LineReveal>
            </p>
          </div>
        </Container>
      </div>
    </SceneSection>
  );
}
