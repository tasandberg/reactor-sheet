# E2E CI for reactor-sheet — design

**Date:** 2026-06-27
**Status:** approved-pending

## Goal

Fold the `ose-foundry-core` `quench-tests-and-ci` Foundry-boot harness into
reactor-sheet, replace its Quench (in-app Mocha) test layer with `@playwright/test`
user-click specs, and cover reactor-sheet's core user flows in GitHub Actions.

## Decisions

| Question | Decision |
|---|---|
| Test layer | **Playwright user-clicks** (`@playwright/test`) — real browser, real DOM |
| Location | **reactor-sheet repo** — self-contained, triggers on this repo's PRs |
| OSE system source | **Pinned NecroticGnome upstream release zip** — `2.2.2` (decoupled, reproducible; bump pin to update) |
| Seed actor | **Create via Foundry API in global-setup** (no binary world fixture) |
| Foundry version | **v14 only** (`felddy/foundryvtt:14`; harness was v13, retargeted to v14) |
| Scope (first PR) | **Smoke + ~7 core flows** |

## Reuse vs. new

Reused from the harness (adapted):
- felddy `felddy/foundryvtt:14` docker boot + `container_cache` for fast re-boot
  (harness pinned v13; retargeted to v14 — verify EULA/`options.json.lock` workarounds
  still apply on v14)
- EULA auto-accept + world-activation polling (`activate-world.mjs` pattern)
- Workflow shape: license secrets (`FOUNDRY_USERNAME`/`PASSWORD`), `pull_request_target`
  + `safe-to-test` fork gate, Foundry-zip + Playwright-browser caching
- Headless WebGL (`--enable-unsafe-swiftshader`), `/api/status` readiness signal

New in reactor-sheet:
- `tools/e2e/setup-data-dir.sh` — assembles `/data`: ose system (pinned release zip),
  built reactor-sheet `dist/` as a module, bare world fixture
- `playwright.config.ts` + `tools/e2e/global-setup.ts` — join as Gamemaster, seed a
  `Test Fighter` **character** actor via `page.evaluate(Actor.create…)`. Because the
  reactor sheet registers with `makeDefault: true` under the `ose` system, any
  `character`/`npc` actor renders with it automatically — no `core.sheetClass` flag needed.
- `tools/e2e/specs/*.spec.ts` + an `openCharacterSheet(page)` helper
- `data-testid` attributes on the interactive elements the specs touch
- `.github/workflows/e2e.yml`

## Data flow

1. Workflow: `pnpm install && pnpm build` (produces `dist/main.js` + `dist/main.css`)
2. `setup-data-dir.sh`:
   - `curl -L https://github.com/NecroticGnome/ose-foundry-core/releases/download/2.2.2/system.zip`
     → unzip to `/data/systems/ose`. The pinned release is `verified: "13"`; rewrite
     `system.json` `compatibility.verified` → `"14"` (CI-only masquerade, same technique the
     harness uses for id/version) so Foundry v14 won't gate the world on system compat.
   - copy reactor-sheet repo (with built `dist/` + `module.json`) → `/data/modules/reactor-sheet`
   - copy bare `fixtures/world/world.json` (system `ose`, coreVersion 14) → `/data/worlds/e2e`
   - create `container_cache`, chown `1000:1000`
3. Boot felddy with `FOUNDRY_WORLD=e2e`, license env
4. `activate-world.mjs --phase eula` → restart container + clear `options.json.lock` →
   `--phase await` until world `active===true`
5. Playwright `global-setup`: join GM, enable reactor-sheet module if needed + reload,
   create the `Test Fighter` actor (with a weapon + some coin + an equippable item) via API
6. Specs: `openCharacterSheet(page)` → click real DOM → assert on rendered DOM + `.chat-message`

## Core specs (first PR)

1. **smoke** — opening the actor renders `.reactor-sheet` root + tablist
2. **tab nav** — Actions / Inventory / Spells / Abilities / Notes switch on click
3. **ability check** — roll a STR check → a chat message naming the ability appears
4. **save** — roll a save → chat message appears
5. **weapon attack** — toggle melee/missile, roll attack → chat message appears
6. **equip/unequip** — toggle equip on an inventory item → equipped state flips
7. **coin edit** — edit a coin field in Wealth → value persists to `actor.system`

(One smoke + ~6 flows. Each spec is independent; `global-setup` provides the seeded actor;
specs that mutate state reset what they touch or tolerate idempotent re-runs.)

## Selectors

Add stable `data-testid`s to the interactive elements the specs touch, alongside the
existing semantic roles (`role="tab"`, `role="row"`). Proposed initial map (exact names
finalized during implementation against the components):

- `tab-{actions|inventory|spells|abilities|notes}`
- `ability-{str|dex|con|int|wis|cha}-roll`
- `save-{death|wands|paralysis|breath|spell}-roll`
- `weapon-attack-{id}`, `attack-mode-toggle`
- `item-equip-{id}`
- `coin-{gp|sp|cp|...}-input`

Dynamic/id-suffixed testids use the embedded item id so specs can target the seeded items.

## Out of scope (first PR)

Drag-reorder inventory, container nesting, spell rest/memorize, edit-character modal,
NPC sheet, theme toggle. Added once the harness runs green.

## Risks / open items

- **Headless canvas + React mount timing** — Foundry's WebGL canvas plus the React
  sheet mount may need explicit waits; specs use polling (`expect.poll` / `waitFor`)
  not fixed delays.
- **Pinned OSE release is v13-verified** — no v14-verified upstream OSE exists yet
  (latest is `2.2.2`, `verified: "13"`). Resolved by rewriting `compatibility.verified`
  → `"14"` in CI (see data flow). Validate early that 2.2.2's data model loads cleanly
  under Foundry v14 and the seeded actor renders before writing feature specs; if the data
  model breaks under v14, fall back to `felddy/foundryvtt:13` for the runner.
- **CI runtime / license serialization** — single license ⇒ `concurrency` group with
  `cancel-in-progress` (inherited from harness). Expect ~15 min/run.
- **module.json `dist/` committed?** repo stopped committing `dist/` (commit 7bf6cb7);
  CI builds it before `setup-data-dir.sh`, so the module copy includes the fresh build.
