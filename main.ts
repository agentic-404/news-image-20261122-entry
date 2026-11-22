// Entry program for news-image-20261122 (round 1, account @dayuwidayadi).
// The poster is "THE SUNDAY LEDGER — Sunday 22 November 2026": one
// 1024x1024 front page carrying the whole of Sunday 22 November 2026 —
// 35 stories from 7 regions, every one of them first reported that day.
// Three heroes lead it: COP31 nears a deal in Antalya (objections due
// 03:00 GMT, approval session 06:00 GMT, adoption not yet confirmed),
// Iran strikes US bases in Bahrain, and the Sparta II still burns in the
// Gulf of Finland. Every story carries a verification stamp — CONFIRMED
// (two outlets), OFFICIAL (on the record), REPORTED (one outlet), CLAIM
// (one party's claim) — explained by the HOW WE CHECKED legend at the
// foot of the page, and a two-column DATE CHECK names what was left out
// as earlier days' news and what was not confirmed when drawn.
// This program ships one file, "news-image entry.png", to the grader's
// output directory. Before it copies anything it proves the file is the
// poster this competition grades: a genuine PNG, 1024 by 1024 pixels,
// under the 1 MiB cap, complete down to its final IEND chunk, and
// matching the pinned sha256 below. Anything else fails loudly instead
// of entering a wrong image.
//
// The poster was drawn by draw_poster.py (Python + Pillow, no network);
// the drawing script refuses to render if any line would not fit, and
// running it twice produces byte-identical output.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const POSTER_NAME = "news-image entry.png";
const EXPECTED_SHA256 =
  "5ee246253cdb94ecb79c6dae3008c596cb6b3c5e39ca88c3610d36f0ba3802fa";
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;
const MAX_BYTES = 1048576;

function refuse(message: string): never {
  throw new Error("poster check failed: " + message);
}

const posterPath = new URL("./" + POSTER_NAME, import.meta.url);
const bytes = readFileSync(posterPath);

if (bytes.length > MAX_BYTES) {
  refuse("poster is " + bytes.length + " bytes, over the 1 MiB cap");
}
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(pngMagic)) {
  refuse("poster is not a PNG file");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
  refuse("poster is " + width + "x" + height + ", expected 1024x1024");
}
const iend = Buffer.from("IEND");
if (!bytes.subarray(bytes.length - 12).includes(iend)) {
  refuse("poster has no IEND chunk at the end");
}
const actualSha = createHash("sha256").update(bytes).digest("hex");
if (actualSha !== EXPECTED_SHA256) {
  refuse("poster sha256 mismatch");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), bytes);
console.log(
  "wrote entry.png (" + bytes.length + " bytes, sha256 " + actualSha + ")",
);
