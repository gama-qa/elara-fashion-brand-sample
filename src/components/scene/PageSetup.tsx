"use client";

import { useLayoutEffect } from "react";
import { type HeaderTone, type ScenePresetId, setSceneState } from "@/lib/scene-store";

type PageSetupProps = {
  /** Which set configuration the canvas shows. Omit for no 3D on this page. */
  scene?: ScenePresetId | null;
  /** `overlay` for pages that open on the set; `solid` for catalog pages. */
  header?: HeaderTone;
};

/**
 * Each page declares its scene and header tone here instead of the layout
 * reading the pathname. Next keeps visited pages hidden in <Activity>; the
 * cleanup runs when a page hides, and the next page's effect runs after it.
 */
export function PageSetup({ scene = null, header = "overlay" }: PageSetupProps) {
  useLayoutEffect(() => {
    setSceneState({
      preset: scene,
      headerTone: header,
      // One-way: once a page has shown the set, the canvas is kept for the visit.
      ...(scene ? { canvasWanted: true } : {}),
    });
    return () => setSceneState({ preset: null, headerTone: "overlay" });
  }, [scene, header]);

  return null;
}
