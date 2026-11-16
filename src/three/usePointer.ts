"use client";

import { useEffect } from "react";
import { sceneFrame } from "@/lib/scene-store";

/**
 * Writes the pointer position into `sceneFrame` (-1 to 1 on each axis, y up).
 * The canvas ignores pointer events (it sits behind the page), so this
 * listens on the window. Mouse only: touch has no resting pointer position.
 */
export function usePointerFrame(): void {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      sceneFrame.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      sceneFrame.pointerY = 1 - (event.clientY / window.innerHeight) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      sceneFrame.pointerX = 0;
      sceneFrame.pointerY = 0;
    };
  }, []);
}
