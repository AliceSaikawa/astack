import YAML from "yaml";

/**
 * @param {string} text
 * @returns {Record<string, string> | null}
 */
export function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) {
    return null;
  }
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    return null;
  }
  const block = text.slice(4, end);
  let parsed;
  try {
    parsed = YAML.parse(block);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  /** @type {Record<string, string>} */
  const fields = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === "string") {
      fields[key] = value;
    } else if (typeof value === "boolean" || typeof value === "number") {
      fields[key] = String(value);
    }
  }
  return fields;
}