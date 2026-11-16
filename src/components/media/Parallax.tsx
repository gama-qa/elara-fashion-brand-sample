"use client";

import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/motion/gsap";

type ParallaxProps = {
  children: ReactNode;
  /**
   * Travel as a fraction of the frame's height, each way from centre.
   * 0.08 inside a frame is gentle; above 0.15 starts to feel like a gimmick.
   */
  amount?: number;
  /**
   * `false`: the whole element drifts against the page, a little faster than
   * the scroll, so it reads as nearer than the text around it.
   * `true`: the element is a fixed frame and its content slides inside it,
   * like looking through a window. Give the frame a size (an aspect ratio).
   */
  inside?: boolean;
  className?: string;
};

/**
 * Scroll-linked parallax (GSAP scrub). Off under reduced motion: the content
 * simply sits centred.
 */
export function Parallax({ children, amount = 0.1, inside = false, className }: ParallaxProps) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frameEl = frame.current;
      const layerEl = layer.current;
      if (!frameEl || !layerEl) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const travel = () => frameEl.offsetHeight * amount;
        gsap.fromTo(
          layerEl,
          { y: () => (inside ? -travel() : travel()) },
          {
            y: () => (inside ? travel() : -travel()),
            ease: "none",
            scrollTrigger: {
              trigger: frameEl,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
      return () => media.revert();
    },
    { dependencies: [amount, inside] },
  );

  return (
    <div ref={frame} className={cn(inside && "relative overflow-hidden", className)}>
      <div
        ref={layer}
        className={cn("will-change-transform", inside && "absolute inset-x-0")}
        // Inside a frame the layer is taller than the frame by the travel at
        // each end, so it never shows an empty edge.
        style={inside ? { top: `${-amount * 100}%`, height: `${(1 + 2 * amount) * 100}%` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
