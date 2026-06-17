# reactor-sheet — Actions tab, display-only (pass 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the entire Actions tab + persistent chrome (topbar, header, vitals, sub-stats, saves/exploration rail) as the prototype shows it — **read-only**, bound to `actor.system.*` via pure view-models and composed from the P2 Vellum `ui/` kit. No rolls, no edits (those are a later "interactive pass" that wires the OSE system's existing methods).

**Architecture:** Three layers. (1) **View-models** — pure `select*(actor)` functions mapping `actor.system.*` → typed display structs (extends the P1 `identity`/`vitals` pattern; unit-tested against the Raistlin fixture). (2) **Presentational components** — props are view-models, no Foundry/actor/`game` access, each with a Ladle story (P2 convention). (3) **Containers** — `SheetShell` (modified) computes the VMs and fills the P3 `Shell` chrome slots + the Actions body; `ActionsView` composes the Actions sections. The P3 `Shell` gains optional slot props (placeholder fallback preserved). Saves/Exploration render in the left rail when expanded (`.rs-rail-extra`) and in the Actions body when collapsed (`.actions-only`), mirroring the prototype.

**Tech Stack:** React 19, TypeScript (strict:false), Vitest (`node` env), Sass, the vendored Vellum CSS + `ui/` kit from P0/P2, `@ladle/react`.

**Key constraints (verified against the codebase):**
- **Display-only.** No `actor.rollX`, no `item.rollX`, no `actor.update`. Topbar buttons (Rest/Level-Up/Edit/Theme) render but are inert. The interactive pass wires `actor.rollCheck/rollSave/rollExploration/rollHitDice`, `item.rollWeapon` — those already produce styled chat cards + DSN (do not reimplement).
- **VMs stay pure & `game`-free.** Labels are hardcoded EN constants in the VM (the OSE `OSE.scores.*`/`OSE.saves.*` keys localize to these same strings today). This keeps VMs unit-testable and components renderable in Ladle (no `game` global there). i18n via `getLabel` is a later enhancement.
- **Read derived data, never recompute.** Bind `actor.system.scores[k].{value,mod}`, `actor.system.aac.value`/`ac.value`, `actor.system.saves`, `actor.system.exploration`, `actor.system.details.xp`, `actor.system.movement`, `actor.system.treasures`. These are live data-model getters.
- **Saves type quirk:** `OSEActor.system.saves` is typed `Record<OSESave, number>` but the runtime value is `{ value: number }` (legacy `SavingThrows.tsx` reads `saves[k].value`). The saves VM handles both.
- **Stingy tests:** view-models get lean unit tests (pure logic — consistent with P1). Presentational components get **stories, not tests** (P2 convention). Verification = `tsc` + `lint` + `vitest` + `ladle build` + `vite build`.

**Branch:** `reskin/actions-display` off `osc-sheet` (has P0–P3), PR'd into `osc-sheet`.

---

## File Structure

**Created — view-models:**
- `src/ReactorSheet/viewModels/format.ts` — `formatMod(n)` helper.
- `src/ReactorSheet/viewModels/abilities.ts` (+ `.test.ts`) — `selectAbilities`.
- `src/ReactorSheet/viewModels/attacks.ts` (+ `.test.ts`) — `selectAttacks`.
- `src/ReactorSheet/viewModels/saves.ts` (+ `.test.ts`) — `selectSaves`.
- `src/ReactorSheet/viewModels/exploration.ts` (+ `.test.ts`) — `selectExploration`.
- `src/ReactorSheet/viewModels/topbar.ts` (+ `.test.ts`) — `selectTopbar`.
- `src/ReactorSheet/viewModels/wealthMovement.ts` (+ `.test.ts`) — `selectWealthMovement`.

**Created — components (each with `.stories.tsx`):**
- `src/ReactorSheet/components/chrome/Topbar.tsx`
- `src/ReactorSheet/components/chrome/IdentityHeader.tsx`
- `src/ReactorSheet/components/chrome/Vitals.tsx`
- `src/ReactorSheet/components/chrome/SubStats.tsx`
- `src/ReactorSheet/components/chrome/index.ts`
- `src/ReactorSheet/components/actions/AbilityPlaques.tsx`
- `src/ReactorSheet/components/actions/AttacksTable.tsx`
- `src/ReactorSheet/components/actions/SavesExploration.tsx`
- `src/ReactorSheet/components/actions/WealthMovement.tsx`
- `src/ReactorSheet/components/actions/ActionsView.tsx` (container — no story)
- `src/ReactorSheet/components/actions/index.ts`
- `src/ReactorSheet/styles/actions.scss` — display-layout helpers.

**Modified:**
- `src/ReactorSheet/viewModels/types.ts` — add VM interfaces.
- `src/ReactorSheet/viewModels/__fixtures__/raistlin.ts` — add saves/exploration/weapons/treasures.
- `src/ReactorSheet/styles/shell.scss` — add `.actions-only` complement to `.rs-rail-extra`.
- `src/ReactorSheet/styles/styles.scss` — `@use "actions";`.
- `src/ReactorSheet/components/shell/Shell.tsx` — add chrome slot props (placeholder fallback).
- `src/ReactorSheet/components/SheetShell.tsx` — compute VMs, fill slots, mount `ActionsView`.

---

## Conventions

- **VM shape:** `export function select<Area>(actor: OSEActor): <Area>VM` — pure, reads `actor.system.*`, no `game`. Colocated `.test.ts` imports `raistlin` from `__fixtures__/raistlin`.
- **Component shape:** typed props = the VM (or its fields); compose `ui/` primitives; no logic. Story: `export default { title: "<group> / <name>" }` + named exports rendering each state with inline fixture data.
- Run `pnpm exec tsc -b` after each code change; `pnpm test` after VM tasks; `pnpm ladle:build` after component tasks.

---

## Task 1: View-model types + `formatMod` + fixture data

**Files:**
- Create: `src/ReactorSheet/viewModels/format.ts`
- Modify: `src/ReactorSheet/viewModels/types.ts`
- Modify: `src/ReactorSheet/viewModels/__fixtures__/raistlin.ts`
- Create: `src/ReactorSheet/viewModels/format.test.ts`

- [ ] **Step 1: Write `formatMod` test**

Create `src/ReactorSheet/viewModels/format.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatMod } from "./format";

describe("formatMod", () => {
  it("prefixes non-negative with +", () => {
    expect(formatMod(0)).toBe("+0");
    expect(formatMod(2)).toBe("+2");
  });
  it("keeps the native minus sign for negatives", () => {
    expect(formatMod(-3)).toBe("-3");
  });
});
```

- [ ] **Step 2: Run it, expect fail**

Run: `pnpm test -- format` — Expected: FAIL (`formatMod` not found).

- [ ] **Step 3: Implement `formatMod`**

Create `src/ReactorSheet/viewModels/format.ts`:

```ts
/** Format a modifier for display: +0, +2, -3. */
export function formatMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
```

