"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EASE_QUIET_IN_OUT } from "@/lib/motion/easing";

/** Tuning for the wipe between pages, in seconds. */
const wipe = {
  /** The cream panel rising to cover the old page. Navigation waits for this. */
  cover: 0.55,
  /** The panel leaving upwards once the new page is in place. */
  reveal: 0.85,
  /** If the new page never arrives, the panel lifts after this long. */
  giveUp: 6,
};

/**
 * A soft cream wipe between pages. One panel rises from the bottom edge to
 * cover the old page, the route changes underneath it, and the same panel
 * carries on upwards to uncover the new one: a single continuous movement
 * instead of a hard cut.
 *
 * How: clicks on internal links are caught before Next handles them. The
 * panel covers first, then `router.push` runs. When the path changes the
 * panel leaves the tree and AnimatePresence plays its exit over the new page.
 *
 * Not used for: back/forward, new-tab clicks, same-page links, forms, or
 * under reduced motion. Those navigate exactly as usual.
 */
export function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [covering, setCovering] = useState(false);
  // When the path changes the new page is in: drop the panel in the same
  // render (React's "adjust state while rendering" pattern, no effect needed).
  // Clearing it here, not just hiding it, also means going Back to the page
  // the click came from can never bring the panel back.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setCovering(false);
  }
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (reduced) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (a filter, a hash): nothing to wipe between.
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      if (busy.current) return;
      busy.current = true;

      const destination = url.pathname + url.search + url.hash;
      router.prefetch(destination);
      setCovering(true);

      timers.current.push(
        window.setTimeout(() => router.push(destination), wipe.cover * 1000),
        window.setTimeout(() => {
          busy.current = false;
          setCovering(false);
        }, wipe.giveUp * 1000),
      );
    };

    // Capture phase on window: runs before Next's own link handler.
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router, reduced]);

  // The path changed: cancel the give-up timer and allow the next transition.
  useEffect(() => {
    busy.current = false;
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
  }, [pathname]);

  return (
    <AnimatePresence>
      {covering && (
        <motion.div
          key="wipe"
          aria-hidden
          className="fixed inset-0 z-[60] bg-cream"
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: wipe.cover, ease: EASE_QUIET_IN_OUT } }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: wipe.reveal, ease: EASE_QUIET_IN_OUT } }}
        />
      )}
    </AnimatePresence>
  );
}
