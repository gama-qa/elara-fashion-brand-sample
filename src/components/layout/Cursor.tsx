"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

/**
 * Only where there is a real mouse and motion is welcome. Phones, tablets and
 * reduced motion keep the system cursor and never run any of this.
 */
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

type Variant = "hidden" | "dot" | "link" | "view";

/** What the cursor should look like over a given element. */
function variantFor(target: Element | null): Variant {
  if (!target) return "hidden";
  const marked = target.closest("[data-cursor]")?.getAttribute("data-cursor");
  if (marked === "view") return "view";
  // Text fields and zones marked "native" keep the system cursor (caret, zoom).
  if (marked === "native" || target.closest("input, textarea, select")) return "hidden";
  if (target.closest("a, button, label, [role='button']")) return "link";
  return "dot";
}

/**
 * Custom cursor, desktop only: a small circle that follows the pointer, opens
 * into a ring over anything clickable, and into a disc reading "View" over a
 * photograph that can be opened (`data-cursor="view"` on the link or button).
 *
 * The position is written straight to the element on every pointer event, so
 * it never lags the hand; only the shape changes go through React. The system
 * cursor is hidden through the `has-cursor` class on <html> (see globals.css),
 * which is only set while this is running.
 */
export function Cursor() {
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const node = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<Variant>("hidden");

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const last = { x: -100, y: -100, seen: false };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        setVariant("hidden");
        return;
      }
      last.x = event.clientX;
      last.y = event.clientY;
      last.seen = true;
      if (node.current) node.current.style.transform = `translate3d(${last.x}px, ${last.y}px, 0)`;
      setVariant(variantFor(event.target as Element | null));
    };
    // The page can move under a still pointer: re-check what is beneath it.
    const onScroll = () => {
      if (last.seen) setVariant(variantFor(document.elementFromPoint(last.x, last.y)));
    };
    const onLeave = () => setVariant("hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      root.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-cursor");
      setVariant("hidden");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={node}
      aria-hidden
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[70]",
        // Dot and ring invert whatever is beneath them, so they show on cream
        // and on a dark photograph alike. The "View" disc is solid.
        variant !== "view" && "mix-blend-difference",
      )}
      style={{ transform: "translate3d(-100px, -100px, 0)" }}
    >
      <div
        className={cn(
          "flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border transition-[width,height,opacity,background-color,border-color] duration-500 ease-quiet",
          variant === "hidden" && "h-2 w-2 border-transparent bg-white opacity-0",
          variant === "dot" && "h-2 w-2 border-transparent bg-white opacity-100",
          variant === "link" && "h-8 w-8 border-white bg-transparent opacity-100",
          variant === "view" && "h-[4.5rem] w-[4.5rem] border-transparent bg-cream opacity-100",
        )}
        // The one round thing on the site: a cursor has to be a circle.
        style={{ borderRadius: "50%" }}
      >
        <span
          className={cn(
            "font-sans text-label font-medium uppercase tracking-label text-espresso transition-opacity duration-300 ease-quiet",
            variant === "view" ? "opacity-100" : "opacity-0",
          )}
        >
          View
        </span>
      </div>
    </div>
  );
}
