import { type RefObject, useEffect } from "react";
import { gsap } from "@/lib/motion/gsap";

/** Tuning for the scroll-velocity lean of the catalog cards. */
export const tilt = {
  /** Degrees of rotateX at full speed. Keep it barely perceptible. */
  rotate: 1.8,
  /** Degrees of skewY at full speed. */
  skew: 0.45,
  /** Scroll speed in px/s that counts as "full". Lower = reacts to gentler scrolling. */
  fullSpeed: 3200,
  /** How quickly the lean follows speed and settles back, 0–1 per frame. Lower = lazier. */
  follow: 0.1,
};

/**
 * Writes `--scroll-v` (-1 to 1, smoothed scroll speed, sign = direction) on
 * the given element every frame. Children use it in a CSS transform, so one
 * variable leans the whole grid and it eases back to 0 when scrolling stops.
 * Measured from the scroll position itself, so it works with Lenis and with
 * native scroll. Does nothing under reduced motion.
 */
export function useScrollTilt(target: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = target.current;
    if (!el) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      let lastY = window.scrollY;
      let value = 0;
      let written = 0;

      const update = (_time: number, deltaMs: number) => {
        const y = window.scrollY;
        const speed = deltaMs > 0 ? ((y - lastY) / deltaMs) * 1000 : 0;
        lastY = y;
        const goal = Math.max(-1, Math.min(1, speed / tilt.fullSpeed));
        value += (goal - value) * tilt.follow;
        if (Math.abs(value) < 0.001) value = 0;
        // Skip sub-visible changes, but always write the final 0 so the
        // cards come fully to rest.
        const cameToRest = value === 0 && written !== 0;
        if (!cameToRest && Math.abs(value - written) < 0.002) return;
        written = value;
        el.style.setProperty("--scroll-v", value.toFixed(3));
      };

      gsap.ticker.add(update);
      return () => {
        gsap.ticker.remove(update);
        el.style.removeProperty("--scroll-v");
      };
    });
    return () => media.revert();
  }, [target]);
}
