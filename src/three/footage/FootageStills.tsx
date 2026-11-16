"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { clipScale, createReelSample, getVideo, type Reel, sampleReel } from "@/lib/footage";
import { EASE_QUIET } from "@/lib/motion/easing";
import { gsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { sceneFrame } from "@/lib/scene-store";
import { sceneConfig } from "../config";

/**
 * The footage without video or WebGL: each clip's poster frame, cross-fading
 * and slowly scaling with scroll, under the same wash of page colour.
 *
 * It is always there on a footage page. Where the canvas runs it sits
 * underneath: it is the first paint, and it covers until the live footage has
 * a frame to show. Where the canvas does not run (phones, weak devices,
 * reduced motion, `?scene=off`) it is the background. The numbers come from
 * the same reel and the same eased scroll value as the live version, so the
 * two never disagree about which clip is on screen.
 */
export function FootageStills({ reel }: { reel: Reel }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const frames = Array.from(el.querySelectorAll<HTMLElement>("[data-clip]"));
    const wash = el.querySelector<HTMLElement>("[data-wash]");
    const sample = createReelSample();
    let last = Number.NaN;

    const update = () => {
      const chapter = sceneFrame.chapter;
      if (Math.abs(chapter - last) < 0.0004) return;
      last = chapter;
      sampleReel(reel, chapter, sample);

      frames.forEach((frame, index) => {
        // The clip underneath stays solid; the next one fades in over it.
        const opacity = index === sample.a ? 1 : index === sample.b ? sample.mix : 0;
        frame.style.opacity = opacity.toFixed(3);
        frame.style.visibility = opacity > 0 ? "visible" : "hidden";
        if (opacity > 0 && !reduced) {
          frame.style.transform = `scale(${clipScale(reel, index, chapter).toFixed(4)})`;
        }
      });
      if (wash) wash.style.opacity = sample.wash.toFixed(3);
    };

    update();
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [reel, reduced]);

  return (
    <motion.div
      ref={root}
      className="absolute inset-0 overflow-hidden bg-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: sceneConfig.render.fadeIn, ease: EASE_QUIET }}
    >
      {reel.clips.map((clip, index) => {
        const video = getVideo(clip.video);
        const origin = `${clip.focus[0] * 100}% ${clip.focus[1] * 100}%`;
        return (
          <div
            key={clip.video}
            data-clip
            className="absolute inset-0 will-change-transform"
            style={{ opacity: index === 0 ? 1 : 0, transformOrigin: origin }}
          >
            <Image
              src={video.poster}
              alt=""
              fill
              sizes="100vw"
              preload={index === 0}
              className="object-cover"
              style={{ objectPosition: origin }}
            />
          </div>
        );
      })}
      {/* Page colour over the footage: what keeps the text above it readable. */}
      <div data-wash className="absolute inset-0 bg-page" style={{ opacity: reel.wash[0]?.[1] ?? 0 }} />
    </motion.div>
  );
}
