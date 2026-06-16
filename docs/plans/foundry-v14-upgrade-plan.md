# Foundry VTT v14 Support — Upgrade Plan

Branch: `foundry-v14-support`

## Context

v14 went **stable on 2026-04-01** (build 14.359). `reactor-sheet` is already written
against the modern namespaced v14 API surface, so the migration is small. The module
uses ApplicationV2 / ActorSheetV2 (via `foundry-vtt-react`'s `ReactActorSheetV2`) and the
`foundry.*` namespace throughout — none of the legacy globals that v14 removed.

## What v14 removed that could have hurt us (audit result: clean)

| v14 removal | Our code | Status |
|---|---|---|
| Global `FilePicker` (use `foundry.applications.apps.FilePicker.implementation`) | `src/applications/reactor-sheet.js` already uses the namespaced form | ✅ |
| ~40 removed global aliases (`ActorSheet`, `Application`, dice terms, canvas sources…) | none used | ✅ |
| Handlebars `{{select}}` / `{{colorPicker}}` helpers | only template is `templates/react-root.hbs`, no helpers | ✅ |
| `foundry.utils.objectsEqual` → `equals()` | we only use `foundry.utils.getProperty` | ✅ |
| DataModel `-=`/`==` special update keys → `DataFieldOperator` | we do plain `document.update({ [attr]: path })` | ✅ |
| Legacy Application V1 | not used — pure V2 | ✅ |

`registerSheet` (`src/main.ts`) and the `_prepareContext` lifecycle are unchanged in v14.

## Changes in this branch

This branch was reset to the `0.1.13` release and rebuilt as two commits:

1. **Adopt foundry-vtt-react** — drop the local React plumbing for the published
   `foundry-vtt-react` npm package (`^0.1.4`); bump `react`/`react-dom` to `^19.2.0` for
   its peer deps. (Everything else added between 0.1.13 and the old `main` HEAD was
   discarded — superseded by outside work / failed UI experiments. Two effect-cleanup
   fixes were salvaged.)
2. **v14 support** (this commit):
   - [x] `module.json`: `compatibility.verified` `"13"` → `"14"` (kept `minimum: "13"` so it
         still installs on v13). Did **not** set `maximum` — leaving it open avoids
         hard-blocking future builds.
   - [x] `src/main.ts`: `Hooks.once` → `foundry.helpers.Hooks.once` (v14 namespace).
   - [x] Confirm `pnpm build` (tsc + vite) passes.

Note: this bumps `compatibility.verified` only, not the semver `version`. Shipping to
users is a separate `pnpm release` step (see "How the repo signals a new version" below).

## Remaining work (not yet done)

1. **Verify `foundry-vtt-react@^0.1.4` on v14.** This is the one third-party layer between
   our code and Foundry (`ReactActorSheetV2`, `devSetup`). Its internal namespace usage
   matters more than ours. Test it on a v14 world; bump the version if a newer one ships.
2. **Smoke test in a v14 world** (use the `local-foundry-docker` setup):
   - Open the sheet on a `character` and `npc`.
   - Edit the portrait → exercises the `FilePicker.implementation` path.
   - Save an actor update; confirm `_prepareContext` context flows.
   - Exercise the OSE settings reads in `ose-config.js` (`ascendingAC`, `initiative`, etc.).
3. **Types:** League `foundry-vtt-types` has **no v14 tag yet** (latest is v13.341.1). Build
   typechecks against v13 types — tolerate minor drift, or add shims to `src/global.d.ts`
   for any v14-only API. No action needed unless a typecheck breaks.
4. **Confirm the `ose` system runs on v14** (relationship dependency) — our sheet reads
   `CONFIG.OSE`, `game.system.id` settings. If OSE isn't v14-ready, the sheet's data is.
5. When verified on a specific build, tighten `compatibility.verified` to e.g. `"14.359"`
   and cut a release (`pnpm release --type=minor`).

---

# How the repo signals a new version to Foundry

Foundry discovers updates via two URLs in `module.json`:
- **`manifest`** → `https://raw.githubusercontent.com/tasandberg/reactor-sheet/main/module.json`.
  Foundry re-fetches this and compares its `version` field to the installed version.
  Because it points at the **`main` branch**, a new version is only visible once an updated
  `module.json` (higher `version` + matching `download`) lands on `main`.
- **`download`** → `.../releases/download/<version>/module.zip`. The zip Foundry pulls to update.

So the update signal is: **the `version` at the manifest URL goes up**, plus a GitHub
release named `<version>` containing `module.zip`. `compatibility.verified` does **not**
trigger updates — it only drives the "verified / untested on this core" warning.

`pnpm release --type=patch|minor|major` (`tools/release.mjs`) automates it: bump `version`,
rewrite `download`, `pnpm build`, zip (`module.json + dist/ + lang/ + templates/ + README`),
commit `Release x.y.z`, push, `gh release create <tag>`.

---

# General: How to upgrade a Foundry module to a new core version

A reusable checklist (this is the process applied above).

### 1. Find out what changed
- Read the official release notes: `foundryvtt.com/releases/<build>` (per-build API
  changes) and the version's KB article.
- Check the **API deprecation tracker** issue on `github.com/foundryvtt/foundryvtt`
  (e.g. #13436 for v14) — it lists every removal and its replacement.
- The community **ApplicationV2 conversion guide** (`foundryvtt.wiki`) for any UI work.
- Foundry's deprecation policy: an API deprecated in vN is typically removed in vN+1 or
  vN+2 (warns in console first). So "deprecated in v13" → audit before v14.

### 2. Audit your code against the removals
Grep for the removed/renamed symbols. Highest-value greps for a sheet module:
```
grep -rnE "new FilePicker|extends ActorSheet\b|extends Application\b" src
grep -rnE "\b(AudioHelper|HexagonalGrid|objectsEqual)\b" src   # removed globals
grep -rn "{{select|{{colorPicker" templates                     # removed hbs helpers
```
Prefer the namespaced `foundry.*` form everywhere — that's the stable target.

### 3. Update the manifest (`module.json`)
- `compatibility.minimum` — lowest core you still support.
- `compatibility.verified` — the build you actually tested (bump per release).
- `compatibility.maximum` — usually **leave unset**; setting it hard-blocks install on
  newer cores. Only set it when you know you're broken on vN+1.
- Remove any legacy fields if present (`minimumCoreVersion`, `compatibleCoreVersion`,
  top-level `name`/`author` strings) — gone since v10.

### 4. Update dependencies
- Bump `foundry-vtt-types` to the tag matching the target core (lags the runtime — may
  not exist yet; shim in a `global.d.ts` meanwhile).
- Check any Foundry-facing libs (here: `foundry-vtt-react`) for a compatible release.
- Confirm relationship systems/modules in the manifest support the target core.

### 5. Build + smoke test
- `pnpm build` (typecheck + bundle).
- Launch a world on the target core (locally via Docker) and exercise the real flows:
  open sheets, file picker, document updates, settings reads.
- Watch the console for deprecation warnings — those are next version's removals.

### 6. Release
- Tighten `verified` to the tested build, bump version, `pnpm release`.
