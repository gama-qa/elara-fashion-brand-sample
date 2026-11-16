"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";

/** Tuning for the word-by-word light-up. */
const scrub = {
  /** Opacity of a word before it is lit. Low, but the sentence shape stays visible. */
  dim: 0.16,
  /** The first word lights when the paragraph's top reaches this point of the viewport... */
  start: "top 82%",
  /** ...and the last when its bottom reaches this point. Closer values = faster. */
  end: "bottom 52%",
  /** How many words are mid-transition at once. Higher = softer wave. */
  overlap: 3,
  /** Seconds of smoothing between scroll and the wave. */
  smoothing: 0.5,
};

type ScrubTextProps = {
  text: string;
  className?: string;
};

/**
 * A paragraph whose words light up one after another as it scrolls through
 * the viewport (GSAP scrub), pacing the reader through a short statement.
 * Scrolling back dims them again. Without JavaScript or under reduced motion
 * the paragraph is simply fully lit.
 */
export function ScrubText({ text, className }: ScrubTextProps) {
  const paragraph = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = paragraph.current;
      if (!el) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el.querySelectorAll("[data-word]"),
          { opacity: scrub.dim },
          {
            opacity: 1,
            ease: "none",
            duration: scrub.overlap,
            stagger: 1,
            scrollTrigger: { trigger: el, start: scrub.start, end: scrub.end, scrub: scrub.smoothing },
          },
        );
      });
      return () => media.revert();
    },
    { dependencies: [text] },
  );

  return (
    <p ref={paragraph} className={className}>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span data-word>{word}</span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