- [ ] **Step 4: Add VM interfaces**

Append to `src/ReactorSheet/viewModels/types.ts`:

```ts
import type { OSESave } from "../types/types";

export interface AbilityVM {
  key: string;
  label: string;
  value: number;
  mod: number;
  modLabel: string;
}

export interface AttackVM {
  id: string;
  name: string;
  img: string;
  kind: "melee" | "missile";
  kindLabel: string;
  hitLabel: string;
  damage: string;
  qualities: string[];
}

export interface SaveVM {
  key: OSESave;
  label: string;
  icon: string;
  target: number;
}

export interface ExplorationVM {
  key: string;
  label: string;
  icon: string;
  inSix: number;
}

export interface TopbarVM {
  level: number;
  nextLevel: number;
  xp: { value: number; next: number };
}

export interface WealthMovementVM {
  coins: { name: string; img: string; qty: number }[];
  move: { encounter: number; explore: number; travel: number };
}
```

- [ ] **Step 5: Extend the Raistlin fixture**

In `src/ReactorSheet/viewModels/__fixtures__/raistlin.ts`, add the bolded fields to the `system` object (saves use the design-handoff values D13/W14/P13/B16/S15; weapons + coins match the prototype). Replace the `system: {` block's closing so it includes:

```ts
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
    saves: {
      death: { value: 13 },
      wand: { value: 14 },
      paralysis: { value: 13 },
      breath: { value: 16 },
      spell: { value: 15 },
    },
    exploration: { ft: 1, ld: 2, od: 2, sd: 1 },
    weapons: [
      {
        name: "Dagger",
        img: "",
        bonus: 0,
        system: {
          damage: "1d4",
          qualities: [{ label: "Thrown", value: "thrown", icon: "fa-bullseye-pointer" }],
          description: "",
          melee: true,
          missile: true,
          equipped: true,
        },
      },
      {
        name: "Quarterstaff",
        img: "",
        bonus: 0,
        system: {
          damage: "1d6",
          qualities: [
            { label: "Two-handed", value: "twohanded", icon: "fa-hand-fist" },
            { label: "Slow", value: "slow", icon: "fa-hourglass" },
          ],
          description: "",
          melee: true,
          missile: false,
          equipped: true,
        },
      },
    ],
    treasures: {
      gp: { name: "GP", img: "", system: { quantity: { value: 42 } } },
      sp: { name: "SP", img: "", system: { quantity: { value: 17 } } },
    },
  },
} as unknown as OSEActor;
```

(The whole object is already `as unknown as OSEActor`, so the looser sub-shapes don't need to satisfy the strict types.)

- [ ] **Step 6: Run format test + typecheck**

Run: `pnpm test -- format` — Expected: PASS (2 tests).
Run: `pnpm exec tsc -b` — Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/ReactorSheet/viewModels/format.ts src/ReactorSheet/viewModels/format.test.ts src/ReactorSheet/viewModels/types.ts src/ReactorSheet/viewModels/__fixtures__/raistlin.ts
git commit -m "feat(vm): formatMod + Actions view-model types + fixture data"
```

---

## Task 2: `abilities` + `attacks` view-models

**Files:**
- Create: `src/ReactorSheet/viewModels/abilities.ts` + `.test.ts`
- Create: `src/ReactorSheet/viewModels/attacks.ts` + `.test.ts`

- [ ] **Step 1: Write abilities test**

Create `src/ReactorSheet/viewModels/abilities.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { selectAbilities } from "./abilities";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectAbilities", () => {
  const vm = selectAbilities(raistlin);

  it("returns the six scores in canonical order", () => {
    expect(vm.map((a) => a.key)).toEqual(["str", "dex", "con", "int", "wis", "cha"]);
  });

  it("reads value + derived mod with a formatted label", () => {
    const int = vm.find((a) => a.key === "int")!;
    expect(int.value).toBe(17);
    expect(int.mod).toBe(2);
    expect(int.modLabel).toBe("+2");
    const str = vm.find((a) => a.key === "str")!;
    expect(str.modLabel).toBe("+0");
  });
});
```

- [ ] **Step 2: Run, expect fail**

Run: `pnpm test -- abilities` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement abilities VM**

Create `src/ReactorSheet/viewModels/abilities.ts`:

```ts
import type { OSEActor } from "../types/types";
import type { AbilityVM } from "./types";
import { formatMod } from "./format";

const ABILITY_ORDER = [
  { key: "str", label: "STR" },
  { key: "dex", label: "DEX" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "WIS" },
  { key: "cha", label: "CHA" },
] as const;

export function selectAbilities(actor: OSEActor): AbilityVM[] {
  const scores = actor.system.scores;
  return ABILITY_ORDER.map(({ key, label }) => {
    const s = scores[key];
    return { key, label, value: s.value, mod: s.mod, modLabel: formatMod(s.mod) };
  });
}
```

- [ ] **Step 4: Run abilities test, expect pass**

Run: `pnpm test -- abilities` — Expected: PASS.

- [ ] **Step 5: Write attacks test**

Create `src/ReactorSheet/viewModels/attacks.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { selectAttacks } from "./attacks";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectAttacks", () => {
  const vm = selectAttacks(raistlin);

  it("expands a melee+missile weapon into two rows", () => {
    const dagger = vm.filter((a) => a.name === "Dagger");
    expect(dagger.map((a) => a.kind)).toEqual(["melee", "missile"]);
  });

  it("uses STR mod for melee hit, DEX mod for missile hit", () => {
    const melee = vm.find((a) => a.name === "Dagger" && a.kind === "melee")!;
    const missile = vm.find((a) => a.name === "Dagger" && a.kind === "missile")!;
    expect(melee.hitLabel).toBe("+0"); // STR 9 → +0
    expect(missile.hitLabel).toBe("+1"); // DEX 13 → +1
    expect(melee.damage).toBe("1d4");
  });

  it("carries quality labels and skips non-equipped weapons", () => {
    const staff = vm.find((a) => a.name === "Quarterstaff")!;
    expect(staff.qualities).toEqual(["Two-handed", "Slow"]);
    expect(vm.every((a) => a.name !== "Quarterstaff" || a.kind === "melee")).toBe(true);
  });
});
```

- [ ] **Step 6: Run, expect fail**

Run: `pnpm test -- attacks` — Expected: FAIL.

- [ ] **Step 7: Implement attacks VM**

Create `src/ReactorSheet/viewModels/attacks.ts`:

```ts
import type { OSEActor } from "../types/types";
import type { AttackVM } from "./types";
import { formatMod } from "./format";

