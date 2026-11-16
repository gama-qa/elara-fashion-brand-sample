/**
 * Tuning for the background layer. Everything you are likely to adjust by eye
 * lives here; what each page shows, and when, is in presets.ts. Changes
 * hot-reload.
 *
 * `footage` is the current direction (real clips with a thin WebGL pass over
 * them). The blocks from `light` down belong to the old procedural set, which
 * only /about and /lookbook still use.
 */
export const sceneConfig = {
  footage: {
    /** Which file a browser that can play both is given. WebM is smaller here; Safari always gets MP4. */
    prefer: "webm" as "webm" | "mp4",
    /** Seconds kept unused at both ends of every clip, so the idle drift below has room. */
    margin: 0.5,
    /** Seconds for the live footage to fade in over its poster once the first frame is decoded. */
    fadeIn: 0.9,

    idle: {
      /** With the page at rest the clip still moves this many seconds either side of its position... 0 = frozen. */
      drift: 0.4,
      /** ...over this many seconds per full cycle. */
      period: 14,
    },

    grain: {
      /** Strength of the film grain, 0–1 of full brightness. 0.03 is barely there, 0.08 is clearly gritty. */
      amount: 0.045,
      /** How many times a second the grain pattern changes. Film runs at 24; lower is calmer. */
      fps: 12,
      /** Grain size in device pixels. */
      size: 1.5,
    },

    displace: {
      /** How far the picture is pushed about, as a fraction of the screen. 0.003 is a faint breathing; 0.01 is visibly liquid. */
      amount: 0.003,
      /** Size of the swells: higher = more, smaller ripples across the screen. */
      scale: 2.2,
      /** How fast the swells travel. */
      speed: 0.05,
      /** Extra push while the page is moving, reached at a scroll speed of one section per second. 0 = scroll speed has no effect. */
      scroll: 0.003,
      /** How uneven the cross-dissolve between two clips is. 0 = a plain, even fade. */
      dissolve: 0.3,
    },

    vignette: {
      /** How much the corners darken, 0–1. */
      amount: 0.3,
      /** Where the darkening starts and where it is full, as a fraction of the way from centre to corner. */
      inner: 0.45,
      outer: 1.1,
    },

    parallax: {
      /** How far the picture shifts against the pointer, as a fraction of the screen. 0 turns it off. */
      amount: 0.005,
      /** How quickly it follows. Lower = lazier. */
      damping: 2,
    },
  },


  render: {
    /** Upper limit for device pixel ratio. 1.5 is sharp enough for matte surfaces; 2 costs about 1.8x the pixels. */
    maxDpr: 1.5,
    /** Vertical field of view in degrees. Lower = flatter, more telephoto. */
    fov: 32,
    /** On windows narrower than this aspect ratio the view widens so the arch stays framed. */
    minAspect: 1,
    /** Seconds for the canvas (or the still fallback) to fade in from cream. */
    fadeIn: 1.6,
    /**
     * Print shader compile logs to the console. Off, because on Windows the
     * Direct3D compiler attaches harmless numeric warnings to three's own
     * shadow shaders on every load. Turn it on while writing or changing a
     * shader (set/Dust.tsx), or a broken shader fails silently.
     */
    checkShaders: true,
    /** Distance in metres where surfaces start and finish dissolving into cream. */
    fogNear: 16,
    fogFar: 38,
  },

  performance: {
    /** Under this frame rate, for most of a 2.5 s measurement, the scene counts as too slow and steps its resolution down. */
    slowFps: 30,
    /** Over this it counts as fine again. */
    fineFps: 50,
    /**
     * Slow measurements in a row, already at the lowest resolution, before the
     * site gives up on WebGL and shows the still fallback. 3 is about 8 seconds.
     */
    patience: 3,
  },

  scroll: {
    /** Seconds the camera takes to catch up with scroll (GSAP scrub). 0 = locked to scroll. */
    scrub: 1.1,
  },

  light: {
    /** Key light strength. Raise for harder contrast between lit and shaded plaster. */
    sun: 2.1,
    /** Ambient fill from the procedural environment. Raise to lighten shadows. */
    fill: 0.62,
    /** Shadow softness in shadow-map texels. */
    shadowRadius: 12,
    /** Shadow map resolution. 1024 is enough because the shadows are blurred. */
    shadowMapSize: 1024,
  },

  idle: {
    /** The key light sways this many radians either side of its position... */
    lightSwing: 0.07,
    /** ...over this many seconds per full cycle. Slow enough to notice only after a while. */
    lightPeriod: 50,
  },

  parallax: {
    /** Camera travel in metres at the edge of the window, sideways and vertical. 0 turns it off. */
    x: 0.16,
    y: 0.08,
    /** How quickly the camera follows the pointer. Lower = lazier. */
    damping: 2,
  },

  dust: {
    /** Number of motes. Keep at or under 300. */
    count: 260,
    /** Mote diameter in metres (they are drawn larger than real dust so they read). */
    size: 0.012,
    /** Peak opacity. Motes only show against shaded surfaces. */
    opacity: 0.6,
    /** Drift speed multiplier. */
    speed: 0.12,
    /** Box the motes live in: centre and size in metres. */
    center: [0, 2.2, -1] as const,
    volume: [7, 4.2, 12] as const,
  },

  haze: {
    /** Fog distances in metres when a shot has haze 1. Closer = the set dissolves sooner. */
    near: 1,
    far: 7.5,
  },

  forms: {
    /** The carved form on the round pedestal. The sphere is split in two so its turning reads. */
    shape: "sphere" as "sphere" | "torus",
    /** Radians the forms turn per chapter of scroll. 0.9 is about 50 degrees per section. */
    turn: 0.9,
  },
};
