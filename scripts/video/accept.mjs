// Encodes a verified, viewed clip from .video-staging into public/video.
//
//   node scripts/video/accept.mjs <staged-file> <id> [--start=0] [--duration=8] [--fps=24]
//        [--height=1080] [--crf=28] [--webm-crf=38] [--keyint=8] [--poster-at=0.5] [--max-mb=3]
//
// Writes public/video/<id>.mp4 (H.264), <id>.webm (VP9) and <id>.jpg (poster).
// - No audio, yuv420p, short edge at most --height (never upscaled).
// - A keyframe every --keyint frames: the site scrubs these clips by setting
//   currentTime, and a seek decodes from the previous keyframe. 8 keeps seeks
//   quick; lower is smoother to scrub and larger.
// - --poster-at is seconds into the cut. Use the time the page shows first, so
//   the poster and the first video frame are the same picture.
// Exits 1 if either video is over --max-mb: raise the CRF, shorten the cut or
// lower the height. The manifest and CREDITS.md are edited by hand.
// Needs ffmpeg and ffprobe on PATH.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const [source, id] = args.filter((arg) => !arg.startsWith("--"));
const option = (name, fallback) => Number(args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1] ?? fallback);

if (!source || !id || !/^[a-z0-9-]+$/.test(id)) {
  console.error("Usage: node scripts/video/accept.mjs <staged-file> <id> [--start=0] [--duration=8] [--fps=24] [--height=1080] [--crf=28] [--webm-crf=38] [--keyint=8] [--poster-at=0.5] [--max-mb=3]");
  process.exit(1);
}

const start = option("start", 0);
const duration = option("duration", 8);
const fps = option("fps", 24);
const edge = option("height", 1080);
const crf = option("crf", 28);
const webmCrf = option("webm-crf", 38);
const keyint = option("keyint", 8);
const posterAt = option("poster-at", 0.5);
const maxMb = option("max-mb", 3);

const dir = join("public", "video");
mkdirSync(dir, { recursive: true });
const mp4 = join(dir, `${id}.mp4`);
const webm = join(dir, `${id}.webm`);
const poster = join(dir, `${id}.jpg`);
const frame = join(dir, `${id}.poster.png`);

const run = (command, commandArgs) => execFileSync(command, commandArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

// Short edge down to `edge`, never up; even dimensions for yuv420p.
const scale = `scale='if(gt(iw,ih),-2,min(${edge},iw))':'if(gt(iw,ih),min(${edge},ih),-2)'`;
const cut = ["-ss", String(start), "-t", String(duration), "-i", source];
const filters = ["-vf", `${scale},fps=${fps}`, "-an", "-pix_fmt", "yuv420p"];
const gop = ["-g", String(keyint), "-keyint_min", String(keyint)];

run("ffmpeg", [
  "-v", "error", "-y", ...cut, ...filters,
  "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), ...gop, "-sc_threshold", "0",
  "-movflags", "+faststart", mp4,
]);
run("ffmpeg", [
  "-v", "error", "-y", ...cut, ...filters,
  "-c:v", "libvpx-vp9", "-crf", String(webmCrf), "-b:v", "0", ...gop,
  "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", webm,
]);

// The poster comes from the encoded file, so it is the frame the page shows.
run("ffmpeg", ["-v", "error", "-y", "-ss", String(posterAt), "-i", mp4, "-frames:v", "1", "-update", "1", frame]);
const image = await sharp(frame).jpeg({ quality: 82, mozjpeg: true }).toFile(poster);
rmSync(frame);

const probe = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", mp4]));
const video = probe.streams.find((stream) => stream.codec_type === "video");
const mb = (file) => statSync(file).size / 1048576;

console.log(`${mp4}   ${video.width}x${video.height}  ${Number(probe.format.duration).toFixed(2)}s  ${fps}fps  ${mb(mp4).toFixed(2)} MB`);
console.log(`${webm}  ${mb(webm).toFixed(2)} MB`);
console.log(`${poster}   ${image.width}x${image.height}  ${(image.size / 1024).toFixed(0)} KB`);

const tooBig = [mp4, webm].filter((file) => mb(file) > maxMb);
if (tooBig.length > 0) {
  console.error(`Over ${maxMb} MB: ${tooBig.join(", ")}. Raise --crf/--webm-crf, shorten --duration or lower --height.`);
  process.exit(1);
}