/** Equipped weapons → one row per attack mode (melee/missile). */
export function selectAttacks(actor: OSEActor): AttackVM[] {
  const { weapons, scores } = actor.system;
  const out: AttackVM[] = [];
  for (const w of weapons) {
    if (!w.system.equipped) continue;
    const qualities = (w.system.qualities ?? []).map((q) => q.label);
    const make = (kind: "melee" | "missile"): AttackVM => ({
      id: `${w.name}-${kind}`,
      name: w.name as string,
      img: w.img,
      kind,
      kindLabel: kind === "melee" ? "Melee" : "Missile",
      hitLabel: formatMod(kind === "melee" ? scores.str.mod : scores.dex.mod),
      damage: w.system.damage,
      qualities,
    });
    if (w.system.melee) out.push(make("melee"));
    if (w.system.missile) out.push(make("missile"));
  }
  return out;
}
```

- [ ] **Step 8: Run attacks test + typecheck**

Run: `pnpm test -- attacks` — Expected: PASS.
Run: `pnpm exec tsc -b` — Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/ReactorSheet/viewModels/abilities.ts src/ReactorSheet/viewModels/abilities.test.ts src/ReactorSheet/viewModels/attacks.ts src/ReactorSheet/viewModels/attacks.test.ts
git commit -m "feat(vm): abilities + attacks view-models"
```

---

## Task 3: `saves` + `exploration` view-models

**Files:**
- Create: `src/ReactorSheet/viewModels/saves.ts` + `.test.ts`
- Create: `src/ReactorSheet/viewModels/exploration.ts` + `.test.ts`

- [ ] **Step 1: Write saves test**

Create `src/ReactorSheet/viewModels/saves.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { selectSaves } from "./saves";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectSaves", () => {
  const vm = selectSaves(raistlin);

  it("returns the five saves in D/W/P/B/S order", () => {
    expect(vm.map((s) => s.key)).toEqual(["death", "wand", "paralysis", "breath", "spell"]);
  });

  it("reads the target value (handling the {value} runtime shape)", () => {
    expect(vm.map((s) => s.target)).toEqual([13, 14, 13, 16, 15]);
    expect(vm[0].label).toBe("Death");
  });
});
```

- [ ] **Step 2: Run, expect fail**

Run: `pnpm test -- saves` — Expected: FAIL.

- [ ] **Step 3: Implement saves VM**

Create `src/ReactorSheet/viewModels/saves.ts`:

```ts
import type { OSEActor, OSESave } from "../types/types";
import type { SaveVM } from "./types";

const SAVE_META: { key: OSESave; label: string; icon: string }[] = [
  { key: "death", label: "Death", icon: "fas fa-skull-crossbones" },
  { key: "wand", label: "Wand", icon: "fas fa-magic" },
  { key: "paralysis", label: "Paralysis", icon: "fas fa-bolt" },
  { key: "breath", label: "Breath", icon: "fas fa-wind" },
  { key: "spell", label: "Spell", icon: "fas fa-hat-wizard" },
];

export function selectSaves(actor: OSEActor): SaveVM[] {
  // Runtime value is { value: number } though the type says number — handle both.
  const saves = actor.system.saves as Record<OSESave, number | { value: number }>;
  return SAVE_META.map(({ key, label, icon }) => {
    const raw = saves[key];
    const target = typeof raw === "number" ? raw : raw.value;
    return { key, label, icon, target };
  });
}
```

- [ ] **Step 4: Run saves test, expect pass**

Run: `pnpm test -- saves` — Expected: PASS.

- [ ] **Step 5: Write exploration test**

Create `src/ReactorSheet/viewModels/exploration.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { selectExploration } from "./exploration";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectExploration", () => {
  const vm = selectExploration(raistlin);

  it("returns the four exploration skills with in-six targets", () => {
    expect(vm.map((e) => e.key)).toEqual(["ld", "od", "sd", "ft"]);
    const od = vm.find((e) => e.key === "od")!;
    expect(od.label).toBe("Open Door");
    expect(od.inSix).toBe(2);
  });
});
```

- [ ] **Step 6: Run, expect fail**

Run: `pnpm test -- exploration` — Expected: FAIL.

- [ ] **Step 7: Implement exploration VM**

Create `src/ReactorSheet/viewModels/exploration.ts`:

```ts
import type { OSEActor } from "../types/types";
import type { ExplorationVM } from "./types";

const EXPL_META = [
  { key: "ld", label: "Listen Door", icon: "fas fa-ear" },
  { key: "od", label: "Open Door", icon: "fas fa-door-open" },
  { key: "sd", label: "Find Door", icon: "fas fa-magnifying-glass" },
  { key: "ft", label: "Find Trap", icon: "fas fa-radar" },
] as const;

export function selectExploration(actor: OSEActor): ExplorationVM[] {
  const e = actor.system.exploration;
  return EXPL_META.map(({ key, label, icon }) => ({
    key,
    label,
    icon,
    inSix: e[key],
  }));
}
```

- [ ] **Step 8: Run exploration test + typecheck**

Run: `pnpm test -- exploration` — Expected: PASS.
Run: `pnpm exec tsc -b` — Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/ReactorSheet/viewModels/saves.ts src/ReactorSheet/viewModels/saves.test.ts src/ReactorSheet/viewModels/exploration.ts src/ReactorSheet/viewModels/exploration.test.ts
git commit -m "feat(vm): saves + exploration view-models"
```

---

## Task 4: `topbar` + `wealthMovement` view-models

**Files:**
- Create: `src/ReactorSheet/viewModels/topbar.ts` + `.test.ts`
- Create: `src/ReactorSheet/viewModels/wealthMovement.ts` + `.test.ts`

- [ ] **Step 1: Write topbar test**

Create `src/ReactorSheet/viewModels/topbar.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { selectTopbar } from "./topbar";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectTopbar", () => {
  it("exposes level, next level, and xp progress", () => {
    const vm = selectTopbar(raistlin);
    expect(vm.level).toBe(3);
    expect(vm.nextLevel).toBe(4);
    expect(vm.xp).toEqual({ value: 6420, next: 10000 });
  });
});
```

- [ ] **Step 2: Run, expect fail**

Run: `pnpm test -- topbar` — Expected: FAIL.

- [ ] **Step 3: Implement topbar VM**

Create `src/ReactorSheet/viewModels/topbar.ts`:

```ts
import type { OSEActor } from "../types/types";
import type { TopbarVM } from "./types";

export function selectTopbar(actor: OSEActor): TopbarVM {
  const { level, xp } = actor.system.details;
  return { level, nextLevel: level + 1, xp: { value: xp.value, next: xp.next } };
}
```

- [ ] **Step 4: Run topbar test, expect pass**

Run: `pnpm test -- topbar` — Expected: PASS.

- [ ] **Step 5: Write wealthMovement test**

Create `src/ReactorSheet/viewModels/wealthMovement.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { selectWealthMovement } from "./wealthMovement";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectWealthMovement", () => {
  const vm = selectWealthMovement(raistlin);

  it("lists present coins in GP/SP/CP/PP/EP order, skipping absent", () => {
    expect(vm.coins.map((c) => `${c.name}:${c.qty}`)).toEqual(["GP:42", "SP:17"]);
  });

  it("maps movement to encounter/explore/travel", () => {
    expect(vm.move).toEqual({ encounter: 40, explore: 120, travel: 24 });
  });
});
```

- [ ] **Step 6: Run, expect fail**

Run: `pnpm test -- wealthMovement` — Expected: FAIL.

- [ ] **Step 7: Implement wealthMovement VM**

Create `src/ReactorSheet/viewModels/wealthMovement.ts`:

```ts
import type { OSEActor, OseItem } from "../types/types";
import type { WealthMovementVM } from "./types";

