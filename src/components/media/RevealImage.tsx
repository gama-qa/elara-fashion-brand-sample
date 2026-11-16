"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useRef } from "react";
import { EASE_QUIET } from "@/lib/motion/easing";

type RevealImageProps = {
  children: ReactNode;
  /** Seconds before the reveal starts. */
  delay?: number;
  /** Seconds for the clip to open. The picture settles for a little longer. */
  duration?: number;
  /**
   * `false` (default): reveal as soon as the page loads, for pictures above
   * the fold. `true`: wait until the picture scrolls into view, once.
   */
  inView?: boolean;
  /** Sizes the frame (an aspect ratio, a background while loading). */
  className?: string;
};

const CLOSED = "inset(100% 0% 0% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

/**
 * Unveils a picture from its bottom edge upwards with a clip-path, while the
 * picture itself eases back from a slight enlargement. It gives a photograph
 * a moment of arrival instead of popping in. Under reduced motion it is
 * simply there.
 *
 * The frame is a plain element and the clip sits on a child: browsers treat
 * a fully clipped element as not intersecting, so watching the clipped
 * element itself for "in view" would never fire.
 */
export function RevealImage({
  children,
  delay = 0,
  duration = 1.6,
  inView = false,
  className,
}: RevealImageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const seen = useInView(frame, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();
  const open = !inView || seen;
  const instant = { duration: 0 };

  return (
    <div ref={frame} className={className}>
      <motion.div
        data-reveal
        className="h-full w-full overflow-hidden"
        initial={{ clipPath: CLOSED }}
        animate={{ clipPath: open ? OPEN : CLOSED }}
        transition={reduced ? instant : { duration, delay, ease: EASE_QUIET }}
      >
        <motion.div
          data-reveal
          className="h-full w-full"
          initial={{ scale: 1.12 }}
          animate={{ scale: open ? 1 : 1.12 }}
          transition={reduced ? instant : { duration: duration * 1.3, delay, ease: EASE_QUIET }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
