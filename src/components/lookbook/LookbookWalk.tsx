"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { SceneSection } from "@/components/scene/SceneSection";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Label } from "@/components/ui/Label";
import { type Look, lookNumber } from "@/data/lookbook";
import { formatPrice } from "@/lib/format";
import { gsap } from "@/lib/motion/gsap";
import { sceneFrame } from "@/lib/scene-store";

/** Tuning for the walk. Distances along the walk are in chapters: 1 = one room. */
const walk = {
  /** Scroll distance per room, in viewport heights. Higher = a slower walk. */
  scrollPerRoom: 1.15,
  /** Height of the photograph, as a fraction of the viewport height. */
  photoHeight: 0.62,
  /** A look starts to appear this far before the camera reaches its room... */
  appearFrom: -0.55,
  /** ...is fully there from here... */
  settled: 0.12,
  /** ...and has gone by here, as the camera walks on through the next arch. */
  goneBy: 0.5,
  /** Size when it starts to appear (seen from further off) and when it has gone (passed close by). */
  farScale: 0.9,
  nearScale: 1.08,
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * The lookbook with the 3D corridor behind it.
 *
 * A stage the height of the screen stays pinned (CSS sticky) while a tall
 * column of invisible markers scrolls past it; each marker is one chapter of
 * the scene, so scrolling walks the camera from room to room. The stage reads
 * the same eased chapter value the camera uses and shows the look for the
 * room the camera is in: it comes forward as the camera arrives, holds, and
 * slips past as the camera walks on, leaving the arch clear in between.
 *
 * Photographs are ordinary DOM images over the canvas, never textures.
 */
export function LookbookWalk({ looks }: { looks: Look[] }) {
  const figures = useRef<Array<HTMLElement | null>>([]);
  const meter = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    let last = Number.NaN;

    const update = () => {
      // Chapter 0 is the page intro; look n belongs to chapter n.
      const chapter = sceneFrame.chapter;
      if (chapter === last) return;
      last = chapter;

      figures.current.forEach((figure, index) => {
        if (!figure) return;
        const t = chapter - (index + 1);
        let opacity = 0;
        let scale = walk.farScale;
        if (t >= walk.appearFrom && t < -walk.settled) {
          const p = ease((t - walk.appearFrom) / (-walk.settled - walk.appearFrom));
          opacity = p;
          scale = walk.farScale + (1 - walk.farScale) * p;
        } else if (t >= -walk.settled && t <= walk.settled) {
          opacity = 1;
          scale = 1;
        } else if (t > walk.settled && t < walk.goneBy) {
          const p = ease((t - walk.settled) / (walk.goneBy - walk.settled));
          opacity = 1 - p;
          scale = 1 + (walk.nearScale - 1) * p;
        }
        figure.style.opacity = opacity.toFixed(3);
        figure.style.transform = `scale(${scale.toFixed(4)})`;
        figure.style.visibility = opacity > 0.001 ? "visible" : "hidden";
        // Only the look in front can be clicked or tabbed to.
        figure.inert = opacity < 0.6;
      });

      const progress = clamp01((chapter - 1) / Math.max(looks.length - 1, 1));
      if (fill.current) fill.current.style.transform = `scaleY(${progress.toFixed(4)})`;
      if (meter.current) meter.current.style.opacity = clamp01((chapter - 0.45) / 0.35).toFixed(3);
      setCurrent(Math.min(looks.length, Math.max(1, Math.round(chapter))));
    };

    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [looks.length]);

  const photoWidth = `min(${walk.photoHeight * 80}svh, 82vw)`;

  return (
    <div className="grid">
      {/* The pinned stage. */}
      {/* overflow-clip, not hidden: a hidden box can still be scrolled by focus or
          scripts, and the enlarged photographs do overflow it slightly. */}
      <div className="pointer-events-none sticky top-0 col-start-1 row-start-1 h-svh self-start overflow-clip">
        {looks.map((look, index) => (
          <figure
            key={look.number}
            ref={(element) => {
              figures.current[index] = element;
            }}
            className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center will-change-transform"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <div className="aspect-[4/5] bg-sand" style={{ width: photoWidth }}>
              <Photo
                id={look.image}
                // Every look sits in the pinned stage, so all of them are "on
                // screen": load them up front and none is blank on a fast scroll.
                eager
                sizes="(min-width: 768px) 50vh, 82vw"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-6" style={{ width: photoWidth }}>
              <Label tone="strong">Look {lookNumber(look.number)}</Label>
              <span className="flex items-center gap-5">
                <AnimatedLink href={`/collection/${look.product.slug}`}>{look.product.name}</AnimatedLink>
                <Label>{formatPrice(look.product.price)}</Label>
              </span>
            </figcaption>
          </figure>
        ))}

        {/* Thin vertical progress: current look, a 1px rule that fills, total. */}
        <div
          ref={meter}
          className="absolute right-page top-1/2 flex -translate-y-1/2 flex-col items-center gap-3"
          style={{ opacity: 0 }}
          aria-hidden
        >
          <Label tone="strong" className="tabular-nums">
            {lookNumber(current)}
          </Label>
          <span className="relative block h-28 w-px bg-espresso/15">
            <span ref={fill} className="absolute inset-0 origin-top bg-espresso" style={{ transform: "scaleY(0)" }} />
          </span>
          <Label className="tabular-nums">{lookNumber(looks.length)}</Label>
        </div>
      </div>

      {/* One marker per room: chapters 1 to n of the corridor's camera path. */}
      <div className="col-start-1 row-start-1" aria-hidden>
        {looks.map((look) => (
          <SceneSection
            as="div"
            key={look.number}
            chapter={look.number}
            style={{ height: `${walk.scrollPerRoom * 100}svh` }}
          />
        ))}
      </div>
    </div>
  );
}
