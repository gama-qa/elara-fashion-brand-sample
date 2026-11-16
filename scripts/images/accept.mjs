// Moves a verified, viewed image from .image-staging into public/images.
//
//   node scripts/images/accept.mjs <staged-file> <group>/<id> [--aspect=4:5] [--focus=0.5,0.5] [--zoom=1] [--max=2800]
//
// Applies EXIF rotation, optionally crops to an aspect ratio around a focus
// point (0–1 from the left and top; --zoom above 1 makes a tighter detail
// crop), limits the long edge, and writes
// public/images/<group>/<id>.jpg. Prints the final size for the manifest.
// The manifest and CREDITS.md are edited by hand.

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const [source, target] = args.filter((arg) => !arg.startsWith("--"));
const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];

if (!source || !target || !/^[a-z]+\/[a-z0-9-]+$/.test(target)) {
  console.error("Usage: node scripts/images/accept.mjs <staged-file> <group>/<id> [--aspect=4:5] [--focus=0.5,0.5] [--max=2800]");
  process.exit(1);
}

const maxLongEdge = Number(option("max") ?? 2800);
const output = join("public", "images", `${target}.jpg`);

// Bake in EXIF orientation first so crop maths uses the upright size.
const upright = await sharp(source).rotate().toBuffer();
let image = sharp(upright);
const { width, height } = await image.metadata();

const aspect = option("aspect");
if (aspect) {
  const [aw, ah] = aspect.split(":").map(Number);
  const [fx, fy] = (option("focus") ?? "0.5,0.5").split(",").map(Number);
  const ratio = aw / ah;
  // --zoom=1.4 crops a box 1.4x smaller than the largest that fits (detail crops).
  const zoom = Number(option("zoom") ?? 1);
  const cropWidth = Math.round(Math.min(width, height * ratio) / zoom);
  const cropHeight = Math.round(Math.min(height, width / ratio) / zoom);
  const left = Math.round(Math.min(Math.max(fx * width - cropWidth / 2, 0), width - cropWidth));
  const top = Math.round(Math.min(Math.max(fy * height - cropHeight / 2, 0), height - cropHeight));
  image = image.extract({ left, top, width: cropWidth, height: cropHeight });
}

await mkdir(dirname(output), { recursive: true });
const info = await image
  .resize({ width: maxLongEdge, height: maxLongEdge, fit: "inside", withoutEnlargement: true })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(output);

console.log(`${output}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
