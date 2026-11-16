"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/** Gap in px kept between the panel and the header above or the screen edge below. */
const GAP = 24;

/**
 * Keeps the product panel in view while the photographs scroll past
 * (desktop only).
 *
 * Plain `position: sticky; top: <header>` breaks when the panel is taller
 * than the screen, which happens as soon as an accordion section is open: the
 * bottom of the panel stays out of reach until the whole gallery has gone by.
 * So `top` is measured: the panel sticks under the header when it fits, and
 * otherwise scrolls until its bottom edge is on screen and sticks there.
 */
export function StickyPanel({ children, className }: { children: ReactNode; className?: string }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;

    const update = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spacing-header")) * rem || 72;
      const underHeader = header + GAP;
      const bottomOnScreen = window.innerHeight - el.offsetHeight - GAP;
      el.style.top = `${Math.min(underHeader, bottomOnScreen)}px`;
    };

    // The panel's height changes whenever an accordion section opens or closes.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={panel} className={cn("md:sticky", className)}>
      {children}
    </div>
  );
}
