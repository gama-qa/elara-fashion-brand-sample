"use client";

import type { Look } from "@/data/lookbook";
import { useSceneState } from "@/lib/scene-store";
import { LookbookStack } from "./LookbookStack";
import { LookbookWalk } from "./LookbookWalk";

/**
 * Picks the lookbook for this device. The server and the first client render
 * always produce the stack (it needs nothing but HTML); once the scene layer
 * has decided this device gets WebGL, it is replaced by the corridor walk.
 * Both sit below the same intro, so the swap happens under the fold.
 */
export function LookbookExperience({ looks }: { looks: Look[] }) {
  const mode = useSceneState((state) => state.mode);
  return mode === "webgl" ? <LookbookWalk looks={looks} /> : <LookbookStack looks={looks} />;
}
