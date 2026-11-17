# Contributing

This repository is [AliceSaikawa/astack](https://github.com/AliceSaikawa/astack), a fork of [cursor/plugins `pstack/`](https://github.com/cursor/plugins/tree/main/pstack). Upstream licensing remains MIT (Copyright Lauren Tan); see [LICENSE](./LICENSE).

## Quality checks

Run the same checks as CI locally:

```bash
npm run check
```

Requires Node.js 22+, npm, [Bun](https://bun.sh) (for `skills/poteto-mode/scripts` typecheck and tests), and Java 11 or later for the statechart TLC tests.

### TLA+ tools (`tla2tools.jar`) for statechart tests

Statechart TLC integration tests match the pin in `skills/statechart/scripts/run.ts`: **tla2tools 1.7.4** with SHA-256 `936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88`. Java is **Eclipse Temurin 25** in CI (same tool family as the statechart skill’s mise pin).

Download and verify locally:

```bash
node scripts/setup-tla2tools.mjs
export TLA2TOOLS="$PWD/.tools/tla2tools.jar"
npm run check
```

If `TLA2TOOLS` is set, or `.tools/tla2tools.jar` exists after `setup-tla2tools.mjs`, `npm run check` runs all statechart tests (no TLC skips). You can also install via [mise](https://mise.jdx.dev) as the statechart skill does (`java@temurin-25` and the `http:tla2tools[...]@1.7.4` tool in `run.ts`).

### What `npm run check` runs

| Step | Purpose |
|------|---------|
| `scripts/validate-plugin.mjs` | JSON Schema validation of `.cursor-plugin/plugin.json`, version/name sync with `plugin.json`, logo and component paths |
| `scripts/validate-skills.mjs` | Every `SKILL.md` has `name` and `description`; name matches its directory; unique kebab-case names |
| `scripts/validate-links.mjs` | Relative Markdown links resolve to existing files |
| `skills/statechart/scripts` tests | Node test runner over statechart tooling (TLC corpus tests when `TLA2TOOLS` is set) |
| `skills/poteto-mode/scripts` typecheck + tests | Strict TypeScript and Bun tests for watch-pr tooling |

## Pull requests

Open a PR against `main`. Do not merge broken checks; fix root causes rather than silencing validators.