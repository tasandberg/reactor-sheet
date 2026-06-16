# reactor-sheet Foundation (P0 + P1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Vellum style-isolation foundation (scoped tokens, reset, container queries, themes, fonts) and the typed data/view-model seam, so every later reskin chunk builds on a clean, tested base.

**Architecture:** Vendor the Vellum CSS (`docs/design_handoff_foundry_sheet/prototype/{styles,design-system}.css`) into `src/ReactorSheet/styles/vellum/`, scoped to the `.reactor-sheet` window root at build time via a PostCSS prefix step (tokens land on `.reactor-sheet`, never `:root`/`html`, so they don't leak into Foundry and each window themes independently). In parallel, introduce a pure `viewModels/` layer that maps `OSEActor` → typed display structs, isolating presentation from the OSE data shape. Canonical OSE rules stay in `ose-foundry-core`; view-models only reshape/derive for display.

**Tech Stack:** Vite 8, React 19, TypeScript (strict:false app config), Sass (`sass-embedded`), `postcss-prefix-selector`, Vitest (new), Foundry ApplicationV2 via `foundry-vtt-react`.

**Key constraints (verified against the codebase):**
- React mounts into Foundry **light DOM** under a `.reactor-sheet` class (set in `src/applications/reactor-sheet.js` `DEFAULT_OPTIONS.classes`); inner root is `.reactor-sheet-app`.
- Foundry v14 core CSS is in cascade layers; **unlayered CSS wins** — keep Vellum CSS unlayered.
- CSS ships via `module.json` `styles: ["dist/main.css"]`, bundled from `import "./styles/styles.scss"` in `src/ReactorSheet/index.tsx`.
- No PostCSS config exists yet; Sass is the only style toolchain.
- No tests, no test runner exist yet.

---

## File Structure

**Created:**
- `vitest.config.ts` — test runner config (node env).
- `tools/postcss/scope-vellum.mjs` — wrapper exporting a configured `postcss-prefix-selector` for Vellum files.
- `tools/postcss/scope-vellum.test.ts` — unit tests for the scoping transform.
- `postcss.config.mjs` — applies the Vellum scoper only to files under `styles/vellum/`.
- `src/ReactorSheet/styles/vellum/tokens.css` — vendored from prototype `styles.css` (tokens + theme blocks + layout/util classes).
- `src/ReactorSheet/styles/vellum/components.css` — vendored from prototype `design-system.css`.
- `src/ReactorSheet/styles/vellum/fonts.css` — `@font-face` for the 4 families.
- `src/ReactorSheet/styles/vellum/fonts/` — bundled woff2 files (Vite hashes + emits them).
- `src/ReactorSheet/theme.ts` — theme resolver + apply/register helpers.
- `src/ReactorSheet/theme.test.ts` — resolver tests.
- `src/ReactorSheet/viewModels/types.ts` — view-model type definitions.
- `src/ReactorSheet/viewModels/identity.ts` + `.test.ts` — identity view-model.
- `src/ReactorSheet/viewModels/vitals.ts` + `.test.ts` — vitals view-model.
- `src/ReactorSheet/viewModels/__fixtures__/raistlin.ts` — Raistlin Majere test fixture.

**Modified:**
- `package.json` — add `test` script + dev deps.
- `src/ReactorSheet/styles/styles.scss` — scoped reset, container-query root, Vellum ground; drop hardcoded `#222`.
- `src/ReactorSheet/index.tsx` — import the vendored Vellum CSS (fonts → tokens → components) before `styles.scss` so Vite bundles + scopes each file.
- `src/applications/reactor-sheet.js` — apply `data-theme` on render; register client setting.
- `src/main.ts` — call `ReactorSheet.registerSettings()` at init.

---

## Task 1: Stand up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/ReactorSheet/viewModels/smoke.test.ts` (temporary sanity test, deleted in this task)

- [ ] **Step 1: Add deps and test script**

Run:
```bash
cd /Users/tim/dev/foundry-dev/reactor-sheet
pnpm add -D vitest@^3 postcss-prefix-selector postcss
```

- [ ] **Step 2: Add the `test` script to `package.json`**

In `package.json` `scripts`, add after `"lint": "eslint .",`:
```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@src": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tools/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create a temporary smoke test to prove the runner works**

`src/ReactorSheet/viewModels/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `pnpm test`
Expected: PASS — 1 test passed.

- [ ] **Step 6: Delete the smoke test**

Run: `rm src/ReactorSheet/viewModels/smoke.test.ts`

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "test: add vitest runner"
```

---

## Task 2: View-model types + Raistlin Majere fixture

The fixture is the canonical smoke-test character from the handoff. It constructs the same class instances the real OSE actor exposes (`OseDataModelCharacterScores`, `OseDataModelCharacterAC`) so derived getters (`scores.dex.init`, `aac.value`) behave exactly as in Foundry.

> **Deviation (user guidance): no standalone fixture test.** Skip `raistlin.test.ts` — be stingy with tests; don't test fixtures/demo data. The fixture's correctness (AAC 12 / DAC 7, init +1, etc.) is verified through the Task 3/4 selector tests that assert against it. Task 2 ships `types.ts` + `raistlin.ts`, verified by `pnpm build` type-check, then commits.

**Files:**
- Create: `src/ReactorSheet/viewModels/types.ts`
- Create: `src/ReactorSheet/viewModels/__fixtures__/raistlin.ts`
- Create: `src/ReactorSheet/viewModels/__fixtures__/raistlin.test.ts`

- [ ] **Step 1: Write the failing fixture test**

`src/ReactorSheet/viewModels/__fixtures__/raistlin.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { raistlin } from "./raistlin";

describe("raistlin fixture", () => {
  it("matches the handoff smoke-test character", () => {
    expect(raistlin.name).toBe("Raistlin Majere");
    expect(raistlin.system.details.level).toBe(3);
    expect(raistlin.system.scores.dex.mod).toBe(1);
    expect(raistlin.system.scores.dex.init).toBe(1);
    expect(raistlin.system.aac.value).toBe(12); // AAC 12
    expect(raistlin.system.ac.value).toBe(7); // DAC 7
    expect(raistlin.system.hp.value).toBe(8);
    expect(raistlin.system.hp.max).toBe(9);
    expect(raistlin.system.movement.base).toBe(120);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test src/ReactorSheet/viewModels/__fixtures__/raistlin.test.ts`
Expected: FAIL — cannot find module `./raistlin`.

- [ ] **Step 3: Create the view-model types**

`src/ReactorSheet/viewModels/types.ts`:
```ts
export interface IdentityVM {
  name: string;
  img: string;
  classLabel: string;
  level: number;
  alignment: string;
  title: string;
}

export interface VitalsVM {
  hp: { value: number; max: number };
  ac: { ascending: number; descending: number };
  initMod: number;
  hd: string;
  move: number;
}
```

- [ ] **Step 4: Create the fixture**

`src/ReactorSheet/viewModels/__fixtures__/raistlin.ts`:
```ts
import type { OSEActor } from "../../types/types";
import OseDataModelCharacterScores from "../../types/data-model-character-scores";
import OseDataModelCharacterAC from "../../types/data-model-character-ac";

// DEX 13 → standard mod +1; mod=1 (e.g. a ring) yields AAC 12 / DAC 7 per the handoff.
const dexMod = 1;

const scores = new OseDataModelCharacterScores({
  str: { value: 9, bonus: 0 },
  int: { value: 17, bonus: 0 },
  wis: { value: 12, bonus: 0 },
  dex: { value: 13, bonus: 0 },
  con: { value: 10, bonus: 0 },
  cha: { value: 11, bonus: 0 },
});

const aac = new OseDataModelCharacterAC(true, [], dexMod, 1);
const ac = new OseDataModelCharacterAC(false, [], dexMod, 1);

// Partial actor: only the fields view-models read. Cast through unknown because the
// real OSEActor is a full Foundry document with methods we don't exercise in unit tests.
export const raistlin = {
  name: "Raistlin Majere",
  img: "",
  system: {
    aac,
    ac,
    scores,
    details: {
      alignment: "Neutral",
      class: "Magic-User",
      biography: "",
      level: 3,
      notes: "",
      title: "Conjurer",
      xp: { bonus: 0, value: 6420, next: 10000, share: 100 },
    },
    movement: { base: 120, encounter: 40, overland: 24 },
    hp: { value: 8, max: 9, hd: "3d4" },
  },
} as unknown as OSEActor;
```

- [ ] **Step 5: Run the fixture test**

Run: `pnpm test src/ReactorSheet/viewModels/__fixtures__/raistlin.test.ts`
Expected: PASS — all assertions pass (proves the AC/scores class instances derive correctly).

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/viewModels/types.ts src/ReactorSheet/viewModels/__fixtures__/
git commit -m "test: add view-model types and Raistlin Majere fixture"
```

---

## Task 3: Identity view-model

**Files:**
- Create: `src/ReactorSheet/viewModels/identity.ts`
- Create: `src/ReactorSheet/viewModels/identity.test.ts`

- [ ] **Step 1: Write the failing test**

`src/ReactorSheet/viewModels/identity.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { selectIdentity } from "./identity";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectIdentity", () => {
  it("maps actor identity for display", () => {
    const vm = selectIdentity(raistlin);
    expect(vm).toEqual({
      name: "Raistlin Majere",
      img: "",
      classLabel: "Magic-User",
      level: 3,
      alignment: "Neutral",
      title: "Conjurer",
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test src/ReactorSheet/viewModels/identity.test.ts`
Expected: FAIL — cannot find module `./identity`.

- [ ] **Step 3: Write the implementation**

`src/ReactorSheet/viewModels/identity.ts`:
```ts
import type { OSEActor } from "../types/types";
import type { IdentityVM } from "./types";

export function selectIdentity(actor: OSEActor): IdentityVM {
  const { details } = actor.system;
  return {
    name: actor.name,
    img: actor.img,
    classLabel: details.class,
    level: details.level,
    alignment: details.alignment,
    title: details.title,
  };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm test src/ReactorSheet/viewModels/identity.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ReactorSheet/viewModels/identity.ts src/ReactorSheet/viewModels/identity.test.ts
git commit -m "feat: add identity view-model"
```

---

## Task 4: Vitals view-model

**Files:**
- Create: `src/ReactorSheet/viewModels/vitals.ts`
- Create: `src/ReactorSheet/viewModels/vitals.test.ts`

- [ ] **Step 1: Write the failing test**

`src/ReactorSheet/viewModels/vitals.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { selectVitals } from "./vitals";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectVitals", () => {
  it("maps HP, both AC systems, and sub-stats", () => {
    const vm = selectVitals(raistlin);
    expect(vm).toEqual({
      hp: { value: 8, max: 9 },
      ac: { ascending: 12, descending: 7 },
      initMod: 1,
      hd: "3d4",
      move: 120,
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test src/ReactorSheet/viewModels/vitals.test.ts`
Expected: FAIL — cannot find module `./vitals`.

- [ ] **Step 3: Write the implementation**

`src/ReactorSheet/viewModels/vitals.ts`:
```ts
import type { OSEActor } from "../types/types";
import type { VitalsVM } from "./types";

export function selectVitals(actor: OSEActor): VitalsVM {
  const { hp, aac, ac, scores, movement } = actor.system;
  return {
    hp: { value: hp.value, max: hp.max },
    ac: { ascending: aac.value, descending: ac.value },
    initMod: scores.dex.init,
    hd: hp.hd,
    move: movement.base,
  };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm test src/ReactorSheet/viewModels/vitals.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the full suite**

Run: `pnpm test`
Expected: PASS — fixture + identity + vitals tests green.

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/viewModels/vitals.ts src/ReactorSheet/viewModels/vitals.test.ts
git commit -m "feat: add vitals view-model"
```

> **Pattern note for later chunks:** every sheet area gets a `selectXxx(actor): XxxVM` pure function + a `.test.ts` asserting against `raistlin`. Components consume only VMs, never `actor.system.*` directly. Remaining view-models (abilities, saves, attacks, inventory, spells, movement, wealth, xp) are authored in their consuming chunk's plan following this exact shape.

---

## Task 5: PostCSS Vellum-scoping transform

Scopes the vendored Vellum CSS so `:root`→`.reactor-sheet`, `[data-theme="cream"]`→`.reactor-sheet[data-theme="cream"]`, `html`/`body`→`.reactor-sheet`, and every other selector is prefixed with `.reactor-sheet `. Built on `postcss-prefix-selector`.

**Files:**
- Create: `tools/postcss/scope-vellum.mjs`
- Create: `tools/postcss/scope-vellum.test.ts`

- [ ] **Step 1: Write the failing test**

`tools/postcss/scope-vellum.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import postcss from "postcss";
import { scopeVellum } from "./scope-vellum.mjs";

// Simulate a file under styles/vellum/ (the plugin self-filters by path).
const VELLUM = "/proj/src/ReactorSheet/styles/vellum/tokens.css";
const run = (css: string, from = VELLUM) =>
  postcss([scopeVellum]).process(css, { from }).css.replace(/\s+/g, " ").trim();

describe("scopeVellum", () => {
  it("rescopes :root to the sheet root", () => {
    expect(run(":root { --bg: #181612; }")).toBe(".reactor-sheet { --bg: #181612; }");
  });

  it("rescopes the cream theme attribute onto the sheet root", () => {
    expect(run('[data-theme="cream"] { --bg: #efe9d8; }')).toBe(
      '.reactor-sheet[data-theme="cream"] { --bg: #efe9d8; }'
    );
  });

  it("collapses html/body onto the sheet root", () => {
    expect(run("body { margin: 0; }")).toBe(".reactor-sheet { margin: 0; }");
  });

  it("prefixes ordinary component selectors", () => {
    expect(run(".btn { color: red; }")).toBe(".reactor-sheet .btn { color: red; }");
  });

  it("prefixes each selector in a list", () => {
    expect(run(".btn, .tab { color: red; }")).toBe(
      ".reactor-sheet .btn, .reactor-sheet .tab { color: red; }"
    );
  });

  it("leaves non-Vellum files untouched", () => {
    const css = ".btn { color: red; }";
    expect(run(css, "/proj/src/ReactorSheet/styles/styles.scss")).toBe(css);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test tools/postcss/scope-vellum.test.ts`
Expected: FAIL — cannot find module `./scope-vellum.mjs`.

- [ ] **Step 3: Write the transform**

`tools/postcss/scope-vellum.mjs`:
```js
import prefixer from "postcss-prefix-selector";

const ROOT = ".reactor-sheet";

// One global PostCSS plugin (Vite resolves postcss config once, not per file),
// so it self-filters by filePath — only files under styles/vellum/ are scoped.
// postcss-prefix-selector passes filePath as the 4th transform arg.
export const scopeVellum = prefixer({
  prefix: ROOT,
  transform(prefix, selector, prefixedSelector, filePath) {
    if (!filePath || !filePath.includes("/styles/vellum/")) {
      return selector; // not a Vellum file — leave untouched
    }
    if (selector === ":root" || selector === "html" || selector === "body") {
      return prefix;
    }
    if (selector.startsWith("[data-theme")) {
      // e.g. [data-theme="cream"] → .reactor-sheet[data-theme="cream"]
      return `${prefix}${selector}`;
    }
    return prefixedSelector;
  },
});
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm test tools/postcss/scope-vellum.test.ts`
Expected: PASS — all 5 cases.

- [ ] **Step 5: Commit**

```bash
git add tools/postcss/scope-vellum.mjs tools/postcss/scope-vellum.test.ts
git commit -m "feat: add Vellum CSS scoping transform"
```

---

## Task 6: Vendor + scope the Vellum CSS, wire into the build

**Files:**
- Create: `src/ReactorSheet/styles/vellum/tokens.css` (copy of prototype `styles.css`)
- Create: `src/ReactorSheet/styles/vellum/components.css` (copy of prototype `design-system.css`)
- Create: `postcss.config.mjs`
- Modify: `src/ReactorSheet/index.tsx`

- [ ] **Step 1: Vendor the design-system CSS verbatim**

Run:
```bash
cd /Users/tim/dev/foundry-dev/reactor-sheet
mkdir -p src/ReactorSheet/styles/vellum
cp docs/design_handoff_foundry_sheet/prototype/styles.css src/ReactorSheet/styles/vellum/tokens.css
cp docs/design_handoff_foundry_sheet/prototype/design-system.css src/ReactorSheet/styles/vellum/components.css
```

These stay byte-for-byte copies of the contract (portable; a design update is a re-copy). All rescoping happens at build time, not by editing these files.

- [ ] **Step 2: Configure PostCSS (global; the plugin self-filters by path)**

`postcss.config.mjs`:
```js
import { scopeVellum } from "./tools/postcss/scope-vellum.mjs";

// Vite resolves this once and applies to every CSS file. scopeVellum no-ops on
// any file not under styles/vellum/, so SCSS output (already namespaced under
// .reactor-sheet) is never double-prefixed.
export default { plugins: [scopeVellum] };
```

- [ ] **Step 3: Import the vendored CSS from `index.tsx`**

Sass `@import` of a `.css` path emits a *runtime* `@import` that bypasses Vite bundling and PostCSS — so import the CSS as JS modules instead. In `src/ReactorSheet/index.tsx`, replace the line `import "./styles/styles.scss";` (line 2) with:
```tsx
import "./styles/vellum/tokens.css";
import "./styles/vellum/components.css";
import "./styles/styles.scss";
```
(Vite processes each `.css` import as its own module, passing its absolute path to PostCSS as `from` — so the `/styles/vellum/` files get scoped and `styles.scss` does not. The `fonts.css` import is added in Task 7.)

- [ ] **Step 4: Verify the build emits scoped tokens**

Run: `pnpm build`
Expected: build succeeds; `dist/main.css` exists.

- [ ] **Step 5: Confirm scoping landed in the bundle**

Run: `grep -c "\.reactor-sheet" dist/main.css && grep -c "^:root" dist/main.css`
Expected: first count > 0 (many scoped rules); second count `0` (no bare `:root` from Vellum — tokens were rescoped). A bare `:root` count of 0 confirms tokens won't leak into Foundry's global scope.

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/styles/vellum/ postcss.config.mjs src/ReactorSheet/index.tsx
git commit -m "feat: vendor and scope Vellum design-system CSS"
```

---

## Task 7: Bundle fonts

The four families (IM Fell English SC, IM Fell English, Inter, JetBrains Mono) must ship with the module, not hot-link Google Fonts (offline tables, no external requests inside Foundry).

**Files:**
- Create: `src/ReactorSheet/styles/vellum/fonts/` (woff2 files)
- Create: `src/ReactorSheet/styles/vellum/fonts.css`
- Modify: `src/ReactorSheet/index.tsx`

- [ ] **Step 1: Add the font files**

Download the woff2 files (Google Fonts: IM Fell English SC, IM Fell English, Inter, JetBrains Mono) and place them next to the stylesheet so Vite fingerprints and emits them as bundled assets:
```
src/ReactorSheet/styles/vellum/fonts/IMFellEnglishSC-Regular.woff2
src/ReactorSheet/styles/vellum/fonts/IMFellEnglish-Regular.woff2
src/ReactorSheet/styles/vellum/fonts/IMFellEnglish-Italic.woff2
src/ReactorSheet/styles/vellum/fonts/Inter-Variable.woff2
src/ReactorSheet/styles/vellum/fonts/JetBrainsMono-Variable.woff2
```
(Importing from `src` via relative `url()` lets Vite rewrite the paths correctly under whatever base `foundryReact()` sets — unlike `public/`, which needs absolute base-relative URLs.)

- [ ] **Step 2: Declare `@font-face`**

`src/ReactorSheet/styles/vellum/fonts.css`:
```css
@font-face {
  font-family: "IM Fell English SC";
  src: url("./fonts/IMFellEnglishSC-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: "IM Fell English";
  src: url("./fonts/IMFellEnglish-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "IM Fell English";
  src: url("./fonts/IMFellEnglish-Italic.woff2") format("woff2");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  src: url("./fonts/JetBrainsMono-Variable.woff2") format("woff2");
  font-weight: 100 800;
  font-display: swap;
}
```
> `@font-face` has no selector, so the Vellum scoper leaves it untouched even though the file lives under `styles/vellum/`. Font names are document-global by design.

- [ ] **Step 3: Import fonts first in `index.tsx`**

In `src/ReactorSheet/index.tsx`, add as the FIRST style import (above the `tokens.css` import from Task 6):
```tsx
import "./styles/vellum/fonts.css";
```

- [ ] **Step 4: Verify build + asset emission**

Run: `pnpm build && ls dist/assets/ | grep -iE "imfell|inter|jetbrains"`
Expected: build succeeds; fingerprinted font files present in `dist/assets/`.

- [ ] **Step 5: Commit**

```bash
git add src/ReactorSheet/styles/vellum/fonts/ src/ReactorSheet/styles/vellum/fonts.css src/ReactorSheet/index.tsx
git commit -m "feat: bundle Vellum fonts"
```

---

## Task 8: Root styling foundation — reset, container queries, remove legacy ground

Replace the hardcoded `#222` ground and stale token references with Vellum tokens, add a scoped element reset (Foundry styles bare `button`/`input`/`select`/`a`), and set `container-type: inline-size` so layout reflows to window width.

**Files:**
- Modify: `src/ReactorSheet/styles/styles.scss`

- [ ] **Step 1: Rewrite the `.reactor-sheet` base block**

Replace the existing `.reactor-sheet { ... }` and `.reactor-sheet-app { ... }` blocks in `src/ReactorSheet/styles/styles.scss` (keep `@use "util";` at the top; the Vellum CSS is imported from `index.tsx`, not here) with:
```scss
.reactor-sheet {
  overflow: visible;
  height: 100%;
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 16px; // 1rem anchor; never override on <html>
  min-width: 320px; // handoff min footprint
  min-height: 360px;

  // Scoped element reset — Foundry's layered element styles lose to these
  // unlayered rules; classed Vellum controls (.btn/.input/.select) still win.
  button,
  input,
  select,
  textarea {
    all: unset;
    box-sizing: border-box;
    font-family: var(--sans);
  }
  a {
    color: inherit;
    text-decoration: none;
  }

  .controls-dropdown {
    z-index: 3;
  }

  .window-content {
    overflow: hidden;
    backdrop-filter: none;
    padding: 0;

    & > * {
      height: 100%;
    }
  }

  [role="button"] {
    cursor: pointer;
  }

  .window-resize-handle {
    z-index: 5;
  }
}

.reactor-sheet-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--r-sm);
  min-width: 320px;
  container-type: inline-size; // layout reflows to window width, not viewport
  container-name: sheet;
}
```

- [ ] **Step 2: Verify the build still compiles**

Run: `pnpm build`
Expected: build succeeds; no Sass errors about undefined `var()` (CSS custom props are valid at build; they resolve at runtime from the scoped tokens).

- [ ] **Step 3: Verify no stale token names remain in the base block**

Run: `grep -n "#222\|--color-text-primary\|--font-h1" src/ReactorSheet/styles/styles.scss`
Expected: no matches in `styles.scss` (note `_util.scss` still references the old vars — those classes are retired per-area during later chunks, out of scope here).

- [ ] **Step 4: Manual visual check in Foundry**

Use the `local-foundry-docker` skill to launch v14 with the `ose` system, open Raistlin's sheet, confirm: dark `--bg` ground (not `#222`), serif/sans fonts load, no Foundry default button/input chrome bleeding through. Resize the window narrow→wide and confirm the app container is a query container (no reflow yet — layout chunks come later; this only verifies the container context exists via devtools `container-type: inline-size` on `.reactor-sheet-app`).

- [ ] **Step 5: Commit**

```bash
git add src/ReactorSheet/styles/styles.scss
git commit -m "feat: scoped reset, Vellum ground, container-query root"
```

---

## Task 9: Theme resolver + per-sheet theme application

Dark is default; cream is opt-in via `data-theme="cream"` on the `.reactor-sheet` window element. A client setting holds the preference; each sheet applies it on render so it never touches `<html>` (which Foundry owns).

**Files:**
- Create: `src/ReactorSheet/theme.ts`
- Create: `src/ReactorSheet/theme.test.ts`
- Modify: `src/applications/reactor-sheet.js`

- [ ] **Step 1: Write the failing resolver test**

`src/ReactorSheet/theme.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { resolveTheme, THEMES } from "./theme";

describe("resolveTheme", () => {
  it("defaults to dark for unknown/empty input", () => {
    expect(resolveTheme(undefined)).toBe("dark");
    expect(resolveTheme("")).toBe("dark");
    expect(resolveTheme("nonsense")).toBe("dark");
  });

  it("accepts the two valid themes", () => {
    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme("cream")).toBe("cream");
  });

  it("exposes the valid theme list", () => {
    expect(THEMES).toEqual(["dark", "cream"]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test src/ReactorSheet/theme.test.ts`
Expected: FAIL — cannot find module `./theme`.

- [ ] **Step 3: Write the resolver**

`src/ReactorSheet/theme.ts`:
```ts
export const THEMES = ["dark", "cream"] as const;
export type Theme = (typeof THEMES)[number];

export function resolveTheme(value: unknown): Theme {
  return value === "cream" ? "cream" : "dark";
}

/** Apply a theme to a sheet's root element. Dark = no attribute (token default). */
export function applyTheme(root: HTMLElement, theme: Theme): void {
  if (theme === "dark") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm test src/ReactorSheet/theme.test.ts`
Expected: PASS.

- [ ] **Step 5: Register the client setting and apply on render**

In `src/applications/reactor-sheet.js`, add a static registration helper and call `applyTheme` after render. Add the import at the top:
```js
import { resolveTheme, applyTheme } from "@src/ReactorSheet/theme";
```
Add this static method to the `ReactorSheet` class:
```js
  static registerSettings() {
    game.settings.register("reactor-sheet", "theme", {
      name: "Sheet theme",
      hint: "Color theme for the Re-Actor character sheet.",
      scope: "client",
      config: true,
      type: String,
      choices: { dark: "Dark", cream: "Cream" },
      default: "dark",
      onChange: () => {
        for (const app of foundry.applications.instances.values()) {
          if (app instanceof ReactorSheet) app.render();
        }
      },
    });
  }
```
Override `_onRender` to apply the theme to the window element after each render:
```js
  async _onRender(context, options) {
    await super._onRender(context, options);
    const theme = resolveTheme(game.settings.get("reactor-sheet", "theme"));
    applyTheme(this.element, theme);
  }
```

- [ ] **Step 6: Wire the registration into module init**

Find the module's init entry (the file that runs at Foundry boot — `src/main.ts`, which registers the sheet). Add, inside its `Hooks.once("init", ...)` (or equivalent) callback, after the sheet is registered:
```js
ReactorSheet.registerSettings();
```
(If `src/main.ts` imports the sheet class under a different binding, use that binding.)

- [ ] **Step 7: Verify build**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 8: Manual check in Foundry**

Launch via `local-foundry-docker`, open Raistlin's sheet (dark by default), set the "Sheet theme" client setting to Cream → the open sheet re-renders with `data-theme="cream"` on its `.reactor-sheet` element and parchment tokens; other Foundry UI is unaffected.

- [ ] **Step 9: Commit**

```bash
git add src/ReactorSheet/theme.ts src/ReactorSheet/theme.test.ts src/applications/reactor-sheet.js src/main.ts
git commit -m "feat: per-sheet dark/cream theme with client setting"
```

---

## Final verification

- [ ] Run the full suite: `pnpm test` → all green (fixture, identity, vitals, scope-vellum, theme).
- [ ] Run `pnpm build` → succeeds; `dist/main.css` contains scoped Vellum tokens (no bare `:root`), fonts bundled.
- [ ] Run `pnpm lint` → no new errors.
- [ ] In Foundry (v14, `ose` system): Raistlin's sheet shows the Vellum dark ground + fonts; element reset holds; `.reactor-sheet-app` is a container-query container; cream toggle works per-sheet without touching Foundry's UI.

## Notes / deferred to later chunks

- `_util.scss` still references retired tokens (`--color-text-primary`, `--font-h1`); its utility classes are replaced per-area during P3/P4/P6, then the file is deleted in P7.
- Only Identity + Vitals view-models are built here as the pattern exemplar; remaining areas' VMs are authored in their consuming chunk plans.
- `expandable.scss` is orphaned (not imported); left as-is, handled when its consumer is migrated.
- Version mismatch `package.json` 0.1.4 vs `module.json` 0.2.0 noted but out of scope.
