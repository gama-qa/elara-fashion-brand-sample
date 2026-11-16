"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DURATION, EASE_QUIET } from "@/lib/motion/easing";

type LineRevealProps = {
  children: ReactNode;
  /** Seconds before this line starts. Stagger lines by passing increasing delays. */
  delay?: number;
  /** Seconds the line takes to rise. */
  duration?: number;
  className?: string;
};

/**
 * One line of text rising into place from behind its own baseline. Use one
 * per line and stagger the delays: the eye is led down the lines in reading
 * order. Renders spans, so it is valid inside a heading or a paragraph.
 *
 * The mask is padded in em so accents and descenders are not clipped at
 * tight line-heights (the É of the wordmark).
 */
export function LineReveal({
  children,
  delay = 0,
  duration = DURATION.reveal,
  className,
}: LineRevealProps) {
  return (
    <span className={cn("-my-[0.2em] block overflow-hidden py-[0.2em]", className)}>
      <motion.span
        data-reveal
        className="block"
        initial={{ y: "125%" }}
        animate={{ y: 0 }}
        transition={{ duration, delay, ease: EASE_QUIET }}
      >
        {children}
      </motion.span>
    </span>
  );
}
