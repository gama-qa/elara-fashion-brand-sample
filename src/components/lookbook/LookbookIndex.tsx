"use client";

import Link from "next/link";
import { useRef } from "react";
import { Photo } from "@/components/media/Photo";
import { SceneSection } from "@/components/scene/SceneSection";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { type Look, lookNumber } from "@/data/lookbook";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { site } from "@/lib/site";

/** How the grid opens as it rises into view. */
const reveal = {
  /** The opening starts this narrow, as a share of the width cut from each side (%). */
  from: 34,
  /** It starts when the section's top enters the screen and is fully open when the top reaches this point. */
  openBy: "top 18%",
};

/**
 * The end of the lookbook: out of the corridor into a plain page with every
 * look in one grid, then one button to the collection.
 *
 * The section opens like a doorway: a clip-path that starts as a tall slot in
 * the middle and widens to the full page as it scrolls up (GSAP scrub). Once
 * it covers the screen the canvas behind it stops rendering (`occludes`).
 */
export function LookbookIndex({ looks }: { looks: Look[] }) {
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = panel.current;
    if (!el) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { clipPath: `inset(0% ${reveal.from}% 0% ${reveal.from}%)` },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: reveal.openBy, scrub: true },
        },
      );
    });
    return () => media.revert();
  });

  return (
    <SceneSection occludes aria-labelledby="all-looks" className="relative z-10">
      <div ref={panel} className="bg-cream pb-section pt-[14svh]">
        <div className="flex flex-wrap items-end justify-between gap-6 px-page">
          <Heading id="all-looks" level={2} size="title">
            All {looks.length} looks
          </Heading>
          <Label className="pb-3">{site.season}</Label>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-px gap-y-8 md:mt-16 md:grid-cols-4">
          {looks.map((look) => (
            <li key={look.number}>
              <Link href={`/collection/${look.product.slug}`} data-cursor="view" className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-sand">
                  <Photo
                    id={look.image}
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-quiet group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-3 px-3 pt-3 text-label md:px-4">
                  <Label tone="strong">Look {lookNumber(look.number)}</Label>
                  <Label className="text-right">{look.product.name}</Label>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex justify-center px-page md:mt-24">
          <Button href="/collection" variant="solid">
            Shop the looks
          </Button>
        </div>
      </div>
    </SceneSection>
  );
}
