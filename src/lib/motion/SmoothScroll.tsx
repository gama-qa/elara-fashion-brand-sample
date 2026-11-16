"use client";

import type { LenisOptions } from "lenis";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const LENIS_OPTIONS: LenisOptions = {
  // Lenis is driven by gsap.ticker below, so Lenis and ScrollTrigger advance
  // in the same frame.
  autoRaf: false,
  // Lower lerp = slower settle. 0.08 is calm without feeling detached.
  lerp: 0.08,
  wheelMultiplier: 0.9,
  anchors: true,
};

// Stable reference: useLenis re-subscribes whenever the callback changes.
const updateScrollTrigger = () => ScrollTrigger.update();

/**
 * The only smooth scroller (global Lenis instance on the window). Under
 * reduced motion it is not mounted and the page scrolls natively;
 * ScrollTrigger works either way.
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis(updateScrollTrigger);

  useEffect(() => {
    if (!lenis) return;
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Lenis caches how far the page can scroll. Re-measure whenever
    // ScrollTrigger does (resize, content height change), so a longer page
    // can never be cut short by a stale limit.
    const remeasure = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", remeasure);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      ScrollTrigger.removeEventListener("refresh", remeasure);
    };
  }, [lenis]);

  if (reduced !== false) return null;
  return <ReactLenis root options={LENIS_OPTIONS} />;
}
