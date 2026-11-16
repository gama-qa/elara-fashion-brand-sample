/**
 * The one easing curve ("quiet"): a long, soft deceleration with no overshoot.
 * CSS uses `ease-quiet` (globals.css), GSAP uses the "quiet" CustomEase
 * (gsap.ts), motion uses EASE_QUIET.
 */
export const EASE_QUIET = [0.16, 1, 0.3, 1] as const;

/**
 * The same character, symmetric: slow away, slow to rest. For movements that
 * cross the whole screen (the page wipe), where a fast start reads as a jump.
 * CSS has it as `ease-quiet-in-out`.
 */
export const EASE_QUIET_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Durations in seconds. */
export const DURATION = {
  /** Feedback on hover, focus, toggles. */
  ui: 0.5,
  /** Panels and overlays opening. */
  panel: 0.7,
  /** Content arriving on scroll. */
  reveal: 1.1,
} as const;
