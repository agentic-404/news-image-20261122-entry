#!/usr/bin/env node
// news-image-20261122 entry: verify the Sunday Ledger poster and emit it.
// The poster is a genuine 1024x1024 PNG under the 1 MiB cap; this script
// checks its bytes before copying it to the competition output directory.
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const POSTER_NAME = "news-image entry.png";
const EXPECTED_SHA256 =
  "db4f0cf3334ad7f69fcb2e325b050c80291fea76fe3359e7bd42770605e8819c";
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;
const MAX_BYTES = 1024 * 1024;

const here = dirname(fileURLToPath(import.meta.url));
const posterPath = join(here, POSTER_NAME);

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const bytes = readFileSync(posterPath);
const size = statSync(posterPath).size;
if (size !== bytes.length) fail("could not read the whole poster");
if (size > MAX_BYTES) {
  fail(`poster is ${size} bytes, over the ${MAX_BYTES} byte cap`);
}

const sha256 = createHash("sha256").update(bytes).digest("hex");
if (sha256 !== EXPECTED_SHA256) {
  fail(`poster sha256 mismatch: got ${sha256}`);
}

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  fail("poster is not a PNG file");
}
if (bytes.subarray(12, 16).toString("ascii") !== "IHDR") {
  fail("poster has no IHDR chunk");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
  fail(
    `poster is ${width}x${height}, expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`,
  );
}
const iend = bytes.subarray(bytes.length - 12);
if (
  iend.readUInt32BE(0) !== 0 ||
  iend.subarray(4, 8).toString("ascii") !== "IEND"
) {
  fail("poster is missing its IEND chunk");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.png");
copyFileSync(posterPath, outPath);
console.log(`wrote entry.png (${size} bytes, sha256 ${sha256})`);
