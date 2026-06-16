# reactor-sheet P3 — App shell + responsive layout scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old styled-components shell (`Layout`/`Nav`/`TabContent`/`Footer`) with a token-driven, container-query responsive app shell: a two-pane ⇄ stacked grid, a right-edge vertical tab rail that swaps to a horizontal tab bar when wide, working tab routing, and labeled placeholder regions for the chrome that P4 fills.

**Architecture:** Presentational shell components under `components/shell/` consume design tokens via new `rs-`-prefixed classes in `styles/shell.scss` (adapted from the Vellum prototype `foundry-styles.css`, which P0 did **not** vendor — only the design-system component CSS was). Two nested container contexts drive the reflow: `app` on `.reactor-sheet-app` switches the vertical rail ⇄ horizontal tab bar (≥800c); `sheet` on the inner scroll area switches single-column ⇄ two-pane (≥760c). A thin Foundry-aware container (`SheetShell`) reads `useReactorSheetContext()`, maps `tabs(actor)` → presentational props, and renders the active tab's existing `Content` page in the right pane (so routing stays functional — no regression). Left-column chrome (header/vitals/sub-stats/saves) and the topbar render labeled placeholders until P4.

**Tech Stack:** React 19, TypeScript (strict:false), Sass (`sass-embedded`), CSS container queries, `clsx` (via `ui/cx`), `@ladle/react` (story = spec surface), Vite 8, the vendored Vellum tokens from P0.

