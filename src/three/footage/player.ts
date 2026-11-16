import { LinearFilter, NoColorSpace, VideoTexture } from "three";
import type { ManifestVideo } from "@/lib/footage";
import { sceneConfig } from "../config";

/**
 * One clip as a texture. The video never plays: the page sets its time
 * (`seek`) and each finished seek uploads one frame.
 *
 * The element is not in the document. It is only a decoder; the picture the
 * visitor sees is drawn by the canvas, and the poster <img> under the canvas
 * covers for it until the first frame arrives.
 */
export class ClipPlayer {
  readonly video: HTMLVideoElement;
  readonly texture: VideoTexture;
  /** Width over height of the picture. */
  readonly aspect: number;
  /** Length in seconds. */
  readonly duration: number;
  /** True once a frame has been decoded and can be drawn. */
  hasFrame = false;

  private requested = false;
  /** Seeks closer than half a frame to the current time are skipped. */
  private readonly step: number;
  private readonly end: number;

  constructor(private readonly source: ManifestVideo) {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.disablePictureInPicture = true;
    this.video = video;
    this.aspect = source.width / source.height;
    this.duration = source.duration;
    this.step = 0.5 / source.fps;
    this.end = source.duration - 1 / source.fps;

    // Raw values in, raw values out: the shader works in display space, like
    // the CSS wash over the poster, so the two versions match.
    const texture = new VideoTexture(video);
    texture.colorSpace = NoColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    this.texture = texture;

    video.addEventListener("loadeddata", this.onFrame);
    video.addEventListener("seeked", this.onFrame);
  }

  private onFrame = () => {
    this.hasFrame = true;
    this.texture.needsUpdate = true;
  };

  /** Starts the download. Safe to call every frame. */
  load(): void {
    if (this.requested) return;
    this.requested = true;
    const { video, source } = this;
    const webm = video.canPlayType('video/webm; codecs="vp9"') !== "";
    video.src = webm && sceneConfig.footage.prefer === "webm" ? source.webm : source.mp4;
    video.load();
  }

  /**
   * Moves the clip to `time` seconds. Does nothing while the previous seek is
   * still decoding: piling seeks up is what makes scrubbed video stutter, and
   * the next frame asks again anyway.
   */
  seek(time: number): void {
    const { video } = this;
    if (!this.requested || video.readyState < HTMLMediaElement.HAVE_METADATA || video.seeking) return;
    const target = Math.min(Math.max(time, 0), this.end);
    if (Math.abs(video.currentTime - target) < this.step) return;
    video.currentTime = target;
  }

  dispose(): void {
    const { video } = this;
    video.removeEventListener("loadeddata", this.onFrame);
    video.removeEventListener("seeked", this.onFrame);
    // Releases the decoder and the buffered file.
    video.removeAttribute("src");
    video.load();
    this.texture.dispose();
    this.hasFrame = false;
  }
}