const COIN_ORDER = ["GP", "SP", "CP", "PP", "EP"];

export function selectWealthMovement(actor: OSEActor): WealthMovementVM {
  const treasures = Object.values(actor.system.treasures);
  const coins = COIN_ORDER.map((name) => treasures.find((t) => t.name === name))
    .filter((t): t is OseItem => !!t)
    .map((t) => ({ name: t.name as string, img: t.img, qty: t.system.quantity.value }));
  const m = actor.system.movement;
  return { coins, move: { encounter: m.encounter, explore: m.base, travel: m.overland } };
}
```

- [ ] **Step 8: Run wealthMovement test + typecheck**

Run: `pnpm test -- wealthMovement` — Expected: PASS.
Run: `pnpm exec tsc -b` — Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/ReactorSheet/viewModels/topbar.ts src/ReactorSheet/viewModels/topbar.test.ts src/ReactorSheet/viewModels/wealthMovement.ts src/ReactorSheet/viewModels/wealthMovement.test.ts
git commit -m "feat(vm): topbar + wealthMovement view-models"
```

---

## Task 5: Display-layout CSS

**Files:**
- Create: `src/ReactorSheet/styles/actions.scss`
- Modify: `src/ReactorSheet/styles/styles.scss`
- Modify: `src/ReactorSheet/styles/shell.scss`

- [ ] **Step 1: Create actions.scss**

Create `src/ReactorSheet/styles/actions.scss`:

```scss
// Display-layout helpers for the Actions tab + chrome (pass 1).
// Pure layout on top of the Vellum component classes; colors come from tokens.

// --- topbar ---
.rs-topbar-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.rs-topbar-lv { display: flex; flex-direction: column; line-height: 1; }
.rs-topbar-lv b { font-family: var(--display); font-size: var(--fs-lg, 18px); }
.rs-topbar-lv span { font-size: var(--fs-3xs, 10px); color: var(--text-mute, #8a8270); }
.rs-topbar-xp { flex: 1; min-width: 120px; display: flex; flex-direction: column; gap: 3px; }
.rs-topbar-xp .xp-val { font-family: var(--mono); font-size: var(--fs-2xs, 11px); color: var(--text-mute, #8a8270); }
.rs-topbar-actions { display: flex; gap: 6px; flex-wrap: wrap; }

// --- identity header ---
.rs-identity { display: flex; gap: 14px; align-items: center; }
.rs-identity .portrait {
  width: 96px; height: 96px; flex: 0 0 auto;
  border: 1px solid var(--border, #3a342c); border-radius: var(--r-md, 6px);
  object-fit: cover; background: var(--surface, #23201a);
}
.rs-identity .ident { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.rs-identity .name { font-family: var(--display); font-size: var(--fs-4xl, 28px); line-height: 1; }
.rs-identity .sub { font-family: var(--display); color: var(--gold); font-size: var(--fs-md, 15px); }

// --- vitals ---
.rs-vitals { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.rs-vitals .hp .val { color: var(--crimson, #b54b4b); }
.rs-vitals .ac .val { color: var(--teal, #2f8f8f); }

// --- sub-stats ---
.rs-substats { display: flex; flex-direction: column; gap: 4px; margin-top: 12px; }
.rs-substat { display: flex; justify-content: space-between; gap: 8px; font-size: var(--fs-sm, 13px); }
.rs-substat .k { color: var(--text-mute, #8a8270); }
.rs-substat .v { font-family: var(--mono); }

// --- abilities ---
.rs-abilities { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
@container sheet (min-width: 470px) { .rs-abilities { grid-template-columns: repeat(6, 1fr); } }
.rs-abilities .kv-card { align-items: center; text-align: center; gap: 4px; }
.rs-abilities .rs-mod { align-self: center; }

// --- attacks + tables ---
.rs-weapon { display: flex; align-items: center; gap: 8px; }
.rs-weapon img { width: 28px; height: 28px; border-radius: var(--r-sm, 4px); background: var(--surface, #23201a); }
.rs-weapon .wname { font-weight: 600; }
.rs-quals { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px; }

// --- wealth + movement ---
.rs-wm { display: flex; flex-wrap: wrap; gap: 22px; margin-top: 6px; }
.rs-wm .grp { display: flex; flex-direction: column; gap: 4px; }
.rs-coins, .rs-moves { display: flex; gap: 12px; flex-wrap: wrap; font-size: var(--fs-sm, 13px); }
.rs-coin { display: flex; align-items: center; gap: 4px; }
.rs-coin img { width: 14px; height: 14px; }
.rs-coin .v { font-family: var(--mono); }
.rs-move .k { color: var(--text-mute, #8a8270); margin-right: 4px; }
.rs-move .v { font-family: var(--mono); }

// section spacing in the Actions body
.rs-section + .rs-section { margin-top: 20px; }
```

- [ ] **Step 2: Register actions.scss**

In `src/ReactorSheet/styles/styles.scss`, change the top:

```scss
@use "util";
@use "shell";
```

to:

```scss
@use "util";
@use "shell";
@use "actions";
```

- [ ] **Step 3: Add `.actions-only` complement in shell.scss**

In `src/ReactorSheet/styles/shell.scss`, find the line:

```scss
.rs-rail-extra { display: none; }
```

and replace it with:

```scss
.rs-rail-extra { display: none; }
// Saves & Exploration show inside the Actions body when collapsed; the matching
// @container rule below hides them once they relocate into the expanded rail.
.actions-only { display: block; }
```

Then inside the existing `@container sheet (min-width: 760px) { ... }` block, find:

```scss
  .rs-rail-extra { display: block; margin-top: 12px; }
```

and replace it with:

```scss
  .rs-rail-extra { display: block; margin-top: 12px; }
  .actions-only { display: none; }
```

- [ ] **Step 4: Build to verify Sass compiles**

Run: `pnpm build` — Expected: PASS, no Sass errors.
Run: `grep -c 'rs-abilities' dist/main.css` — Expected: ≥1.
Then discard the rebuilt bundle (branch stays source-only): `git checkout -- dist/`

- [ ] **Step 5: Commit**

```bash
git add src/ReactorSheet/styles/actions.scss src/ReactorSheet/styles/styles.scss src/ReactorSheet/styles/shell.scss
git commit -m "feat(actions): display-layout CSS + actions-only/rail-extra toggle"
```

---

## Task 6: Chrome components — Topbar + IdentityHeader

