"use client";

import { useEffect } from "react";
import { presetHaze } from "@/three/presets";
import { measureSceneSections, syncSceneSections } from "../scene-sections";
import { getSceneState, sceneFrame, setSceneState } from "../scene-store";
import { gsap, ScrollTrigger } from "./gsap";

/** The header turns solid after this many px. */
const SCROLLED_AFTER = 24;

/**
 * Writes the global scroll state: per-frame values into `sceneFrame`,
 * discrete flags into the scene store, and the page tint into --haze. One
 * ScrollTrigger spans the page, so this works with Lenis and with native
 * scroll.
 */
export function ScrollSync() {
  useEffect(() => {
    const apply = (scrollY: number, progress: number, velocity: number, immediate: boolean) => {
      sceneFrame.scrollY = scrollY;
      sceneFrame.progress = progress;
      sceneFrame.velocity = velocity;
      syncSceneSections(scrollY, immediate);
      setSceneState({ scrolled: scrollY > SCROLLED_AFTER });
    };

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      // Scrolling eases the camera (scrub); a refresh re-measures and snaps.
      onUpdate: (self) => apply(self.scroll(), self.progress, self.getVelocity(), false),
      onRefresh: (self) => {
        measureSceneSections();
        apply(self.scroll(), self.progress, 0, true);
      },
    });

    // The page follows the scene's haze: --haze (0 to 1) drives the header's
    // colour and the fallback's sand veil. Sampled at the eased chapter, so
    // the DOM and the canvas change together.
    const root = document.documentElement;
    let lastHaze = -1;
    const syncHaze = () => {
      const preset = getSceneState().preset;
      const haze = preset ? presetHaze(preset, sceneFrame.chapter) : 0;
      if (Math.abs(haze - lastHaze) < 0.002) return;
      lastHaze = haze;
      root.style.setProperty("--haze", haze.toFixed(3));
    };
    gsap.ticker.add(syncHaze);

    // ScrollTrigger refreshes on window resize by itself. Page height also
    // changes on navigation and font load, so watch the body too.
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(document.body);

    return () => {
      trigger.kill();
      gsap.ticker.remove(syncHaze);
      root.style.removeProperty("--haze");
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
