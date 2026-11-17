#!/usr/bin/env node

import { readFileSync } from "fs";
import { basename, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { findFilesNamed } from "./lib/walk.mjs";

const root = dirname(fileURLToPath(new URL("../", import.meta.url)));

const namePattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/** @type {string[]} */
const errors = [];

/**
 * @param {string} message
 */
function fail(message) {
  errors.push(message);
  console.error(`ERROR: ${message}`);
}

/** @type {Map<string, string>} */
const names = new Map();

for (const filePath of findFilesNamed(root, "SKILL.md")) {
  const rel = relative(root, filePath);
  const text = readFileSync(filePath, "utf-8");
  const fields = parseFrontmatter(text);

  if (!fields) {
    fail(`${rel}: missing YAML frontmatter`);
    continue;
  }

  if (!fields.name) {
    fail(`${rel}: frontmatter requires "name"`);
  }
  if (!fields.description) {
    fail(`${rel}: frontmatter requires "description"`);
  }

  const dirName = basename(dirname(filePath));
  if (fields.name && fields.name !== dirName) {
    fail(
      `${rel}: frontmatter name "${fields.name}" must match parent directory "${dirName}"`
    );
  }

  if (fields.name && !namePattern.test(fields.name)) {
    fail(
      `${rel}: frontmatter name "${fields.name}" must be lowercase kebab-case`
    );
  }

  if (fields.description && fields.description.trim().length < 10) {
    fail(`${rel}: description is too short (minimum 10 characters)`);
  }

  if (fields.name) {
    const prior = names.get(fields.name);
    if (prior) {
      fail(
        `duplicate skill name "${fields.name}" in ${relative(root, prior)} and ${rel}`
      );
    } else {
      names.set(fields.name, filePath);
    }
  }
}

if (errors.length > 0) {
  console.error(`\nSkill validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`Validated ${names.size} SKILL.md file(s).`);