**Files:**
- Create: `src/ReactorSheet/components/chrome/Topbar.tsx` + `.stories.tsx`
- Create: `src/ReactorSheet/components/chrome/IdentityHeader.tsx` + `.stories.tsx`

- [ ] **Step 1: Topbar component**

Create `src/ReactorSheet/components/chrome/Topbar.tsx`:

```tsx
import type { TopbarVM } from "../../viewModels/types";
import { ProgressBar } from "../ui/ProgressBar";
import { Button } from "../ui/Button";

type Props = { vm: TopbarVM };

/** Persistent topbar: level, XP progress, next level. Buttons are inert in the
 *  display pass (wired in the interactive pass). */
export function Topbar({ vm }: Props) {
  return (
    <div className="rs-topbar-inner">
      <div className="rs-topbar-lv">
        <b>Lv {vm.level}</b>
        <span>{vm.xp.value.toLocaleString()}</span>
      </div>
      <div className="rs-topbar-xp">
        <ProgressBar value={vm.xp.value} max={vm.xp.next} color="var(--gold)" />
        <span className="xp-val">
          {vm.xp.value.toLocaleString()} / {vm.xp.next.toLocaleString()} XP
        </span>
      </div>
      <div className="rs-topbar-lv">
        <b>Lv {vm.nextLevel}</b>
        <span>{vm.xp.next.toLocaleString()}</span>
      </div>
      <div className="rs-topbar-actions">
        <Button size="sm" variant="ghost" disabled>Rest</Button>
        <Button size="sm" variant="ghost" disabled>Level Up</Button>
        <Button size="sm" variant="ghost" disabled>Edit</Button>
        <Button size="sm" variant="ghost" disabled>Theme</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Topbar story**

Create `src/ReactorSheet/components/chrome/Topbar.stories.tsx`:

```tsx
import { Topbar } from "./Topbar";

export default { title: "Chrome / Topbar" };

export const Default = () => (
  <Topbar vm={{ level: 3, nextLevel: 4, xp: { value: 6420, next: 10000 } }} />
);
```

- [ ] **Step 3: IdentityHeader component**

Create `src/ReactorSheet/components/chrome/IdentityHeader.tsx`:

```tsx
import type { IdentityVM } from "../../viewModels/types";

type Props = { vm: IdentityVM };

