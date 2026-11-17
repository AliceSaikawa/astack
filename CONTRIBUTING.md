# Contributing

This repository is [AliceSaikawa/astack](https://github.com/AliceSaikawa/astack), a fork of [cursor/plugins `pstack/`](https://github.com/cursor/plugins/tree/main/pstack). Upstream licensing remains MIT (Copyright Lauren Tan); see [LICENSE](./LICENSE).

## Quality checks

Run the same checks as CI locally:

```bash
npm run check
```

Requires Node.js 22+, npm, and [Bun](https://bun.sh) (for `skills/poteto-mode/scripts` typecheck and tests).

### What `npm run check` runs

| Step | Purpose |
|------|---------|
| `scripts/validate-plugin.mjs` | JSON Schema validation of `.cursor-plugin/plugin.json`, version/name sync with `plugin.json`, logo and component paths |
| `scripts/validate-skills.mjs` | Every `SKILL.md` has `name` and `description`; name matches its directory; unique kebab-case names |
| `scripts/validate-links.mjs` | Relative Markdown links resolve to existing files |
| `skills/statechart/scripts` tests | Node test runner over statechart tooling |
| `skills/poteto-mode/scripts` typecheck + tests | Strict TypeScript and Bun tests for watch-pr tooling |

Some statechart tests skip when optional TLC tooling (`TLA2TOOLS`) is not installed; that is expected and does not fail CI.

## Pull requests

Open a PR against `main`. Do not merge broken checks; fix root causes rather than silencing validators.