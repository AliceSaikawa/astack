#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { dirname, relative, resolve } from "path";
import { fileURLToPath } from "url";
import { walkFiles } from "./lib/walk.mjs";

const root = dirname(fileURLToPath(new URL("../", import.meta.url)));

const markdownLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

/** @type {string[]} */
const errors = [];

/**
 * @param {string} message
 */
function fail(message) {
  errors.push(message);
  console.error(`ERROR: ${message}`);
}

walkFiles(root, (filePath) => {
  if (!filePath.endsWith(".md")) {
    return;
  }

  const sourceRel = relative(root, filePath);
  const text = readFileSync(filePath, "utf-8");

  for (const match of text.matchAll(markdownLinkPattern)) {
    let target = match[1].trim();
    if (!target || target.startsWith("#")) {
      continue;
    }
    target = target.split("#")[0].split("?")[0];
    if (!target) {
      continue;
    }
    if (/^(https?:|mailto:)/i.test(target)) {
      continue;
    }

    const resolved = resolve(dirname(filePath), target);
    if (!existsSync(resolved)) {
      fail(`${sourceRel}: broken link "${match[1]}" (resolved to ${resolved})`);
    }
  }
});

if (errors.length > 0) {
  console.error(`\nLink validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log("Markdown relative links validated successfully.");