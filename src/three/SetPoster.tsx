"use client";

import { motion } from "motion/react";
import { Photo } from "@/components/media/Photo";
import { EASE_QUIET } from "@/lib/motion/easing";
import type { ScenePresetId } from "@/lib/scene-store";
import { sceneConfig } from "./config";

/**
 * Still renders of our own set, per preset, in two crops. Captured from the
 * live canvas (see CLAUDE.md). Presets without one show the gradient alone.
 */
const posters: Partial<Record<ScenePresetId, { landscape: string; portrait: string }>> = {
  home: { landscape: "set-home-landscape", portrait: "set-home-portrait" },
  lookbook: { landscape: "set-lookbook-landscape", portrait: "set-lookbook-portrait" },
};

/**
 * The fallback when WebGL is off (phones, weak devices, reduced motion): a
 * static picture of the set over a soft cream-to-sand gradient. No canvas,
 * no animation loop. Fades in from cream like the canvas does.
 */
export function SetPoster({ preset }: { preset: ScenePresetId | null }) {
  const poster = preset ? posters[preset] : undefined;

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: preset ? 1 : 0 }}
      transition={{ duration: sceneConfig.render.fadeIn, ease: EASE_QUIET }}
    >
      {/* Stands in for the light falling off down the wall; also what shows
          while the picture loads. */}
      <div className="absolute inset-0 bg-linear-to-b from-cream to-sand" />
      {poster && (
        <>
          <Photo
            id={poster.landscape}
            sizes="100vw"
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
          />
          <Photo
            id={poster.portrait}
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover md:hidden"
          />
        </>
      )}
      {/* Sand veil, following the same haze value the canvas uses. */}
      <div className="absolute inset-0 bg-sand" style={{ opacity: "var(--haze, 0)" }} />
    </motion.div>
  );
}
