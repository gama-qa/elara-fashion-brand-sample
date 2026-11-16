"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE_QUIET } from "./easing";

/** Default transition for motion components; honours reduced motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.panel, ease: EASE_QUIET }}>
      {children}
    </MotionConfig>
  );
}
