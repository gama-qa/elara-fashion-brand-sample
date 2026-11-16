import { Color, MathUtils, type Vector3 } from "three";
import { blendShots, type Shot } from "../presets";

export type ShotSample = {
  position: Vector3;
  target: Vector3;
  /** Time of day, 0–1. */
  time: number;
  /** Light level, 1 = full. */
  light: number;
  /** Sand haze, 0–1. */
  haze: number;
};

/** Samples the shot list at a fractional chapter into `out`. */
export function sampleShots(shots: readonly Shot[], chapter: number, out: ShotSample): void {
  const { a, b, t } = blendShots(shots, chapter);

  out.position.set(
    MathUtils.lerp(a.position[0], b.position[0], t),
    MathUtils.lerp(a.position[1], b.position[1], t),
    MathUtils.lerp(a.position[2], b.position[2], t),
  );
  out.target.set(
    MathUtils.lerp(a.target[0], b.target[0], t),
    MathUtils.lerp(a.target[1], b.target[1], t),
    MathUtils.lerp(a.target[2], b.target[2], t),
  );
  out.time = MathUtils.lerp(a.sun, b.sun, t);
  out.light = MathUtils.lerp(a.light ?? 1, b.light ?? 1, t);
  out.haze = MathUtils.lerp(a.haze ?? 0, b.haze ?? 0, t);
}

// Key light colour through the day. LATE is what "warm" means at the end of
// the hero scroll; push it towards orange for a stronger shift.
const MORNING = new Color("#fff5e8");
const MIDDAY = new Color("#fffaf3");
const LATE = new Color("#ffd6ad");

/**
 * Key light over one day: low from the front-left in the morning, highest at
 * midday, low from the front-right late in the day. `swing` (radians) is added
 * to the horizontal angle for the idle sway. Writes a unit direction (towards
 * the light) and a colour.
 */
export function sunAt(time: number, swing: number, outDirection: Vector3, outColor: Color): void {
  const azimuth = MathUtils.lerp(-1, 1, time) + swing;
  const elevation = 0.3 + 0.45 * Math.sin(Math.PI * time);
  outDirection.set(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.cos(azimuth) * Math.cos(elevation),
  );
  if (time < 0.5) outColor.lerpColors(MORNING, MIDDAY, time / 0.5);
  else outColor.lerpColors(MIDDAY, LATE, (time - 0.5) / 0.5);
}
