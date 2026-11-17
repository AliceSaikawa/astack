#!/usr/bin/env node

import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @param {string} label
 * @param {string} command
 * @param {string[]} args
 * @param {string} [cwd]
 */
function runStep(label, command, args, cwd = root) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) {
    console.error(`${label} failed: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`${label} failed with exit code ${result.status ?? 1}`);
    process.exit(result.status ?? 1);
  }
}

runStep("validate plugin", "node", ["scripts/validate-plugin.mjs"]);
runStep("validate skills", "node", ["scripts/validate-skills.mjs"]);
runStep("validate links", "node", ["scripts/validate-links.mjs"]);

const statechartDir = resolve(root, "skills/statechart/scripts");
if (!existsSync(resolve(statechartDir, "node_modules"))) {
  runStep("install statechart deps", "npm", ["install"], statechartDir);
}
runStep("statechart tests", "npm", ["test"], statechartDir);

const potetoDir = resolve(root, "skills/poteto-mode/scripts");
if (!existsSync(resolve(potetoDir, "node_modules"))) {
  runStep("install poteto-mode deps", "bun", ["install"], potetoDir);
}
runStep("poteto-mode typecheck", "bun", ["run", "typecheck"], potetoDir);
runStep("poteto-mode tests", "bun", ["test", "watch-pr"], potetoDir);

console.log("\nAll checks passed.");