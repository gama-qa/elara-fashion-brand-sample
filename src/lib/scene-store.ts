import { useSyncExternalStore } from "react";

/**
 * Global scroll and scene state, shared by the DOM (navbar, pages) and the
 * single WebGL canvas.
 *
 * Two kinds of state:
 * - `SceneState`: discrete values that change rarely (route preset, render
 *   mode, header tone). Subscribe with `useSceneState`.
 * - `sceneFrame`: continuous values that change every scroll frame. Mutated in
 *   place and read inside `useFrame`. Never mirror these into React state.
 */

export type ScenePresetId = "home" | "lookbook" | "about";

/** `pending` until capabilities are known on the client. */
export type SceneMode = "pending" | "webgl" | "poster";

/** `overlay`: transparent until the page scrolls. `solid`: always cream. */
export type HeaderTone = "overlay" | "solid";

export type SceneState = {
  mode: SceneMode;
  /** Set by `?scene=on|off`: automatic fallbacks leave the mode alone. */
  modeLocked: boolean;
  /** Set by the current page through <PageSetup>. `null` = no 3D on this route. */
  preset: ScenePresetId | null;
  /**
   * True once any page has asked for a scene. The canvas (and three.js) is
   * only created then, so landing straight on a catalog page loads no WebGL.
   */
  canvasWanted: boolean;
  /** A section with `occludes` fully covers the viewport, so rendering can pause. */
  occluded: boolean;
  /** The page has scrolled past the top. */
  scrolled: boolean;
  headerTone: HeaderTone;
};

const initialState: SceneState = {
  mode: "pending",
  modeLocked: false,
  preset: null,
  canvasWanted: false,
  occluded: false,
  scrolled: false,
  headerTone: "overlay",
};

let state = initialState;
const listeners = new Set<() => void>();

export function getSceneState(): SceneState {
  return state;
}

export function setSceneState(patch: Partial<SceneState>): void {
  let next = state;
  for (const key of Object.keys(patch) as Array<keyof SceneState>) {
    const value = patch[key];
    if (value !== undefined && value !== next[key]) {
      next = { ...next, [key]: value };
    }
  }
  if (next === state) return;
  state = next;
  for (const listener of listeners) listener();
}

export function subscribeScene(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribe to one slice. Return primitives from the selector. */
export function useSceneState<T>(selector: (state: SceneState) => T): T {
  return useSyncExternalStore(
    subscribeScene,
    () => selector(state),
    () => selector(initialState),
  );
}

/** Per-frame scroll values. Written by <ScrollSync>, read in useFrame. */
export const sceneFrame = {
  /** Window scroll position in px. */
  scrollY: 0,
  /** 0–1 over the whole page. */
  progress: 0,
  /** px/s, signed. */
  velocity: 0,
  /**
   * Chapter index plus progress through it: 1.5 = halfway through chapter 1.
   * Chapter n's camera shot is exact when its section's top meets the
   * viewport top. Eased towards `chapterTarget` by GSAP (the scrub).
   */
  chapter: 0,
  /** Where scroll says the chapter is right now, before easing. */
  chapterTarget: 0,
  /** Pointer position over the window, -1 to 1 on each axis, y up. 0 without a mouse. */
  pointerX: 0,
  pointerY: 0,
};
