// Verifies downloaded video clips before they are accepted into public/video.
//
//   node scripts/video/verify.mjs [--min=1080] [--frames=<dir>] <file> [<file> ...]
//
// For each file: it exists, its first bytes are a real MP4/MOV or WebM header,
// ffprobe finds a video stream, ffmpeg can decode every frame, and its short
// edge is at least --min pixels. With --frames, five frames spread over the
// clip are written side by side to <dir>/<name>.jpg, so the clip can be looked
// at: watching those frames is a separate, manual step and is not optional.
// Needs ffmpeg and ffprobe on PATH. Exits 1 if any file fails.

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { open, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const args = process.argv.slice(2);
const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
const minShortEdge = Number(option("min") ?? 1080);
const framesDir = option("frames");
const files = args.filter((arg) => !arg.startsWith("--"));

if (files.length === 0) {
  console.error("Usage: node scripts/video/verify.mjs [--min=1080] [--frames=<dir>] <file> [<file> ...]");
  process.exit(1);
}
if (framesDir) mkdirSync(framesDir, { recursive: true });

function sniff(bytes) {
  if (bytes.subarray(4, 8).toString("ascii") === "ftyp") return "mp4";
  if (bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return "webm";
  return null;
}

const run = (command, commandArgs) =>
  execFileSync(command, commandArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });

let failed = false;

for (const file of files) {
  const problems = [];
  let summary = "";
  try {
    const { size } = await stat(file);
    const handle = await open(file, "r");
    const head = Buffer.alloc(12);
    await handle.read(head, 0, 12, 0);
    await handle.close();
    if (!sniff(head)) problems.push("not an MP4/MOV or WebM file (bad header)");

    const probe = JSON.parse(
      run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]),
    );
    const video = probe.streams.find((stream) => stream.codec_type === "video");
    if (!video) throw new Error("no video stream");
    const audio = probe.streams.some((stream) => stream.codec_type === "audio");

    // Phones record sideways and store a rotation: report the size as displayed.
    const rotation = Math.abs(Number(video.side_data_list?.find((side) => "rotation" in side)?.rotation ?? 0));
    const turned = rotation === 90 || rotation === 270;
    const width = turned ? video.height : video.width;
    const height = turned ? video.width : video.height;
    const duration = Number(probe.format.duration);
    const [fpsTop, fpsBottom] = video.avg_frame_rate.split("/").map(Number);
    const fps = fpsBottom ? fpsTop / fpsBottom : fpsTop;

    if (Math.min(width, height) < minShortEdge) {
      problems.push(`short edge ${Math.min(width, height)}px is under ${minShortEdge}px`);
    }
    if (!(duration > 0)) problems.push("no duration");

    // Decoding every frame catches truncated downloads that still have a valid header.
    const decodeErrors = run("ffmpeg", ["-v", "error", "-i", file, "-an", "-f", "null", "-"]).trim();
    if (decodeErrors) problems.push(`decode errors: ${decodeErrors.split("\n")[0]}`);

    summary =
      `${video.codec_name} ${width}x${height} ${duration.toFixed(1)}s ${fps.toFixed(2)}fps ` +
      `${(size / 1048576).toFixed(1)} MB ${(Number(probe.format.bit_rate) / 1e6).toFixed(1)} Mbit/s` +
      `${audio ? " +audio" : " no audio"}`;

    if (framesDir && problems.length === 0) {
      const out = join(framesDir, `${basename(file, extname(file))}.jpg`);
      const cell = width >= height ? "scale=384:-2" : "scale=-2:384";
      // Five frames: 5%, 27%, 50%, 72%, 95% of the clip.
      const inputs = [0.05, 0.275, 0.5, 0.725, 0.95].flatMap((at) => ["-ss", (duration * at).toFixed(2), "-i", file]);
      run("ffmpeg", [
        "-v", "error", "-y", ...inputs,
        "-filter_complex",
        `[0:v]${cell}[a];[1:v]${cell}[b];[2:v]${cell}[c];[3:v]${cell}[d];[4:v]${cell}[e];[a][b][c][d][e]hstack=inputs=5`,
        "-frames:v", "1", "-update", "1", "-q:v", "3", out,
      ]);
      summary += `  frames: ${out}`;
    }
  } catch (error) {
    const message = error instanceof Error ? (error.stderr?.toString().trim() || error.message) : String(error);
    problems.push(message.split("\n")[0]);
  }

  if (problems.length > 0) {
    failed = true;
    console.log(`FAIL  ${file}  ${summary}\n      ${problems.join("\n      ")}`);
  } else {
    console.log(`ok    ${file}  ${summary}`);
  }
}

process.exit(failed ? 1 : 0);
