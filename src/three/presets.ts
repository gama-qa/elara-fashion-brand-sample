import { type Reel, reelHaze } from "@/lib/footage";
import type { ScenePresetId } from "@/lib/scene-store";

// This file is imported by the page shell (for --haze and the still
// fallback), so it must stay free of three.js imports: three is only loaded
// with the canvas.

type Vec3 = readonly [number, number, number];

/**
 * One camera stop. Shot n is exact when chapter n's section top meets the
 * viewport top; between shots the camera eases along a straight line.
 */
export type Shot = {
  position: Vec3;
  target: Vec3;
  /** Time of day for the key light: 0 early morning, 0.5 midday, 1 late afternoon (lowest, warmest). */
  sun: number;
  /** Overall light level, 1 = full. Lower values dim both the sun and the fill. Defaults to 1. */
  light?: number;
  /**
   * 0 = clear air and a cream page. 1 = the room fills with sand-coloured
   * haze: background, fog and the header turn sand and the set recedes to
   * soft silhouettes. Defaults to 0.
   */
  haze?: number;
};

/** A page whose background is real footage; the canvas only adds grain, displacement and a vignette. */
export type FootagePreset = {
  set: "footage";
  reel: Reel;
};

/** A page on the old procedural 3D set. Being removed: see CLAUDE.md. */
export type SetPreset = {
  /** Which set the canvas builds: the studio (about) or the gallery corridor (lookbook). */
  set: "studio" | "corridor";
  shots: readonly Shot[];
  /** Fog distances in clear air, in metres. Defaults to `render.fogNear/fogFar` in config. */
  fog?: { near: number; far: number };
  /**
   * The key light and the area its shadows cover travel with the camera.
   * Needed for sets much longer than the 26 m the shadow map spans.
   */
  lightFollowsCamera?: boolean;
};

export type ScenePreset = FootagePreset | SetPreset;

/**
 * The gallery corridor of the lookbook: a run of rooms divided by arched
 * walls, entered at z 0 and left at z -(rooms x depth). Shared by the camera
 * path below and by the geometry in set/Corridor.tsx.
 */
export const corridor = {
  /** One room per look. */
  rooms: 8,
  /** Metres from one arch to the next. Longer = a slower, calmer walk. */
  depth: 9,
  /** Metres between the side walls. */
  width: 7.4,
  /** Height of the walls. The top is open to the light. */
  wallHeight: 7,
};

/**
 * Camera path through the corridor, one stop per chapter:
 *   0        outside, looking in through the first arch
 *   1 to 8   just inside each room, looking down the corridor (the look's
 *            photograph sits over the centre of this view)
 *   9        out of the last arch, into open light
 * Every stop is on the centre line, so each leg passes through an opening.
 * The light moves a little through the day and dims slightly room by room.
 */
function corridorShots(): Shot[] {
  const { rooms, depth } = corridor;
  const shots: Shot[] = [{ position: [0, 1.7, 7.5], target: [0, 1.8, -12], sun: 0.4, light: 1 }];

  for (let room = 0; room < rooms; room++) {
    const z = -room * depth - 1.2;
    // The room's carved form stands to one side; look very slightly towards it.
    const side = room % 2 === 0 ? 1 : -1;
    shots.push({
      position: [-side * 0.25, 1.6, z],
      target: [side * 0.2, 1.55, z - depth - 3],
      sun: 0.4 + room * 0.03,
      light: 1 - room * 0.03,
    });
  }

  const end = -rooms * depth;
  shots.push({ position: [0, 1.7, end - 5], target: [0, 1.9, end - 30], sun: 0.62, light: 1.05 });
  return shots;
}

/*
  Studio layout (metres): cyclorama floor at y 0 curving up to a back wall at
  z -10.5; a wall with an arched opening at z 2.2 (opening 2.8 wide, 4.4 high);
  the round pedestal with its form stands behind the arch at z -4.2, the
  columns and two more forms sit out to the sides.

  Consecutive shots on opposite sides of the arch must cross z 2.2 inside the
  opening (|x| < 1.4, y < 4.4), or the camera passes through the wall.
*/
/*
  Home reel. Chapters are the home page's sections: 0 hero (a tall section:
  one screen of content, then open footage), 1 statement, 2 featured.

    0.00  wall-shadow under a half wash, so the wordmark and labels read
    0.34  the hero text has scrolled away: the wash lifts
    0.48  wall-twigs dissolves in (same wall, real twigs in frame)
    0.64  the statement is about to enter: the wash comes back
    0.86  linen-folds dissolves in behind the paragraph
    1.15  the page washes over to sand for the product section
    1.35  footage gone; plain sand from here on

  Wash under text: espresso text needs about 0.5 over these clips to keep
  4.5:1 on their darkest shadows (measured, see CLAUDE.md). Lower values are
  fine only where no text is on screen.
*/
const homeReel: Reel = {
  clips: [
    { video: "wall-shadow", at: 0, dissolve: 0, scale: [1.04, 1.12], focus: [0.4, 0.4] },
    { video: "wall-twigs", at: 0.6, dissolve: 0.12, scale: [1.1, 1.03], focus: [0.6, 0.3] },
    { video: "linen-folds", at: 1, dissolve: 0.14, scale: [1.03, 1.1], focus: [0.5, 0.5] },
  ],
  end: 1.35,
  wash: [
    [0, 0.5],
    [0.34, 0.5],
    [0.44, 0.12],
    [0.64, 0.12],
    [0.8, 0.62],
    [1.15, 0.62],
    [1.35, 1],
  ],
  haze: [
    [1.15, 0],
    [1.35, 1],
  ],
};

export const scenePresets: Record<ScenePresetId, ScenePreset> = {
  home: { set: "footage", reel: homeReel },
  lookbook: {
    set: "corridor",
    shots: corridorShots(),
    // Closer fog than the studio: the far rooms dissolve, so the corridor has
    // no visible end.
    fog: { near: 7, far: 30 },
    lightFollowsCamera: true,
  },
  about: {
    set: "studio",
    shots: [
      { position: [-5.5, 2.4, 8.5], target: [0, 2.2, 0], sun: 0.15 },
      { position: [0, 1.6, 6], target: [0, 1.4, -3], sun: 0.55 },
    ],
  },
};

/** Zero velocity at both ends: the camera settles into each shot. */
function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** The two shots around a fractional chapter and the eased mix between them. */
export function blendShots(shots: readonly Shot[], chapter: number): { a: Shot; b: Shot; t: number } {
  const last = shots.length - 1;
  const clamped = Math.min(Math.max(chapter, 0), last);
  const i = Math.min(Math.floor(clamped), last);
  const j = Math.min(i + 1, last);
  return { a: shots[i], b: shots[j], t: smootherstep(clamped - i) };
}

/** Haze (0–1) at a fractional chapter of a set's shots. */
export function hazeAt(shots: readonly Shot[], chapter: number): number {
  const { a, b, t } = blendShots(shots, chapter);
  const from = a.haze ?? 0;
  return from + ((b.haze ?? 0) - from) * t;
}

/** Page tint (0 cream to 1 sand) of a preset at a chapter: drives the page's --haze variable. */
export function presetHaze(id: ScenePresetId, chapter: number): number {
  const preset = scenePresets[id];
  return preset.set === "footage" ? reelHaze(preset.reel, chapter) : hazeAt(preset.shots, chapter);
}

/** The reel of a footage page, or null for pages on a 3D set. */
export function presetReel(id: ScenePresetId | null): Reel | null {
  if (!id) return null;
  const preset = scenePresets[id];
  return preset.set === "footage" ? preset.reel : null;
}
