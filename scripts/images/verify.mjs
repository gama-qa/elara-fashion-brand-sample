// Verifies downloaded images before they are accepted into public/images.
//
//   node scripts/images/verify.mjs [--min=1600] <file> [<file> ...]
//
// For each file: it exists, its first bytes are a real JPEG/PNG/WebP header,
// sharp can decode it, and its long edge is at least --min pixels.
// Exits 1 if any file fails. Viewing the picture is a separate, manual step.

import { readFile } from "node:fs/promises";
import sharp from "sharp";

const args = process.argv.slice(2);
const minArg = args.find((arg) => arg.startsWith("--min="));
const minLongEdge = minArg ? Number(minArg.split("=")[1]) : 1600;
const files = args.filter((arg) => !arg.startsWith("--"));

if (files.length === 0) {
  console.error("Usage: node scripts/images/verify.mjs [--min=1600] <file> [<file> ...]");
  process.exit(1);
}

function sniff(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") {
    return "webp";
  }
  return null;
}

let failed = false;

for (const file of files) {
  const problems = [];
  let summary = "";
  try {
    const bytes = await readFile(file);
    const type = sniff(bytes);
    if (!type) problems.push("not a JPEG, PNG or WebP file (bad header)");

    // Decoding the pixels catches truncated downloads that still have a valid header.
    const image = sharp(bytes);
    const meta = await image.metadata();
    await image.stats();

    if (type && meta.format !== type) problems.push(`header says ${type}, decoder says ${meta.format}`);
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (longEdge < minLongEdge) problems.push(`long edge ${longEdge}px is under ${minLongEdge}px`);
    summary = `${meta.format} ${meta.width}x${meta.height} ${(bytes.length / 1024).toFixed(0)} KB`;
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }

  if (problems.length > 0) {
    failed = true;
    console.log(`FAIL  ${file}  ${summary}\n      ${problems.join("\n      ")}`);
  } else {
    console.log(`ok    ${file}  ${summary}`);
  }
}

process.exit(failed ? 1 : 0);
