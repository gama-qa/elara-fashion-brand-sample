import type { SceneMode } from "./scene-store";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export type SceneDecision = {
  mode: Exclude<SceneMode, "pending">;
  /** True when `?scene=on|off` chose the mode. */
  forced: boolean;
};

/**
 * Decides once, on the client, whether this device gets the WebGL set or the
 * still fallback. `?scene=on|off` forces either mode for testing.
 */
export function detectSceneMode(): SceneDecision {
  const param = new URLSearchParams(window.location.search).get("scene");
  if (param === "on") return { mode: "webgl", forced: true };
  if (param === "off") return { mode: "poster", forced: true };
  return { mode: preferredMode(), forced: false };
}

function preferredMode(): SceneDecision["mode"] {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "poster";

  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return "poster";
  if (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 1024) {
    return "poster";
  }
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return "poster";
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return "poster";
  if (!supportsWebGL2()) return "poster";

  return "webgl";
}

function supportsWebGL2(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
