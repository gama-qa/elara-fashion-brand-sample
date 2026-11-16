import manifest from "@/data/video-manifest.json";

/**
 * Background footage. Every clip is a local file listed in
 * src/data/video-manifest.json; pages refer to clips by id. A "reel" says
 * which clips a page shows and how scroll moves through them.
 *
 * No three.js imports here: the page shell reads reels for the still fallback
 * and for the page tint.
 */
export type ManifestVideo = {
  id: string;
  /** Paths under /public. */
  mp4: string;
  webm: string;
  poster: string;
  width: number;
  height: number;
  /** Seconds. */
  duration: number;
  fps: number;
  source: "pexels" | "pixabay";
  sourcePage: string;
  creator: string;
  creatorUrl: string;
  license: string;
  description: string;
  note?: string;
  checkedAt: string;
  usedBy: string[];
};

const videos = manifest.videos as ManifestVideo[];

export function getVideo(id: string): ManifestVideo {
  const video = videos.find((entry) => entry.id === id);
  if (!video) throw new Error(`Video "${id}" is not in src/data/video-manifest.json`);
  return video;
}

/** A value at a chapter. Between two keys the value moves in a straight line. */
type Key = readonly [chapter: number, value: number];

export type ReelClip = {
  /** Id in the video manifest. */
  video: string;
  /** Chapter at which this clip has fully replaced the one before it. Ignored for the first clip. */
  at: number;
  /** How many chapters the cross-dissolve into this clip takes. It ends at `at`. */
  dissolve: number;
  /** Zoom when the clip first shows and when it leaves: a slow push in (or out) over its time on screen. */
  scale: readonly [from: number, to: number];
  /** The point of the picture that stays in view when the window crops it, 0–1 from the left and from the top. */
  focus: readonly [x: number, y: number];
};

/**
 * What a page shows behind its content. Chapters are the page's
 * <SceneSection chapter={n}>: 1.5 is halfway through section 1.
 */
export type Reel = {
  /** In order of appearance. Dissolves must not overlap. */
  clips: readonly ReelClip[];
  /** Chapter at which the last clip reaches its final frame. */
  end: number;
  /**
   * Page colour laid over the footage, 0 (none) to 1 (footage gone). This is
   * what keeps text readable: see the contrast note in CLAUDE.md before
   * lowering it under text.
   */
  wash: readonly Key[];
  /** Page colour: 0 cream, 1 sand. Also turns the header. */
  haze: readonly Key[];
};

export type ReelSample = {
  /** The clip underneath and the clip dissolving in over it. The same index when only one shows. */
  a: number;
  b: number;
  /** 0 = only `a`, 1 = only `b`. */
  mix: number;
  wash: number;
  haze: number;
};

export function createReelSample(): ReelSample {
  return { a: 0, b: 0, mix: 0, wash: 0, haze: 0 };
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function sampleKeys(keys: readonly Key[], chapter: number): number {
  if (keys.length === 0) return 0;
  if (chapter <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [to, value] = keys[i];
    if (chapter <= to) {
      const [from, before] = keys[i - 1];
      return before + (value - before) * smoothstep((chapter - from) / Math.max(to - from, 1e-6));
    }
  }
  return keys[keys.length - 1][1];
}

/** The chapters between which clip `index` is on screen, dissolves included. */
export function clipRange(reel: Reel, index: number): readonly [start: number, end: number] {
  const clip = reel.clips[index];
  const next = reel.clips[index + 1];
  return [index === 0 ? 0 : clip.at - clip.dissolve, next ? next.at : reel.end];
}

/** 0–1 through clip `index`'s time on screen at this chapter. */
export function clipProgress(reel: Reel, index: number, chapter: number): number {
  const [start, end] = clipRange(reel, index);
  return clamp01((chapter - start) / Math.max(end - start, 1e-6));
}

/** Zoom of clip `index` at this chapter. */
export function clipScale(reel: Reel, index: number, chapter: number): number {
  const [from, to] = reel.clips[index].scale;
  return from + (to - from) * clipProgress(reel, index, chapter);
}

/** Which clips show at a chapter, how far the dissolve is, and the page wash and tint. */
export function sampleReel(reel: Reel, chapter: number, out: ReelSample): ReelSample {
  let current = 0;
  for (let i = 1; i < reel.clips.length; i++) {
    if (chapter >= reel.clips[i].at - reel.clips[i].dissolve) current = i;
  }
  const clip = reel.clips[current];

  if (current > 0 && chapter < clip.at) {
    out.a = current - 1;
    out.b = current;
    out.mix = smoothstep(clamp01((chapter - (clip.at - clip.dissolve)) / Math.max(clip.dissolve, 1e-6)));
  } else {
    out.a = current;
    out.b = current;
    out.mix = 0;
  }
  out.wash = sampleKeys(reel.wash, chapter);
  out.haze = sampleKeys(reel.haze, chapter);
  return out;
}

/** Page tint (0 cream to 1 sand) of a reel at a chapter. */
export function reelHaze(reel: Reel, chapter: number): number {
  return sampleKeys(reel.haze, chapter);
}
