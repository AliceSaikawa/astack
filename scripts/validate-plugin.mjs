#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { resolve, dirname, isAbsolute } from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {string[]} */
const errors = [];

/**
 * @param {string} message
 */
function fail(message) {
  errors.push(message);
  console.error(`ERROR: ${message}`);
}

/**
 * @param {string} path
 * @returns {unknown}
 */
function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

const schema = loadJson(resolve(root, "schemas/plugin.schema.json"));
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateCursorPlugin = ajv.compile(schema);

const cursorPluginPath = resolve(root, ".cursor-plugin/plugin.json");
const legacyPluginPath = resolve(root, "plugin.json");

if (!existsSync(cursorPluginPath)) {
  fail("missing .cursor-plugin/plugin.json");
}

if (!existsSync(legacyPluginPath)) {
  fail("missing plugin.json");
}

if (!existsSync(resolve(root, "LICENSE"))) {
  fail("missing LICENSE");
}

if (errors.length > 0) {
  process.exit(1);
}

const cursorPlugin = /** @type {Record<string, unknown>} */ (
  loadJson(cursorPluginPath)
);
const legacyPlugin = /** @type {Record<string, unknown>} */ (
  loadJson(legacyPluginPath)
);

if (!validateCursorPlugin(cursorPlugin)) {
  fail(".cursor-plugin/plugin.json schema validation failed:");
  for (const err of validateCursorPlugin.errors ?? []) {
    const detail =
      err.keyword === "additionalProperties"
        ? `${err.message}: "${err.params.additionalProperty}"`
        : err.message;
    console.error(`  ${err.instancePath || "/"}: ${detail}`);
  }
}

const legacyName = legacyPlugin.name;
const legacyVersion = legacyPlugin.version;
const legacyLicense = legacyPlugin.license;
const legacyAuthor = /** @type {{ name?: string } | undefined} */ (
  legacyPlugin.author
);

if (typeof legacyName !== "string" || legacyName.length === 0) {
  fail("plugin.json: name is required");
}
if (typeof legacyVersion !== "string" || legacyVersion.length === 0) {
  fail("plugin.json: version is required");
}
if (legacyLicense !== "MIT") {
  fail('plugin.json: license must remain "MIT"');
}
if (legacyAuthor?.name !== "Lauren Tan") {
  fail('plugin.json: author.name must remain "Lauren Tan"');
}

if (cursorPlugin.name !== legacyName) {
  fail(
    `plugin name mismatch: plugin.json "${legacyName}" vs .cursor-plugin/plugin.json "${cursorPlugin.name}"`
  );
}

if (cursorPlugin.version !== legacyVersion) {
  fail(
    `plugin version mismatch: plugin.json "${legacyVersion}" vs .cursor-plugin/plugin.json "${cursorPlugin.version}"`
  );
}

const logo = cursorPlugin.logo;
if (typeof logo === "string" && !/^https?:\/\//i.test(logo)) {
  const logoPath = isAbsolute(logo) ? logo : resolve(root, logo);
  if (!existsSync(logoPath)) {
    fail(`logo file not found: ${logo}`);
  }
}

for (const key of ["skills", "agents"]) {
  const value = cursorPlugin[key];
  const paths =
    typeof value === "string" ? [value] : Array.isArray(value) ? value : [];
  for (const rel of paths) {
    if (typeof rel !== "string") {
      continue;
    }
    const target = resolve(root, rel.replace(/\/?$/, ""));
    if (!existsSync(target)) {
      fail(`${key} path does not exist: ${rel}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`\nPlugin validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log("Plugin manifests validated successfully.");