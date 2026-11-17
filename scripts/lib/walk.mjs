import { readdirSync } from "fs";
import { join } from "path";

/**
 * @param {string} dir
 * @param {(filePath: string) => void} visit
 */
export function walkFiles(dir, visit) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(path, visit);
    } else {
      visit(path);
    }
  }
}

/**
 * @param {string} root
 * @param {string} basename
 * @returns {string[]}
 */
export function findFilesNamed(root, basename) {
  /** @type {string[]} */
  const found = [];
  walkFiles(root, (filePath) => {
    if (filePath.endsWith(`/${basename}`)) {
      found.push(filePath);
    }
  });
  return found;
}