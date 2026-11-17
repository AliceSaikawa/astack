#!/usr/bin/env node

import { createHash } from "crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import {
  TLA2TOOLS_SHA256,
  TLA2TOOLS_URL,
  TLA2TOOLS_VERSION,
} from "./tla2tools-pinned.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const toolsDir = resolve(root, ".tools");
const jarPath = resolve(toolsDir, "tla2tools.jar");

/**
 * @param {Buffer} data
 */
function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

if (existsSync(jarPath)) {
  const onDisk = sha256(readFileSync(jarPath));
  if (onDisk === TLA2TOOLS_SHA256) {
    console.log(`tla2tools ${TLA2TOOLS_VERSION} already at ${jarPath}`);
    process.exit(0);
  }
  console.error(`checksum mismatch for ${jarPath}; re-downloading`);
}

mkdirSync(toolsDir, { recursive: true });
const response = await fetch(TLA2TOOLS_URL);
if (!response.ok) {
  console.error(`download failed: HTTP ${response.status} from ${TLA2TOOLS_URL}`);
  process.exit(1);
}
const body = Buffer.from(await response.arrayBuffer());
const digest = sha256(body);
if (digest !== TLA2TOOLS_SHA256) {
  console.error(
    `checksum mismatch for tla2tools ${TLA2TOOLS_VERSION}: expected ${TLA2TOOLS_SHA256}, got ${digest}`,
  );
  process.exit(1);
}
const tempPath = `${jarPath}.tmp`;
writeFileSync(tempPath, body);
renameSync(tempPath, jarPath);
console.log(`installed tla2tools ${TLA2TOOLS_VERSION} at ${jarPath}`);