**Key constraints (verified against the codebase):**
- Vendored CSS uses **no** `@container` queries and no `container-name`/`container-type` — so moving the `sheet` container off `.reactor-sheet-app` onto an inner scroll element breaks nothing. The only container queries in the repo will be the ones this plan adds.
- `.reactor-sheet-app` currently holds `container-name: sheet`; this plan repurposes it to `container-name: app` and adds `container-name: sheet` to the new inner `.rs-sheet`. (Faithful to the prototype's `fwin`/`sheet` split.)
- Token `--gold-dim` is **not** vendored yet — shell CSS references it with a `var(--gold-dim, var(--gold))` fallback. Other tokens (`--bg`, `--bg-2`, `--border`, `--border-soft`, `--text`/`--text-mute`/`--text-dim`/`--text-faint`, `--surface`/`--surface-3`, `--gold`, `--fs-sm`/`--fs-3xs`, `--sans`/`--mono`, `--r-md`) exist (some referenced with prototype fallbacks to be safe).
- Cream theme is `[data-theme="cream"]` on `.reactor-sheet`; token-based shell CSS themes automatically.
- **Stingy tests** (per project preference + P2 precedent): these are presentational components with trivial routing state — **no unit tests**. Verification = `tsc` (via `pnpm build`) + `pnpm lint` + `pnpm ladle:build` (stories compile) + visual review in Ladle. Vitest env is `node` (no jsdom); `@testing-library/react` is intentionally **not** added.
- Shell components are presentational (props in, no `game`/`CONFIG`/`foundry`, no actor) so they render in Ladle against fixture tab data. Foundry wiring is isolated to `SheetShell`.

**Branch:** runs on `reskin/app-shell`, branched off **`osc-sheet`** (which already has P0–P2), PR'd back into `osc-sheet`.

**Cloud/review note:** all gates (`tsc`, `eslint`, `ladle build`, `vite build`) are Foundry-free → cloud-friendly. The reviewable artifact is the `Shell / App Shell` Ladle story (resize to exercise both breakpoints, `?theme=cream` for the cream theme); publish alongside the existing P2 Ladle build if desired. A live-Foundry smoke (tab switching + window-resize reflow in the actual sheet) is a local follow-up via the `local-foundry-docker` skill — it cannot run in the cloud.

---

## File Structure

**Created:**
- `src/ReactorSheet/styles/shell.scss` — the `rs-`-prefixed shell layout + container-query reflow. `@use`d from `styles.scss`.
- `src/ReactorSheet/components/shell/types.ts` — `TabItem` presentational type.
- `src/ReactorSheet/components/shell/Placeholder.tsx` — labeled dashed-box placeholder for not-yet-built chrome.
- `src/ReactorSheet/components/shell/TabRail.tsx` — vertical right-edge rail (`.rs-tabrail`).
- `src/ReactorSheet/components/shell/TabBar.tsx` — horizontal tab bar (`.rs-htabs`, shown wide).
- `src/ReactorSheet/components/shell/Shell.tsx` — presentational orchestrator (topbar + body + two-pane + rail/bar).
- `src/ReactorSheet/components/shell/Shell.stories.tsx` — the responsive shell story (spec surface).
- `src/ReactorSheet/components/shell/index.ts` — barrel.
- `src/ReactorSheet/components/SheetShell.tsx` — Foundry-aware container: context → `Shell` props + active `Content`.

**Modified:**
- `src/ReactorSheet/styles/styles.scss` — `@use "shell";`; change `.reactor-sheet-app` `container-name: sheet` → `app`.
- `src/ReactorSheet/index.tsx` — render `<SheetShell />` inside the provider; drop `Layout` + `Nav` imports.

**Retired (left on disk, no longer mounted; deleted in P7 cleanup):**
- `components/Layout.tsx`, `components/Nav.tsx`, `components/TabContent.tsx` (and the `Header`/`Footer` they mount) — superseded by the new shell + P4 chrome.

---

## Design decisions (read before starting)

1. **Right pane renders the real active `Content`, not a placeholder.** The spec says "placeholder regions for chrome + tab body," but the repo already has working P1 tab pages. Rendering them keeps the sheet functional through the P3→P6 window (zero regression) while still delivering the actual P3 deliverable — the shell + routing. Only the **left-column chrome** and **topbar** are placeholders. The existing pages may look rough in the new layout; P6 reskins them.
2. **Bespoke shell tabs, not the `ui/Tabs` pill component.** `ui/Tabs` emits the generic `.tabs/.tab` pill row. The shell rail/bar are distinct (rotated vertical rail; underlined horizontal bar) with their own `rs-tabrail`/`rs-htabs` classes — matching the prototype. They share a `TabItem[]` prop shape.
3. **Two container contexts.** `app` (whole frame, incl. the 40px rail) drives rail⇄bar at 800c; `sheet` (scroll content, excl. rail) drives single⇄two-pane at 760c — exactly the prototype's `fwin`/`sheet` split.

---

## Task 1: Shell layout CSS + container topology

**Files:**
- Create: `src/ReactorSheet/styles/shell.scss`
- Modify: `src/ReactorSheet/styles/styles.scss`

- [ ] **Step 1: Create the shell stylesheet**

Create `src/ReactorSheet/styles/shell.scss`:

```scss
// Shell layout — responsive app scaffold (P3).
// Adapted from the Vellum prototype foundry-styles.css shell rules, re-prefixed
// `rs-` and tokenised. Two container contexts:
//   app   = .reactor-sheet-app  → vertical rail ⇄ horizontal tab bar (≥800c)
//   sheet = .rs-sheet (scroll)  → single-column ⇄ two-pane (≥760c)
// --gold-dim isn't vendored yet, so it falls back to --gold.

.rs-topbar {
  flex: 0 0 auto;
  padding: 10px 16px;
}

.rs-body {
  flex: 1;
  min-height: 0;
  display: flex;
  position: relative;
  background: var(--bg);
}

.rs-sheet {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  container-type: inline-size;
  container-name: sheet;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3, #3a3429) transparent;
}

.rs-pad { padding: 16px; }

.rs-twopane > .rs-left {
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-soft, #2c2823);
  margin-bottom: 3px;
}
.rs-right { min-width: 0; }

// ----- vertical right-edge tab rail (narrow default) -----
.rs-tabrail {
  flex: 0 0 auto;
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 14px;
  gap: 6px;
  background: var(--bg-2, #1f1c17);
  border-left: 1px solid var(--border, #3a342c);
}
.rs-tab {
  position: relative;
  flex: 0 0 auto;
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  color: var(--text-mute, #8a8270);
  cursor: pointer;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: var(--sans);
  font-size: var(--fs-sm, 13px);
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 10px 0;
  transition: color 0.12s, background 0.12s;
}
.rs-tab .rs-tab-ic {
  writing-mode: horizontal-tb;
  font-size: 14px;
  color: var(--gold-dim, var(--gold));
  transform: rotate(180deg);
}
.rs-tab .rs-tab-ct {
  writing-mode: horizontal-tb;
  transform: rotate(180deg);
  font-family: var(--mono);
  font-size: var(--fs-3xs, 10px);
  color: var(--text-faint, #6a6354);
  background: var(--surface, #23201a);
  border-radius: 99px;
  padding: 1px 5px;
}
.rs-tab:hover { color: var(--text-dim, #b5ad97); background: rgba(255, 255, 255, 0.03); }
.rs-tab.active {
  color: var(--text, #e5dec8);
  background: var(--bg, #181612);
  border-left-color: var(--gold);
}
.rs-tab.active .rs-tab-ic { color: var(--gold); }

// ----- horizontal tab bar (shown when wide) -----
.rs-htabs { display: none; }

// ----- placeholder chrome region -----
.rs-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
  min-height: 64px;
  padding: 14px;
  border: 1px dashed var(--border, #3a342c);
  border-radius: var(--r-md, 6px);
  color: var(--text-mute, #8a8270);
  background: color-mix(in srgb, var(--surface, #23201a) 40%, transparent);
}
.rs-placeholder + .rs-placeholder { margin-top: 12px; }
.rs-ph-label {
  font-family: var(--sans);
  font-size: var(--fs-sm, 13px);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.rs-ph-hint { font-size: var(--fs-3xs, 10px); color: var(--text-faint, #6a6354); }

// Saves & Skills relocates: hidden in the left column when collapsed (it renders
// inside the Actions tab content there), shown in the left rail when expanded.
.rs-rail-extra { display: none; }

// === container reflow ===
@container sheet (min-width: 600px) { .rs-pad { padding: 18px 20px; } }

@container sheet (min-width: 760px) {
  .rs-pad { padding: 22px 24px; }
  .rs-twopane {
    display: grid;
    grid-template-columns: 264px 1fr;
    gap: 22px;
    align-items: start;
  }
  .rs-twopane > .rs-left {
    position: sticky;
    top: 0;
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
  .rs-rail-extra { display: block; margin-top: 12px; }
}

@container app (min-width: 800px) {
  .rs-tabrail { display: none; }
  .rs-htabs {
    display: flex;
    gap: 4px;
    margin-bottom: 14px;
    border-bottom: 2px solid var(--border, #3a342c);
  }
  .rs-htab {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    padding: 7px 13px 9px;
    color: var(--text-mute, #8a8270);
    font-family: var(--sans);
    font-weight: 500;
    font-size: var(--fs-sm, 13px);
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: color 0.12s, border-color 0.12s;
  }
  .rs-htab .rs-htab-ic { color: var(--gold-dim, var(--gold)); font-size: 13px; }
  .rs-htab .rs-htab-ct {
    font-family: var(--mono);
    font-size: var(--fs-3xs, 10px);
    color: var(--text-faint, #6a6354);
    background: var(--surface, #23201a);
    border-radius: 99px;
    padding: 1px 6px;
  }
  .rs-htab:hover { color: var(--text-dim, #b5ad97); }
  .rs-htab.active { color: var(--text, #e5dec8); border-bottom-color: var(--gold); }
  .rs-htab.active .rs-htab-ic { color: var(--gold); }
}
```

- [ ] **Step 2: Wire shell.scss in and repurpose the app container**

In `src/ReactorSheet/styles/styles.scss`, add the `@use` directly under the existing `@use "util";` (line 1):

```scss
@use "util";
@use "shell";
```

Then change the `.reactor-sheet-app` container declaration from:

```scss
  container-type: inline-size; // layout reflows to window width, not viewport
  container-name: sheet;
```

to:

```scss
  container-type: inline-size; // outer frame: drives vertical rail ⇄ horizontal tab bar
  container-name: app;
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm build`
Expected: `tsc -b` passes and `vite build` emits `dist/main.css` with no Sass errors. (Grep the output dir to confirm the shell classes bundled.)

Run: `grep -c 'rs-tabrail' dist/main.css`
Expected: `1` or more (non-zero).

- [ ] **Step 4: Commit**

```bash
git add src/ReactorSheet/styles/shell.scss src/ReactorSheet/styles/styles.scss
git commit -m "feat(shell): responsive shell CSS + app/sheet container split"
```

---

## Task 2: TabItem type + Placeholder component

**Files:**
- Create: `src/ReactorSheet/components/shell/types.ts`
- Create: `src/ReactorSheet/components/shell/Placeholder.tsx`

- [ ] **Step 1: Define the presentational tab type**

Create `src/ReactorSheet/components/shell/types.ts`:

```ts
import type { ReactNode } from "react";

/** Presentational tab descriptor — no Foundry/actor coupling. */
export type TabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
};
```

- [ ] **Step 2: Create the Placeholder component**

Create `src/ReactorSheet/components/shell/Placeholder.tsx`:

```tsx
type Props = { label: string; hint?: string };

/** Labeled dashed box marking a chrome region built in a later phase. */
export function Placeholder({ label, hint }: Props) {
  return (
    <div className="rs-placeholder" role="presentation">
      <span className="rs-ph-label">{label}</span>
      {hint && <span className="rs-ph-hint">{hint}</span>}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc -b`
Expected: PASS, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/ReactorSheet/components/shell/types.ts src/ReactorSheet/components/shell/Placeholder.tsx
git commit -m "feat(shell): TabItem type + Placeholder"
```

---

## Task 3: TabRail + TabBar

**Files:**
- Create: `src/ReactorSheet/components/shell/TabRail.tsx`
- Create: `src/ReactorSheet/components/shell/TabBar.tsx`

- [ ] **Step 1: Create the vertical rail**

Create `src/ReactorSheet/components/shell/TabRail.tsx`:

```tsx
import { cx } from "../ui/cx";
import type { TabItem } from "./types";

type Props = { tabs: TabItem[]; active: string; onSelect: (id: string) => void };

/** Vertical right-edge rail (narrow layout). */
export function TabRail({ tabs, active, onSelect }: Props) {
  return (
    <nav className="rs-tabrail" aria-label="Sheet sections">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={cx("rs-tab", t.id === active && "active")}
          aria-current={t.id === active ? "page" : undefined}
          onClick={() => onSelect(t.id)}
          title={t.label}
        >
          {t.icon && <span className="rs-tab-ic">{t.icon}</span>}
          {t.label}
          {t.count != null && <span className="rs-tab-ct">{t.count}</span>}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Create the horizontal bar**

Create `src/ReactorSheet/components/shell/TabBar.tsx`:

```tsx
import { cx } from "../ui/cx";
import type { TabItem } from "./types";

type Props = { tabs: TabItem[]; active: string; onSelect: (id: string) => void };

/** Horizontal tab bar (wide layout; shown ≥800c via .rs-htabs). */
export function TabBar({ tabs, active, onSelect }: Props) {
  return (
    <div className="rs-htabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === active}
          className={cx("rs-htab", t.id === active && "active")}
          onClick={() => onSelect(t.id)}
        >
          {t.icon && <span className="rs-htab-ic">{t.icon}</span>}
          {t.label}
          {t.count != null && <span className="rs-htab-ct">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc -b`
Expected: PASS, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/ReactorSheet/components/shell/TabRail.tsx src/ReactorSheet/components/shell/TabBar.tsx
git commit -m "feat(shell): TabRail + TabBar"
```

---

## Task 4: Shell orchestrator + barrel

**Files:**
- Create: `src/ReactorSheet/components/shell/Shell.tsx`
- Create: `src/ReactorSheet/components/shell/index.ts`

- [ ] **Step 1: Create the Shell**

Create `src/ReactorSheet/components/shell/Shell.tsx`:

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
};

/**
 * Presentational app shell. Topbar + left-column chrome are P3 placeholders;
 * the right pane mounts the active tab body. Responsive reflow lives in shell.scss.
 */
export function Shell({ tabs, active, onSelect, children }: Props) {
  return (
    <>
      <div className="rs-topbar">
        <Placeholder label="Topbar" hint="Lv · XP · Rest · Level Up · Edit · Theme (P4a)" />
      </div>
      <div className="rs-body">
        <div className="rs-sheet">
          <div className="rs-pad">
            <div className="rs-twopane">
              <div className="rs-left">
                <Placeholder label="Header" hint="portrait · name · class · alignment (P4b)" />
                <Placeholder label="Vitals" hint="HP · AC (P4c)" />
                <Placeholder label="Sub-stats" hint="Init · HD · Move (P4d)" />
                {/* Saves & Skills only lives in the left rail when expanded; collapsed,
                    it renders inside the Actions tab content (P4d/P6). Mirrors the
                    prototype's .fvtt-rail-extra (display:none → block at two-pane). */}
                <div className="rs-rail-extra">
                  <Placeholder label="Saves & Skills" hint="D/W/P/B/S · exploration — expanded rail (P4d)" />
                </div>
              </div>
              <div className="rs-right">
                <TabBar tabs={tabs} active={active} onSelect={onSelect} />
                {children}
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

- [ ] **Step 2: Create the barrel**

Create `src/ReactorSheet/components/shell/index.ts`:

```ts
export { Shell } from "./Shell";
export { TabRail } from "./TabRail";
export { TabBar } from "./TabBar";
export { Placeholder } from "./Placeholder";
export type { TabItem } from "./types";
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc -b`
Expected: PASS, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/ReactorSheet/components/shell/Shell.tsx src/ReactorSheet/components/shell/index.ts
git commit -m "feat(shell): Shell orchestrator + barrel"
```

---

## Task 5: Shell story (spec surface)

**Files:**
- Create: `src/ReactorSheet/components/shell/Shell.stories.tsx`

- [ ] **Step 1: Write the responsive story**

Create `src/ReactorSheet/components/shell/Shell.stories.tsx`:

```tsx
import { useState } from "react";
import { Shell } from "./Shell";
import type { TabItem } from "./types";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/SectionTitle";

export default { title: "Shell / App Shell" };

// Glyph icons (FontAwesome isn't loaded in Ladle); the real sheet passes <i class="fa…"/>.
const TABS: TabItem[] = [
  { id: "actions", label: "Actions", icon: <span>◈</span> },
  { id: "inventory", label: "Inventory", icon: <span>▤</span>, count: 15 },
  { id: "spells", label: "Spells", icon: <span>✦</span>, count: 3 },
  { id: "abilities", label: "Abilities", icon: <span>❖</span> },
  { id: "notes", label: "Notes", icon: <span>✎</span> },
];

function Demo() {
  const [active, setActive] = useState("actions");
  const label = TABS.find((t) => t.id === active)?.label ?? "";
  return (
    <Shell tabs={TABS} active={active} onSelect={setActive}>
      <SectionTitle hint="resize the frame to see the reflow">{label}</SectionTitle>
      <Card>
        Active tab: <b>{active}</b>. Drag the panel's right edge: vertical rail ⇄ horizontal
        tabs at ~800c, single-column ⇄ two-pane at ~760c. Append <code>?theme=cream</code> to
        the URL for the cream theme.
      </Card>
    </Shell>
  );
}

export const Responsive = () => <Demo />;
```

- [ ] **Step 2: Verify stories compile**

Run: `pnpm ladle:build`
Expected: build succeeds; output mentions the `Shell / App Shell` story with no TS/build errors.

- [ ] **Step 3: Visual check (manual)**

Run: `pnpm ladle` and open the `Shell / App Shell → Responsive` story. Confirm:
- Narrow: left placeholders stack above the right pane; **vertical rail** on the right edge; clicking rail tabs swaps the active highlight.
- Drag wide (>800): rail disappears, **horizontal tab bar** appears above the right pane.
- ~760+: left column and right pane sit **side by side** (two-pane), left becomes sticky.
- `?theme=cream`: tokens recolor; no pure white.

- [ ] **Step 4: Commit**

```bash
git add src/ReactorSheet/components/shell/Shell.stories.tsx
git commit -m "feat(shell): App Shell Ladle story"
```

---

## Task 6: Foundry wiring — SheetShell + mount

**Files:**
- Create: `src/ReactorSheet/components/SheetShell.tsx`
- Modify: `src/ReactorSheet/index.tsx`

- [ ] **Step 1: Create the container**

Create `src/ReactorSheet/components/SheetShell.tsx`:

```tsx
import { Shell, type TabItem } from "./shell";
import { useReactorSheetContext } from "./context";
import { tabs, TabIds } from "./shared/tabs";
import getLabel from "@src/util/getLabel";

/**
 * Foundry-aware container: maps tabs(actor) → presentational Shell props and
 * mounts the active tab's existing Content page in the right pane.
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

  return (
    <Shell
      tabs={items}
      active={activeTab.id}
      onSelect={(id) => setCurrentTab(id as TabIds)}
    >
      <activeTab.Content />
    </Shell>
  );
}
```

- [ ] **Step 2: Swap the mount**

In `src/ReactorSheet/index.tsx`, replace the `Layout`/`Nav` imports:

```tsx
import { Layout } from "./components/Layout";
import ReactorSheetProvider from "./components/ReactorSheetProvider";
import Nav from "./components/Nav";
```

with:

```tsx
import ReactorSheetProvider from "./components/ReactorSheetProvider";
import SheetShell from "./components/SheetShell";
```

and replace the provider body:

```tsx
      <ReactorSheetProvider
        initialActor={actor!}
        source={source!}
        contextConnector={contextConnector}
      >
        <Layout />
        <Nav />
      </ReactorSheetProvider>
```

with:

```tsx
      <ReactorSheetProvider
        initialActor={actor!}
        source={source!}
        contextConnector={contextConnector}
      >
        <SheetShell />
      </ReactorSheetProvider>
```

(Leave the `appRef` / `mousedown` effect and the outer `<div className="reactor-sheet-app" ref={appRef}>` unchanged.)

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: `tsc -b` + `vite build` both pass. No unused-import errors (the old `Layout`/`Nav`/`TabContent` files remain on disk but are simply no longer imported — that's fine).

- [ ] **Step 4: Commit**

```bash
git add src/ReactorSheet/components/SheetShell.tsx src/ReactorSheet/index.tsx
git commit -m "feat(shell): mount SheetShell; retire Layout/Nav from the tree"
```

---

## Task 7: Verification + PR

**Files:** none (gates only)

- [ ] **Step 1: Full gate sweep**

Run each; all must pass:

```bash
pnpm exec tsc -b      # types
pnpm lint             # eslint
pnpm test             # vitest — existing view-model/theme/tool tests still green (no new tests added)
pnpm ladle:build      # stories compile
pnpm build            # tsc -b && vite build → dist/
```

Expected: every command exits 0. `pnpm test` shows the pre-existing suites passing with no new files.

- [ ] **Step 2: Live-Foundry smoke (manual, local only)**

Use the `local-foundry-docker` skill to start the v14 stack and open Raistlin Majere's sheet. Confirm:
- The vertical rail renders on the right; clicking each tab swaps the right-pane content (Actions/Inventory/Spells/Abilities/Notes; Spells hidden if `system.spells.enabled` is false).
- Resizing the window wide swaps the rail → horizontal tab bar and reflows to two-pane.
- Left column shows the four labeled placeholders; topbar placeholder sits at the top.
- Toggling the theme client setting recolors the shell; no pure white.

(If no local Foundry is available, note it on the PR — the Ladle story covers the responsive/visual surface; the live smoke is the only Foundry-runtime check and can't run in the cloud.)

- [ ] **Step 3: Open the PR**

```bash
git push -u origin reskin/app-shell
gh pr create --base osc-sheet --title "P3: App shell + responsive layout scaffold" \
  --body "Replaces the styled-components shell with a token-driven, container-query responsive app shell: vertical rail ⇄ horizontal tab bar, two-pane ⇄ stacked reflow, working tab routing. Left-column chrome + topbar are labeled placeholders (P4 fills them); the right pane renders the existing tab pages (no functional regression). Spec surface: the \`Shell / App Shell\` Ladle story. See docs/superpowers/plans/2026-06-15-reactor-sheet-app-shell.md."
```

---

## Self-Review — spec coverage

| P3 spec item | Implemented by |
|---|---|
| Two-column ⇄ stacked container-query grid | `shell.scss` `@container sheet (min-width: 760px)` two-pane grid; base single-column (Task 1) |
| Right-edge vertical tab rail | `TabRail` + `.rs-tabrail` (Tasks 1, 3) |
| Rail ⇄ horizontal bar when wide | `TabBar` + `@container app (min-width: 800px)` (Tasks 1, 3) |
| Tab routing | `SheetShell` wires `currentTab`/`setCurrentTab`; `TabRail`/`TabBar` `onSelect` (Task 6) |
| Empty placeholder regions for chrome | `Placeholder` for topbar/header/vitals/sub-stats/saves (Tasks 2, 4) |
| Mount region for tab body | Right pane renders active `Content` (decision #1) — functional, not a stub (Task 6) |

**Deviation noted:** the spec's "placeholder for tab body" is implemented as the **real** active tab page (decision #1) to avoid regressing working functionality during the reskin. Swapping to a literal placeholder later is a one-line change in `SheetShell` if desired.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-15-reactor-sheet-app-shell.md`. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, two-stage review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session with checkpoints for review.

Which approach?
