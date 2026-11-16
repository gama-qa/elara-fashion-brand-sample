"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { detectSceneMode } from "@/lib/capabilities";
import { getSceneState, setSceneState, useSceneState } from "@/lib/scene-store";
import { FootageStills } from "./footage/FootageStills";
import { presetReel } from "./presets";
import { SetPoster } from "./SetPoster";

// Client-only, and loaded after first paint: three.js never blocks the page.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

/**
 * Fixed layer behind all page content. Decides once whether this device gets
 * WebGL or the still fallback.
 *
 * - Footage pages: the poster stills are always there, from the first paint.
 *   With WebGL the canvas draws the live, scrubbed clips over them.
 * - Set pages (the old 3D set): plain cream until the mode is known, then the
 *   canvas or a still of the set.
 *
 * The canvas is created the first time a page asks for a scene, then kept
 * (hidden and paused on catalog pages) so returning is instant. A visit that
 * starts on a catalog page creates no canvas at all.
 */
export function SceneLayer() {
  const mode = useSceneState((s) => s.mode);
  const preset = useSceneState((s) => s.preset);
  const canvasWanted = useSceneState((s) => s.canvasWanted);
  const reel = presetReel(preset);

  useEffect(() => {
    const { mode: detected, forced } = detectSceneMode();
    setSceneState({ mode: detected, modeLocked: forced });

    // If reduced motion is switched on mid-visit, drop to the fallback.
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (media.matches && !getSceneState().modeLocked) setSceneState({ mode: "poster" });
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    // data-scene-mode shows in the inspector which version this visit got:
    // "webgl", "poster" (the fallback) or "pending".
    <div aria-hidden data-scene-mode={mode} className="pointer-events-none fixed inset-0 z-0">
      {reel && <FootageStills reel={reel} />}
      {mode === "webgl" && canvasWanted && <SceneCanvas />}
      {mode === "poster" && !reel && <SetPoster preset={preset} />}
    </div>
  );
}