/** Portrait + name + "Class Level · Alignment". Read-only (FilePicker is later). */
export function IdentityHeader({ vm }: Props) {
  return (
    <div className="rs-identity">
      <img className="portrait" src={vm.img || undefined} alt={vm.name} />
      <div className="ident">
        <div className="name">{vm.name}</div>
        <div className="sub">
          {vm.classLabel} {vm.level} · {vm.alignment}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: IdentityHeader story**

Create `src/ReactorSheet/components/chrome/IdentityHeader.stories.tsx`:

```tsx
import { IdentityHeader } from "./IdentityHeader";

export default { title: "Chrome / IdentityHeader" };

export const Default = () => (
  <IdentityHeader
    vm={{ name: "Eldra Vey", img: "", classLabel: "Magic-User", level: 3, alignment: "Neutral", title: "Conjurer" }}
  />
);
```

- [ ] **Step 5: Typecheck + stories build**

Run: `pnpm exec tsc -b` — Expected: PASS.
Run: `pnpm ladle:build` — Expected: PASS (Chrome / Topbar + IdentityHeader present).

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/components/chrome/Topbar.tsx src/ReactorSheet/components/chrome/Topbar.stories.tsx src/ReactorSheet/components/chrome/IdentityHeader.tsx src/ReactorSheet/components/chrome/IdentityHeader.stories.tsx
git commit -m "feat(chrome): Topbar + IdentityHeader (display)"
```

---

## Task 7: Chrome components — Vitals + SubStats + barrel

**Files:**
- Create: `src/ReactorSheet/components/chrome/Vitals.tsx` + `.stories.tsx`
- Create: `src/ReactorSheet/components/chrome/SubStats.tsx` + `.stories.tsx`
- Create: `src/ReactorSheet/components/chrome/index.ts`

- [ ] **Step 1: Vitals component**

Create `src/ReactorSheet/components/chrome/Vitals.tsx`:

```tsx
import type { VitalsVM } from "../../viewModels/types";
import { KvCard } from "../ui/Card";
import { Stamp } from "../ui/Stamp";

type Props = { vm: VitalsVM };

/** HP (crimson) + AC (teal) boxes. Read-only (steppers/AC-toggle are later). */
export function Vitals({ vm }: Props) {
  return (
    <div className="rs-vitals">
      <KvCard className="hp">
        <div className="head"><Stamp>Hit Points</Stamp></div>
        <div className="val">
          {vm.hp.value}
          <span className="unit">/ {vm.hp.max}</span>
        </div>
      </KvCard>
      <KvCard className="ac">
        <div className="head"><Stamp>Armor Class</Stamp></div>
        <div className="val">{vm.ac.ascending}</div>
        <div className="breakdown">AAC · DAC {vm.ac.descending}</div>
      </KvCard>
    </div>
  );
}
```

- [ ] **Step 2: Vitals story**

Create `src/ReactorSheet/components/chrome/Vitals.stories.tsx`:

```tsx
import { Vitals } from "./Vitals";

export default { title: "Chrome / Vitals" };

export const Default = () => (
  <Vitals vm={{ hp: { value: 8, max: 9 }, ac: { ascending: 12, descending: 7 }, initMod: 1, hd: "3d4", move: 120 }} />
);
```

- [ ] **Step 3: SubStats component**

Create `src/ReactorSheet/components/chrome/SubStats.tsx`:

```tsx
import type { VitalsVM } from "../../viewModels/types";
import { formatMod } from "../../viewModels/format";

type Props = { vm: VitalsVM };

/** Init · HD · Move readout. Read-only (HD roll is later). */
export function SubStats({ vm }: Props) {
  const rows: { k: string; v: string }[] = [
    { k: "Init", v: formatMod(vm.initMod) },
    { k: "HD", v: vm.hd },
    { k: "Move", v: `${vm.move}′` },
  ];
  return (
    <div className="rs-substats">
      {rows.map((r) => (
        <div className="rs-substat" key={r.k}>
          <span className="k">{r.k}</span>
          <span className="v">{r.v}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: SubStats story**

Create `src/ReactorSheet/components/chrome/SubStats.stories.tsx`:

```tsx
import { SubStats } from "./SubStats";

export default { title: "Chrome / SubStats" };

export const Default = () => (
  <SubStats vm={{ hp: { value: 8, max: 9 }, ac: { ascending: 12, descending: 7 }, initMod: 1, hd: "3d4", move: 120 }} />
);
```

- [ ] **Step 5: Barrel**

Create `src/ReactorSheet/components/chrome/index.ts`:

```ts
export { Topbar } from "./Topbar";
export { IdentityHeader } from "./IdentityHeader";
export { Vitals } from "./Vitals";
export { SubStats } from "./SubStats";
```

- [ ] **Step 6: Typecheck + stories build**

Run: `pnpm exec tsc -b` — Expected: PASS.
Run: `pnpm ladle:build` — Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/ReactorSheet/components/chrome/Vitals.tsx src/ReactorSheet/components/chrome/Vitals.stories.tsx src/ReactorSheet/components/chrome/SubStats.tsx src/ReactorSheet/components/chrome/SubStats.stories.tsx src/ReactorSheet/components/chrome/index.ts
git commit -m "feat(chrome): Vitals + SubStats + barrel (display)"
```

---

## Task 8: Actions sections — AbilityPlaques + AttacksTable

**Files:**
- Create: `src/ReactorSheet/components/actions/AbilityPlaques.tsx` + `.stories.tsx`
- Create: `src/ReactorSheet/components/actions/AttacksTable.tsx` + `.stories.tsx`

- [ ] **Step 1: AbilityPlaques component**

Create `src/ReactorSheet/components/actions/AbilityPlaques.tsx`:

```tsx
import type { AbilityVM } from "../../viewModels/types";
import { KvCard } from "../ui/Card";
import { Stamp } from "../ui/Stamp";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { abilities: AbilityVM[] };

/** Six ability plaques (label · value · mod). Read-only (rollCheck is later). */
export function AbilityPlaques({ abilities }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle hint="roll-under d20">Abilities</SectionTitle>
      <div className="rs-abilities">
        {abilities.map((a) => (
          <KvCard key={a.key}>
            <div className="head"><Stamp>{a.label}</Stamp></div>
            <div className="val">{a.value}</div>
            <Stamp className="rs-mod">{a.modLabel}</Stamp>
          </KvCard>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: AbilityPlaques story**

Create `src/ReactorSheet/components/actions/AbilityPlaques.stories.tsx`:

```tsx
import { AbilityPlaques } from "./AbilityPlaques";
import type { AbilityVM } from "../../viewModels/types";

export default { title: "Actions / AbilityPlaques" };

const A = (key: string, label: string, value: number, mod: number): AbilityVM => ({
  key, label, value, mod, modLabel: mod >= 0 ? `+${mod}` : `${mod}`,
});

export const Default = () => (
  <AbilityPlaques
    abilities={[
      A("str", "STR", 9, 0), A("dex", "DEX", 13, 1), A("con", "CON", 10, 0),
      A("int", "INT", 17, 2), A("wis", "WIS", 12, 0), A("cha", "CHA", 11, 0),
    ]}
  />
);
```

- [ ] **Step 3: AttacksTable component**

Create `src/ReactorSheet/components/actions/AttacksTable.tsx`:

```tsx
import type { AttackVM } from "../../viewModels/types";
import { Table, Th, Td, Tr } from "../ui/Table";
import { Tag } from "../ui/Tag";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { attacks: AttackVM[] };

/** Equipped-weapon attacks table. Read-only (rollWeapon is later). */
export function AttacksTable({ attacks }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle hint="hit · damage">Attacks</SectionTitle>
      <Table>
        <thead>
          <Tr>
            <Th>Item</Th>
            <Th num>Hit</Th>
            <Th num>Damage</Th>
          </Tr>
        </thead>
        <tbody>
          {attacks.map((a) => (
            <Tr key={a.id}>
              <Td>
                <div className="rs-weapon">
                  {a.img && <img src={a.img} alt={a.name} />}
                  <div>
                    <div className="wname">
                      {a.name} <span style={{ opacity: 0.6 }}>({a.kind})</span>
                    </div>
                    <div className="rs-quals">
                      <Tag intent={a.kind === "melee" ? "mustard" : "teal"}>{a.kindLabel}</Tag>
                      {a.qualities.map((q) => (
                        <Tag key={q}>{q}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </Td>
              <Td num>{a.hitLabel}</Td>
              <Td num>{a.damage}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
```

- [ ] **Step 4: AttacksTable story**

Create `src/ReactorSheet/components/actions/AttacksTable.stories.tsx`:

```tsx
import { AttacksTable } from "./AttacksTable";
import type { AttackVM } from "../../viewModels/types";

export default { title: "Actions / AttacksTable" };

const W = (id: string, name: string, kind: "melee" | "missile", hit: string, dmg: string, q: string[]): AttackVM => ({
  id, name, img: "", kind, kindLabel: kind === "melee" ? "Melee" : "Missile", hitLabel: hit, damage: dmg, qualities: q,
});

export const Default = () => (
  <AttacksTable
    attacks={[
      W("d-m", "Dagger", "melee", "+0", "1d4", []),
      W("d-r", "Dagger", "missile", "+1", "1d4", ["Thrown"]),
      W("q-m", "Quarterstaff", "melee", "+0", "1d6", ["Two-handed", "Slow"]),
    ]}
  />
);
```

- [ ] **Step 5: Typecheck + stories build**

Run: `pnpm exec tsc -b` — Expected: PASS.
Run: `pnpm ladle:build` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/components/actions/AbilityPlaques.tsx src/ReactorSheet/components/actions/AbilityPlaques.stories.tsx src/ReactorSheet/components/actions/AttacksTable.tsx src/ReactorSheet/components/actions/AttacksTable.stories.tsx
git commit -m "feat(actions): AbilityPlaques + AttacksTable (display)"
```

---

## Task 9: Actions sections — SavesExploration + WealthMovement

**Files:**
- Create: `src/ReactorSheet/components/actions/SavesExploration.tsx` + `.stories.tsx`
- Create: `src/ReactorSheet/components/actions/WealthMovement.tsx` + `.stories.tsx`

- [ ] **Step 1: SavesExploration component**

Create `src/ReactorSheet/components/actions/SavesExploration.tsx`:

```tsx
import type { SaveVM, ExplorationVM } from "../../viewModels/types";
import { Table, Th, Td, Tr } from "../ui/Table";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { saves: SaveVM[]; exploration: ExplorationVM[] };

/** Saving throws (roll-above) + exploration (1-in-6). Read-only. */
export function SavesExploration({ saves, exploration }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle hint="roll-above d20">Saving Throws</SectionTitle>
      <Table>
        <tbody>
          {saves.map((s) => (
            <Tr key={s.key}>
              <Td>
                <i className={s.icon} style={{ marginRight: 8, opacity: 0.7 }} />
                {s.label}
              </Td>
              <Td num>{s.target}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <SectionTitle hint="1-in-6">Exploration</SectionTitle>
      <Table>
        <tbody>
          {exploration.map((e) => (
            <Tr key={e.key}>
              <Td>
                <i className={e.icon} style={{ marginRight: 8, opacity: 0.7 }} />
                {e.label}
              </Td>
              <Td num>{e.inSix}-in-6</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
```

- [ ] **Step 2: SavesExploration story**

Create `src/ReactorSheet/components/actions/SavesExploration.stories.tsx`:

```tsx
import { SavesExploration } from "./SavesExploration";

export default { title: "Actions / SavesExploration" };

export const Default = () => (
  <SavesExploration
    saves={[
      { key: "death", label: "Death", icon: "fas fa-skull-crossbones", target: 13 },
      { key: "wand", label: "Wand", icon: "fas fa-magic", target: 14 },
      { key: "paralysis", label: "Paralysis", icon: "fas fa-bolt", target: 13 },
      { key: "breath", label: "Breath", icon: "fas fa-wind", target: 16 },
      { key: "spell", label: "Spell", icon: "fas fa-hat-wizard", target: 15 },
    ]}
    exploration={[
      { key: "ld", label: "Listen Door", icon: "fas fa-ear", inSix: 2 },
      { key: "od", label: "Open Door", icon: "fas fa-door-open", inSix: 2 },
      { key: "sd", label: "Find Door", icon: "fas fa-magnifying-glass", inSix: 1 },
      { key: "ft", label: "Find Trap", icon: "fas fa-radar", inSix: 1 },
    ]}
  />
);
```

- [ ] **Step 3: WealthMovement component**

Create `src/ReactorSheet/components/actions/WealthMovement.tsx`:

```tsx
import type { WealthMovementVM } from "../../viewModels/types";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { vm: WealthMovementVM };

/** Coins + movement bands readout. Read-only. */
export function WealthMovement({ vm }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle>Wealth &amp; Movement</SectionTitle>
      <div className="rs-wm">
        <div className="grp">
          <span className="rs-substat k">Wealth</span>
          <div className="rs-coins">
            {vm.coins.length === 0 && <span className="rs-substat k">—</span>}
            {vm.coins.map((c) => (
              <span className="rs-coin" key={c.name}>
                {c.img && <img src={c.img} alt={c.name} />}
                {c.name} <span className="v">{c.qty}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="grp">
          <span className="rs-substat k">Movement</span>
          <div className="rs-moves">
            <span className="rs-move"><span className="k">Encounter</span><span className="v">{vm.move.encounter}′</span></span>
            <span className="rs-move"><span className="k">Explore</span><span className="v">{vm.move.explore}′</span></span>
            <span className="rs-move"><span className="k">Travel</span><span className="v">{vm.move.travel} mi</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: WealthMovement story**

Create `src/ReactorSheet/components/actions/WealthMovement.stories.tsx`:

```tsx
import { WealthMovement } from "./WealthMovement";

export default { title: "Actions / WealthMovement" };

export const Default = () => (
  <WealthMovement
    vm={{
      coins: [
        { name: "GP", img: "", qty: 42 },
        { name: "SP", img: "", qty: 17 },
      ],
      move: { encounter: 40, explore: 120, travel: 24 },
    }}
  />
);
```

- [ ] **Step 5: Typecheck + stories build**

Run: `pnpm exec tsc -b` — Expected: PASS.
Run: `pnpm ladle:build` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/components/actions/SavesExploration.tsx src/ReactorSheet/components/actions/SavesExploration.stories.tsx src/ReactorSheet/components/actions/WealthMovement.tsx src/ReactorSheet/components/actions/WealthMovement.stories.tsx
git commit -m "feat(actions): SavesExploration + WealthMovement (display)"
```

---

## Task 10: Shell slot props + ActionsView + SheetShell wiring

**Files:**
- Modify: `src/ReactorSheet/components/shell/Shell.tsx`
- Create: `src/ReactorSheet/components/actions/ActionsView.tsx`
- Create: `src/ReactorSheet/components/actions/index.ts`
- Modify: `src/ReactorSheet/components/SheetShell.tsx`

- [ ] **Step 1: Add slot props to Shell (placeholder fallback preserved)**

Replace the body of `src/ReactorSheet/components/shell/Shell.tsx` with:

```tsx
import type { ReactNode } from "react";
import { TabRail } from "./TabRail";
import { TabBar } from "./TabBar";
import { Placeholder } from "./Placeholder";
import type { TabItem } from "./types";

type Props = {
  tabs: TabItem[];
  active: string;
  onSelect: (id: string) => void;
  /** Active tab body — rendered in the right pane. */
  children: ReactNode;
  /** Optional chrome slots; each falls back to its P3 placeholder. */
  topbar?: ReactNode;
  header?: ReactNode;
  vitals?: ReactNode;
  subStats?: ReactNode;
  railExtra?: ReactNode;
};

/**
 * Presentational app shell. Chrome regions are slots (placeholder fallback);
 * the right pane mounts the active tab body. Responsive reflow lives in shell.scss.
 */
export function Shell({ tabs, active, onSelect, children, topbar, header, vitals, subStats, railExtra }: Props) {
  return (
    <>
      <div className="rs-topbar">
        {topbar ?? <Placeholder label="Topbar" hint="Lv · XP · Rest · Level Up · Edit · Theme (P4a)" />}
      </div>
      <div className="rs-body">
        <div className="rs-sheet">
          <div className="rs-pad">
            <div className="rs-twopane">
              <div className="rs-left">
                {header ?? <Placeholder label="Header" hint="portrait · name · class · alignment (P4b)" />}
                {vitals ?? <Placeholder label="Vitals" hint="HP · AC (P4c)" />}
                {subStats ?? <Placeholder label="Sub-stats" hint="Init · HD · Move (P4d)" />}
                <div className="rs-rail-extra">
                  {railExtra ?? <Placeholder label="Saves & Skills" hint="D/W/P/B/S · exploration — expanded rail (P4d)" />}
                </div>
              </div>
              <div className="rs-right">
                <TabBar tabs={tabs} active={active} onSelect={onSelect} />
                <div id="rs-tabpanel" role="tabpanel">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
        <TabRail tabs={tabs} active={active} onSelect={onSelect} />
      </div>
    </>
  );
}
```

- [ ] **Step 2: ActionsView container**

Create `src/ReactorSheet/components/actions/ActionsView.tsx`:

```tsx
import type { OSEActor } from "../../types/types";
import { selectAbilities } from "../../viewModels/abilities";
import { selectAttacks } from "../../viewModels/attacks";
import { selectSaves } from "../../viewModels/saves";
import { selectExploration } from "../../viewModels/exploration";
import { selectWealthMovement } from "../../viewModels/wealthMovement";
import { AbilityPlaques } from "./AbilityPlaques";
import { AttacksTable } from "./AttacksTable";
import { SavesExploration } from "./SavesExploration";
import { WealthMovement } from "./WealthMovement";

type Props = { actor: OSEActor };

/** Actions tab body. Saves/Exploration render here only when collapsed
 *  (.actions-only); when expanded they live in the left rail (see SheetShell). */
export function ActionsView({ actor }: Props) {
  return (
    <>
      <AbilityPlaques abilities={selectAbilities(actor)} />
      <AttacksTable attacks={selectAttacks(actor)} />
      <div className="actions-only">
        <SavesExploration saves={selectSaves(actor)} exploration={selectExploration(actor)} />
      </div>
      <WealthMovement vm={selectWealthMovement(actor)} />
    </>
  );
}
```

- [ ] **Step 3: Actions barrel**

Create `src/ReactorSheet/components/actions/index.ts`:

```ts
export { ActionsView } from "./ActionsView";
export { AbilityPlaques } from "./AbilityPlaques";
export { AttacksTable } from "./AttacksTable";
export { SavesExploration } from "./SavesExploration";
export { WealthMovement } from "./WealthMovement";
```

- [ ] **Step 4: Wire SheetShell**

Replace `src/ReactorSheet/components/SheetShell.tsx` with:

```tsx
import { Shell, type TabItem } from "./shell";
import { useReactorSheetContext } from "./context";
import { tabs, TabIds } from "./shared/tabs";
import getLabel from "@src/util/getLabel";
import { Topbar, IdentityHeader, Vitals, SubStats } from "./chrome";
import { ActionsView, SavesExploration } from "./actions";
import { selectTopbar } from "../viewModels/topbar";
import { selectIdentity } from "../viewModels/identity";
import { selectVitals } from "../viewModels/vitals";
import { selectSaves } from "../viewModels/saves";
import { selectExploration } from "../viewModels/exploration";

/**
 * Foundry-aware container: computes view-models, fills the Shell chrome slots,
 * and mounts the Actions body (other tabs still render their legacy Content).
 */
export default function SheetShell() {
  const { actor, currentTab, setCurrentTab } = useReactorSheetContext();

  const visible = tabs(actor).filter((t) => !t.disabled);
  const items: TabItem[] = visible.map((t) => ({
    id: t.id,
    label: getLabel(t.label),
    icon: <i className={t.icon} aria-hidden="true" />,
  }));

  const activeTab = visible.find((t) => t.id === currentTab) ?? visible[0];
  if (!activeTab) return null;

  const vitals = selectVitals(actor);

  return (
    <Shell
      tabs={items}
      active={activeTab.id}
      onSelect={(id) => {
        const next = visible.find((t) => t.id === id);
        if (next) setCurrentTab(next.id);
      }}
      topbar={<Topbar vm={selectTopbar(actor)} />}
      header={<IdentityHeader vm={selectIdentity(actor)} />}
      vitals={<Vitals vm={vitals} />}
      subStats={<SubStats vm={vitals} />}
      railExtra={<SavesExploration saves={selectSaves(actor)} exploration={selectExploration(actor)} />}
    >
      {activeTab.id === TabIds.ACTIONS ? <ActionsView actor={actor} /> : <activeTab.Content />}
    </Shell>
  );
}
```

- [ ] **Step 5: Build + typecheck**

Run: `pnpm build` — Expected: PASS (tsc + vite). Then discard rebuilt dist: `git checkout -- dist/`

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/components/shell/Shell.tsx src/ReactorSheet/components/actions/ActionsView.tsx src/ReactorSheet/components/actions/index.ts src/ReactorSheet/components/SheetShell.tsx
git commit -m "feat(actions): wire chrome slots + ActionsView into SheetShell"
```

---

## Task 11: Verification + PR

- [ ] **Step 1: Full gate sweep**

Run each; all must pass:

```bash
pnpm exec tsc -b
pnpm lint
pnpm test
pnpm ladle:build
pnpm build
git checkout -- dist/   # keep the branch source-only
```

Expected: `pnpm test` shows the new VM suites passing (format/abilities/attacks/saves/exploration/topbar/wealthMovement) alongside the existing ones; everything green.

- [ ] **Step 2: Live-Foundry smoke (manual, local only)**

Rebuild for the running module (`pnpm build` or `pnpm dev` — `FOUNDRY_HOT_RELOAD` is on) and open a character sheet on the **Actions** tab. Confirm against the prototype:
- Topbar shows Lv · XP bar · Lv+1 (buttons inert).
- Header: portrait + name + "Class Level · Alignment".
- Vitals: HP (crimson) + AC (teal AAC · DAC) boxes.
- Sub-stats: Init · HD · Move.
- Abilities: 6 plaques with value + mod.
- Attacks: equipped weapons, melee/missile rows, hit + damage.
- Collapsed (narrow): Saves + Exploration appear in the Actions body below attacks; Wealth + Movement at the bottom.
- Expanded (wide ≥760): Saves + Exploration move into the left rail; abilities go 6-across.
- Other tabs still render their legacy content; the shell chrome stays.

(If no local Foundry, note it on the PR — Ladle stories cover every component's visual surface.)

- [ ] **Step 3: Open the PR**

```bash
git push -u origin reskin/actions-display
gh pr create --base osc-sheet --title "Actions tab — display-only (pass 1)" \
  --body "Renders the full Actions tab + persistent chrome (topbar/header/vitals/sub-stats/saves+exploration) read-only, bound to actor.system.* via 7 new view-models and composed from the ui/ kit. No rolls/edits — the interactive pass wires the OSE system's existing methods (actor.rollCheck/rollSave/rollExploration, item.rollWeapon). Saves/Exploration relocate body↔rail by container query. Plan: docs/superpowers/plans/2026-06-15-reactor-sheet-actions-display.md."
```

---

## Self-Review — spec coverage (Actions display ↔ interactive map)

| Region | Plan task(s) | Display done? | Interactive deferred to |
|---|---|---|---|
| Topbar (Lv · XP · Lv+1) | T4 (vm), T6 (component), T10 (wire) | ✅ (buttons inert) | Rest/Level-Up/Edit/Theme flows |
| Header (portrait · name · class · alignment) | T6, T10 | ✅ | FilePicker on `img` |
| Vitals (HP · AC) | T7, T10 | ✅ | HP steppers, AC toggle |
| Sub-stats (Init · HD · Move) | T7, T10 | ✅ | `actor.rollHitDice` |
| Abilities (6 plaques) | T2 (vm), T8, T10 | ✅ | `actor.rollCheck` |
| Attacks (weapons table) | T2 (vm), T8, T10 | ✅ | `item.rollWeapon` |
| Saves (D/W/P/B/S) | T3 (vm), T9, T10 | ✅ | `actor.rollSave` |
| Exploration (1-in-6) | T3 (vm), T9, T10 | ✅ | `actor.rollExploration` |
| Wealth · Movement | T4 (vm), T9, T10 | ✅ | — |
| Body↔rail relocation | T5 (CSS), T10 | ✅ | — |

**Deviations from spec:** (1) Labels are hardcoded EN in the VMs (not `getLabel`) to keep VMs pure + components Ladle-renderable; i18n is a later pass. (2) Ability plaques use `KvCard` rather than the ornate `StatBlock` SVG — visual polish is an explicit later "enhance" step. Both are intentional and noted.

---

## Execution Handoff

This plan is being executed via **superpowers:subagent-driven-development** (user already chose "make it so"). Fresh subagent per task; spec-compliance then code-quality review after each; final review before the PR.
