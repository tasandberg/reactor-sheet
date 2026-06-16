# reactor-sheet P2 — Ladle workbench + UI component library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Ladle workbench and build a typed, Foundry-agnostic `ui/` component library that wraps the Vellum design-system classes, so P3–P6 compose the sheet from these primitives and the same library can later lift out for the web app.

**Architecture:** Each `ui/` component is a thin React wrapper that maps typed props → Vellum design-system classNames (composed with `clsx`, already a dep) and renders the contract's markup. No styling logic lives in React — the CSS (vendored + scoped in P0) owns appearance. Components import nothing from Foundry or `foundry-vtt-react`. Ladle (Vite-native) renders each component in isolation inside a `.reactor-sheet` scoped root with a resizable container (to exercise container queries) and a `?theme=cream` switch.

**Tech Stack:** React 19, TypeScript (strict:false app config), `clsx`, `@ladle/react` (new), Vite 8, the Vellum CSS from P0.

**Key constraints:**
- **Foundry-agnostic:** files under `src/ReactorSheet/components/ui/` must not import `foundry-vtt-react`, reference `game`/`CONFIG`/`foundry`, or touch the actor. Pure presentation. A verification grep enforces this.
- **Consume the contract, don't restyle:** components emit the exact classes from `docs/design_handoff_foundry_sheet/reference/DESIGN_SYSTEM.md` (`.btn`, `.stamp`, `.field`, `.tab`, `.die`, …). Do not add new CSS or inline styles for appearance (layout-only inline style like a skeleton's width is fine).
- **Stingy tests:** these are presentational className-mappers — **no unit tests**. Verification is TypeScript + `ladle build` (stories must compile) + visual review in Ladle. (Per the project's stingy-with-tests preference.)
- **Stories, not tests, are the spec surface:** every component ships a `.stories.tsx` showing its states.

**Class contract reference:** `docs/design_handoff_foundry_sheet/reference/DESIGN_SYSTEM.md` (component-classes section). Re-read the relevant block before each task; the markup patterns there are authoritative.

---

## File Structure

**Created:**
- `.ladle/config.mjs` — Ladle config (title, defaults).
- `.ladle/components.tsx` — global `Provider`: imports the Vellum CSS, wraps every story in a scoped, resizable `.reactor-sheet` root with dark/cream switch.
- `src/ReactorSheet/components/ui/cx.ts` — re-export of `clsx` as the lib's class composer (single import site).
- `src/ReactorSheet/components/ui/<Component>.tsx` — one file per component (Stamp, Button, Tag, SectionTitle, Card, Table, Field/Input, Textarea, Select, Stepper, Toggle, Check, Radio, Segmented, Tabs, ProgressBar, Die, Modal, Toast, Menu, Empty, Skeleton).
- `src/ReactorSheet/components/ui/<Component>.stories.tsx` — one story file per component.
- `src/ReactorSheet/components/ui/index.ts` — barrel export.

**Modified:**
- `package.json` — add `@ladle/react` dev dep + `ladle`/`ladle:build` scripts.

> Branch: this plan runs on `reskin/ui-library`, branched off **`reskin/foundation`** (so it already has the P0 Vellum CSS + `.reactor-sheet-app` scoping), PR'd into `osc-sheet`.

> **Cloud execution + review:** this plan is intended to run as an autonomous cloud agent. Its gates (`tsc`, `ladle build`, lint, `pnpm build`) need no local Foundry — a clean cloud fit. A cloud agent cannot keep a live `ladle serve` reachable, so the **final task publishes the static Ladle build to a public URL** for the user to review. **Chosen target: GitHub Pages, namespaced under `/reactor-sheet/ladle/`** — deployed into a `ladle/` subdir of the `gh-pages` branch (with `--add`) so it does NOT occupy the repo's Pages root; that root stays free for the eventual web app / module landing. No secret needed; requires Pages enabled on the repo once. The agent posts the preview URL on the PR.

> We deliberately do **not** split the design system / `ui/` into a sub-repository (YAGNI — see spec "Reuse & tooling"). It stays in reactor-sheet; only the Ladle *preview* is published externally.

---

## Conventions (apply to every component task)

**Component shape** — typed props, `cx` for classes, forward the native element's props, spread `rest`, accept `className`:
```tsx
import { cx } from "./cx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "danger" | "ghost"; size?: "sm" };

export function Button({ variant, size, className, ...rest }: Props) {
  return <button className={cx("btn", variant, size, className)} {...rest} />;
}
```

**Story shape** — default export `{ title }`, named exports are stories. Show each visual state. Example for Button:
```tsx
import { Button } from "./Button";
export default { title: "Controls / Button" };
export const Variants = () => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
    <Button>Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="danger">Danger</Button>
    <Button variant="ghost">Ghost</Button>
    <Button size="sm" variant="primary">Small</Button>
    <Button disabled>Disabled</Button>
  </div>
);
```
Each task below lists the states each story must render; build the story files following this shape.

---

## Task 1: Ladle setup + scoped Provider

**Files:** Modify `package.json`; Create `.ladle/config.mjs`, `.ladle/components.tsx`, `src/ReactorSheet/components/ui/cx.ts`, and a temporary `src/ReactorSheet/components/ui/_smoke.stories.tsx` (deleted at end of task).

- [ ] **Step 1: Add Ladle**

Run:
```bash
cd /Users/tim/dev/foundry-dev/reactor-sheet
pnpm add -D @ladle/react
```

- [ ] **Step 2: Scripts**

In `package.json` `scripts`, after `"test:watch": "vitest",` add:
```json
    "ladle": "ladle serve",
    "ladle:build": "ladle build",
```

- [ ] **Step 3: Ladle config**

`.ladle/config.mjs`:
```js
export default {
  stories: "src/ReactorSheet/components/**/*.stories.tsx",
  defaultStory: "",
};
```

- [ ] **Step 4: Create the class composer**

`src/ReactorSheet/components/ui/cx.ts`:
```ts
export { clsx as cx } from "clsx";
```

- [ ] **Step 5: Global Provider — scoped root, resizable container, theme switch**

`.ladle/components.tsx`:
```tsx
import type { GlobalProvider } from "@ladle/react";
// Same CSS pipeline as the app: fonts → tokens → components → sheet base.
// Vite applies postcss.config.mjs (the Vellum scoper) to the vellum/* files.
import "../src/ReactorSheet/styles/vellum/fonts.css";
import "../src/ReactorSheet/styles/vellum/tokens.css";
import "../src/ReactorSheet/styles/vellum/components.css";
import "../src/ReactorSheet/styles/styles.scss";

export const Provider: GlobalProvider = ({ children }) => {
  // Append ?theme=cream to the Ladle URL to preview the cream theme.
  const cream =
    typeof location !== "undefined" &&
    new URLSearchParams(location.search).get("theme") === "cream";
  return (
    <div className="reactor-sheet" data-theme={cream ? "cream" : undefined}>
      {/* resize handle lets you drag-test the container-query reflow */}
      <div
        className="reactor-sheet-app"
        style={{ resize: "horizontal", overflow: "auto", width: 640, maxWidth: "100%", padding: 16 }}
      >
        {children}
      </div>
    </div>
  );
};
```

- [ ] **Step 6: Temporary smoke story to prove the harness renders**

`src/ReactorSheet/components/ui/_smoke.stories.tsx`:
```tsx
export default { title: "_smoke" };
export const Hello = () => <span className="stamp sm">Strength</span>;
```

- [ ] **Step 7: Verify Ladle builds**

Run: `pnpm ladle:build`
Expected: builds successfully to `build/` (Ladle static output), no errors. This proves stories compile, the Provider resolves the CSS imports, and the Vite/PostCSS pipeline works under Ladle. (If `@src` alias errors appear, stories/Provider use only relative imports — keep it that way.)

- [ ] **Step 8: Delete the smoke story**

Run: `rm src/ReactorSheet/components/ui/_smoke.stories.tsx`

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml .ladle/ src/ReactorSheet/components/ui/cx.ts
git commit -m "feat: add Ladle workbench with scoped Vellum provider"
```

---

## Task 2: Primitives — Stamp, Button, Tag

Contract: Stamp = `<span class="stamp sm|md|lg">…</span>` (ink bg + cream caps, theme-independent). Button = `<button class="btn [primary|danger|ghost] [sm]">`. Tag = `<span class="tag [teal|crimson|forest|mustard|solid]">`.

**Files:** Create `Stamp.tsx`, `Button.tsx`, `Tag.tsx` and each `.stories.tsx` under `src/ReactorSheet/components/ui/`.

- [ ] **Step 1: Stamp**

`Stamp.tsx`:
```tsx
import { cx } from "./cx";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & { size?: "sm" | "md" | "lg" };

export function Stamp({ size = "sm", className, ...rest }: Props) {
  return <span className={cx("stamp", size, className)} {...rest} />;
}
```

- [ ] **Step 2: Button**

`Button.tsx`:
```tsx
import { cx } from "./cx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "ghost";
  size?: "sm";
};

export function Button({ variant, size, className, type = "button", ...rest }: Props) {
  return <button type={type} className={cx("btn", variant, size, className)} {...rest} />;
}
```

- [ ] **Step 3: Tag**

`Tag.tsx`:
```tsx
import { cx } from "./cx";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  intent?: "teal" | "crimson" | "forest" | "mustard" | "solid";
};

export function Tag({ intent, className, ...rest }: Props) {
  return <span className={cx("tag", intent, className)} {...rest} />;
}
```

- [ ] **Step 4: Stories** — create `Stamp.stories.tsx` (states: sizes sm/md/lg; sample stat keys STR/HP/AC), `Button.stories.tsx` (states: the Variants story from Conventions), `Tag.stories.tsx` (states: neutral + each intent + solid). Follow the story shape in Conventions.

- [ ] **Step 5: Verify**

Run: `pnpm ladle:build` → success. Run: `pnpm exec tsc -b` → clean.
Then `pnpm ladle` (dev) and eyeball is fine but not required for the gate; `ladle:build` + tsc is the automated gate.

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/components/ui/Stamp.tsx src/ReactorSheet/components/ui/Button.tsx src/ReactorSheet/components/ui/Tag.tsx src/ReactorSheet/components/ui/*.stories.tsx
git commit -m "feat(ui): Stamp, Button, Tag primitives"
```

---

## Task 3: SectionTitle, Card, Table

Contract: SectionTitle = `<h3 class="section-title">Title <span class="hint">…</span></h3>` (Title Case + 3px rule; optional italic hint). Card = `<div class="card">`; KvCard = `<div class="kv-card">` (centers a large stat + label stamp). Table = `<table class="table">` with header cells as stamps and `.num` for right-aligned mono numerics.

**Files:** Create `SectionTitle.tsx`, `Card.tsx`, `Table.tsx` + stories.

- [ ] **Step 1: SectionTitle**

`SectionTitle.tsx`:
```tsx
import { cx } from "./cx";
import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLHeadingElement> & { hint?: ReactNode };

export function SectionTitle({ hint, children, className, ...rest }: Props) {
  return (
    <h3 className={cx("section-title", className)} {...rest}>
      {children}
      {hint != null && <span className="hint">{hint}</span>}
    </h3>
  );
}
```

- [ ] **Step 2: Card + KvCard**

`Card.tsx`:
```tsx
import { cx } from "./cx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("card", className)} {...rest} />;
}

export function KvCard({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("kv-card", className)} {...rest} />;
}
```

- [ ] **Step 3: Table**

`Table.tsx` (thin element wrappers; `num` adds the right-aligned-mono class to th/td):
```tsx
import { cx } from "./cx";
import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cx("table", className)} {...rest} />;
}
export function Th({ num, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement> & { num?: boolean }) {
  return <th className={cx(num && "num", className)} {...rest} />;
}
export function Td({ num, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement> & { num?: boolean }) {
  return <td className={cx(num && "num", className)} {...rest} />;
}
export function Tr(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}
```

- [ ] **Step 4: Stories** — `SectionTitle.stories.tsx` (with and without hint), `Card.stories.tsx` (Card with content; KvCard with a big number + `<Stamp>` label), `Table.stories.tsx` (a spell/weapon-style table: header stamps, a couple rows, a `.num` column). Import `Stamp` from `./Stamp` where helpful.

- [ ] **Step 5: Verify** — `pnpm ladle:build` success; `pnpm exec tsc -b` clean.

- [ ] **Step 6: Commit**

```bash
git add src/ReactorSheet/components/ui/SectionTitle.tsx src/ReactorSheet/components/ui/Card.tsx src/ReactorSheet/components/ui/Table.tsx src/ReactorSheet/components/ui/SectionTitle.stories.tsx src/ReactorSheet/components/ui/Card.stories.tsx src/ReactorSheet/components/ui/Table.stories.tsx
git commit -m "feat(ui): SectionTitle, Card, Table"
```

---

## Task 4: Form controls — Field, Input, Textarea, Select, Stepper, Toggle, Check, Radio, Segmented

Contract (from DESIGN_SYSTEM.md): `.field` wraps `.field-label` + control + `.field-hint`/`.field-error`; `.input`/`.textarea`/`.select` get `.is-error` for validation. `.stepper` = `<div class="stepper"><button>−</button><input type="number"/><button>+</button></div>`. `.toggle` = `<label class="toggle"><input type="checkbox"/><span class="track"/> label</label>`. `.check` uses `<span class="box"/>`; `.radio` uses `<span class="dot"/>`. `.segmented` = `<div class="segmented"><button class="on">A</button><button>B</button></div>`.

**Files:** Create `Field.tsx` (Field + Input), `Textarea.tsx`, `Select.tsx`, `Stepper.tsx`, `Toggle.tsx`, `Check.tsx`, `Radio.tsx`, `Segmented.tsx` + stories.

- [ ] **Step 1: Field + Input**

`Field.tsx`:
```tsx
import { cx } from "./cx";
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  hint,
  error,
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { label?: ReactNode; hint?: ReactNode; error?: ReactNode }) {
  return (
    <div className={cx("field", className)} {...rest}>
      {label != null && <label className="field-label">{label}</label>}
      {children}
      {error != null ? (
        <span className="field-error">{error}</span>
      ) : (
        hint != null && <span className="field-hint">{hint}</span>
      )}
    </div>
  );
}

export function Input({ invalid, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cx("input", invalid && "is-error", className)} {...rest} />;
}
```

- [ ] **Step 2: Textarea + Select**

`Textarea.tsx`:
```tsx
import { cx } from "./cx";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({ invalid, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cx("textarea", invalid && "is-error", className)} {...rest} />;
}
```
`Select.tsx`:
```tsx
import { cx } from "./cx";
import type { SelectHTMLAttributes } from "react";

export function Select({ invalid, className, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return <select className={cx("select", invalid && "is-error", className)} {...rest} />;
}
```

- [ ] **Step 3: Stepper**

`Stepper.tsx` (controlled numeric with −/+; calls `onValueChange` with the clamped next value):
```tsx
import { cx } from "./cx";

type Props = {
  value: number;
  onValueChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export function Stepper({ value, onValueChange, min, max, step = 1, className }: Props) {
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  return (
    <div className={cx("stepper", className)}>
      <button type="button" aria-label="Decrease" onClick={() => onValueChange(clamp(value - step))}>
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onValueChange(clamp(Number(e.target.value)))}
      />
      <button type="button" aria-label="Increase" onClick={() => onValueChange(clamp(value + step))}>
        +
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Toggle, Check, Radio**

`Toggle.tsx`:
```tsx
import { cx } from "./cx";
import type { InputHTMLAttributes, ReactNode } from "react";

export function Toggle({ children, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { children?: ReactNode }) {
  return (
    <label className={cx("toggle", className)}>
      <input type="checkbox" {...rest} />
      <span className="track" />
      {children}
    </label>
  );
}
```
`Check.tsx`:
```tsx
import { cx } from "./cx";
import type { InputHTMLAttributes, ReactNode } from "react";

export function Check({ children, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { children?: ReactNode }) {
  return (
    <label className={cx("check", className)}>
      <input type="checkbox" {...rest} />
      <span className="box" />
      {children}
    </label>
  );
}
```
`Radio.tsx`:
```tsx
import { cx } from "./cx";
import type { InputHTMLAttributes, ReactNode } from "react";

export function Radio({ children, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { children?: ReactNode }) {
  return (
    <label className={cx("radio", className)}>
      <input type="radio" {...rest} />
      <span className="dot" />
      {children}
    </label>
  );
}
```

- [ ] **Step 5: Segmented**

`Segmented.tsx` (generic single-select segmented control):
```tsx
import { cx } from "./cx";

type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onValueChange: (next: T) => void;
  className?: string;
};

export function Segmented<T extends string>({ options, value, onValueChange, className }: Props<T>) {
  return (
    <div className={cx("segmented", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={cx(o.value === value && "on")}
          onClick={() => onValueChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Stories** — one `*.stories.tsx` per control. States to show:
  - `Field`: a Field wrapping an `Input` with label + hint; a second with `error` (and `<Input invalid />`).
  - `Textarea`, `Select`: default + invalid.
  - `Stepper`: a story using local `React.useState` (e.g. HP 8) wired to `onValueChange`, with `min={0} max={9}`.
  - `Toggle`, `Check`, `Radio`: checked + unchecked with a label.
  - `Segmented`: options `[{value:"combat",label:"Combat"},{value:"spells",label:"Spells"}]`, local state.

- [ ] **Step 7: Verify** — `pnpm ladle:build` success; `pnpm exec tsc -b` clean.

- [ ] **Step 8: Commit**

```bash
git add src/ReactorSheet/components/ui/Field.tsx src/ReactorSheet/components/ui/Textarea.tsx src/ReactorSheet/components/ui/Select.tsx src/ReactorSheet/components/ui/Stepper.tsx src/ReactorSheet/components/ui/Toggle.tsx src/ReactorSheet/components/ui/Check.tsx src/ReactorSheet/components/ui/Radio.tsx src/ReactorSheet/components/ui/Segmented.tsx src/ReactorSheet/components/ui/{Field,Textarea,Select,Stepper,Toggle,Check,Radio,Segmented}.stories.tsx
git commit -m "feat(ui): form controls"
```

---

## Task 5: Tabs + ProgressBar

Contract: Tabs = `<div class="tabs"><button class="tab active">…</button><button class="tab">Label <span class="count">3</span></button></div>`. ProgressBar: the sheet uses a filled bar (HP/XP/encumbrance); DESIGN_SYSTEM.md has no dedicated `.progress` class, so render a minimal token-driven bar (this is the one component allowed a small amount of structural CSS-in-class via tokens — but prefer reusing an existing class if present). Re-check `styles/vellum/tokens.css` and `components.css` for a `.charbar`/`.bar`/`.progress` class first; if one exists, wrap it instead of inventing markup.

**Files:** Create `Tabs.tsx`, `ProgressBar.tsx` + stories.

- [ ] **Step 1: Tabs**

`Tabs.tsx`:
```tsx
import { cx } from "./cx";

type Tab<T extends string> = { id: T; label: string; count?: number };
type Props<T extends string> = {
  tabs: Tab<T>[];
  active: T;
  onSelect: (id: T) => void;
  className?: string;
};

export function Tabs<T extends string>({ tabs, active, onSelect, className }: Props<T>) {
  return (
    <div className={cx("tabs", className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === active}
          className={cx("tab", t.id === active && "active")}
          onClick={() => onSelect(t.id)}
        >
          {t.label}
          {t.count != null && <span className="count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: ProgressBar**

First inspect the vendored CSS for an existing bar class:
```bash
grep -nE '\.(charbar|progress|bar|xp|meter)' src/ReactorSheet/styles/vellum/tokens.css src/ReactorSheet/styles/vellum/components.css
```
If a class exists, wrap that markup. Otherwise use this token-driven minimal bar (`ProgressBar.tsx`) — the only place a layout style object is acceptable, and it uses Vellum tokens (no hardcoded colors):
```tsx
import { cx } from "./cx";

type Props = {
  value: number;
  max: number;
  /** token color var name for the fill, default --teal */
  color?: string;
  className?: string;
};

export function ProgressBar({ value, max, color = "var(--teal)", className }: Props) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={cx("progress", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      style={{ background: "var(--surface-3)", borderRadius: "var(--r-sm)", overflow: "hidden", height: 8 }}
    >
      <div style={{ width: `${pct}%`, height: "100%", background: color }} />
    </div>
  );
}
```
> If Step 2's grep finds a real class, prefer wrapping it and drop the inline styles; report which path you took.

- [ ] **Step 3: Stories** — `Tabs.stories.tsx`: the 5 sheet tabs (Actions, Inventory[15], Spells[3], Abilities, Notes) with local active state. `ProgressBar.stories.tsx`: HP 8/9 (crimson via `color="var(--crimson)"`), XP 6420/10000 (default teal), full and empty.

- [ ] **Step 4: Verify** — `pnpm ladle:build` success; `pnpm exec tsc -b` clean.

- [ ] **Step 5: Commit**

```bash
git add src/ReactorSheet/components/ui/Tabs.tsx src/ReactorSheet/components/ui/ProgressBar.tsx src/ReactorSheet/components/ui/Tabs.stories.tsx src/ReactorSheet/components/ui/ProgressBar.stories.tsx
git commit -m "feat(ui): Tabs and ProgressBar"
```

---

## Task 6: Die

Contract: `<div class="die d4|d6|d8|d20"><span class="face">N</span></div>`; `.crit` (sage glow) / `.fumble` (faded) modifiers on d20; `.rolling` animates a tumble entrance.

**Files:** Create `Die.tsx` + `Die.stories.tsx`.

- [ ] **Step 1: Die**

`Die.tsx`:
```tsx
import { cx } from "./cx";

type Props = {
  sides: 4 | 6 | 8 | 20;
  value: number;
  verdict?: "crit" | "fumble";
  rolling?: boolean;
  className?: string;
};

export function Die({ sides, value, verdict, rolling, className }: Props) {
  return (
    <div className={cx("die", `d${sides}`, verdict, rolling && "rolling", className)}>
      <span className="face">{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Story** — `Die.stories.tsx`: a row of d4/d6/d8/d20 with sample values; a d20 `verdict="crit"` showing 20; a d20 `verdict="fumble"` showing 1.

- [ ] **Step 3: Verify** — `pnpm ladle:build` success; `pnpm exec tsc -b` clean.

- [ ] **Step 4: Commit**

```bash
git add src/ReactorSheet/components/ui/Die.tsx src/ReactorSheet/components/ui/Die.stories.tsx
git commit -m "feat(ui): Die"
```

---

## Task 7: Overlays — Modal, Toast, Menu, Empty, Skeleton

Contract: Modal = `.modal-scrim > .modal > (.modal-head[.ttl,.x] + .modal-body + .modal-foot)`. Toast = `.toast[.success|.danger|.warning] > (.ic + .body[.ttl,.msg] + .x)`. Menu = `.menu > (.menu-label, .menu-item[.ic,.shortcut], .menu-sep, .menu-item.danger)`; popover variant uses `.menu-host > .menu-trigger + .menu.is-popover.is-open`. Empty = `.empty > (.icn svg, .ttl, .msg, .btn)`. Skeleton = `<div class="skel" style="height/width">`.

**Files:** Create `Modal.tsx`, `Toast.tsx`, `Menu.tsx`, `Empty.tsx`, `Skeleton.tsx` + stories.

- [ ] **Step 1: Modal**

`Modal.tsx`:
```tsx
import { cx } from "./cx";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, footer, className }: Props) {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className={cx("modal", className)} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="ttl">{title}</span>
          <button type="button" className="x" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer != null && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Toast**

`Toast.tsx`:
```tsx
import { cx } from "./cx";
import type { ReactNode } from "react";

type Props = {
  intent?: "success" | "danger" | "warning";
  icon?: ReactNode;
  title: ReactNode;
  message?: ReactNode;
  onClose?: () => void;
  className?: string;
};

export function Toast({ intent, icon, title, message, onClose, className }: Props) {
  return (
    <div className={cx("toast", intent, className)}>
      {icon != null && <div className="ic">{icon}</div>}
      <div className="body">
        <div className="ttl">{title}</div>
        {message != null && <div className="msg">{message}</div>}
      </div>
      {onClose && (
        <button type="button" className="x" aria-label="Dismiss" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Menu**

`Menu.tsx` (list + item + separator; popover positioning is the consumer's concern via the `.menu-host` wrapper later — here expose the menu and items):
```tsx
import { cx } from "./cx";
import type { HTMLAttributes, ReactNode } from "react";

export function Menu({ popover, open, className, ...rest }: HTMLAttributes<HTMLDivElement> & { popover?: boolean; open?: boolean }) {
  return <div className={cx("menu", popover && "is-popover", open && "is-open", className)} {...rest} />;
}
export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="menu-label">{children}</div>;
}
export function MenuSep() {
  return <div className="menu-sep" />;
}
export function MenuItem({
  icon,
  shortcut,
  danger,
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { icon?: ReactNode; shortcut?: ReactNode; danger?: boolean }) {
  return (
    <div className={cx("menu-item", danger && "danger", className)} role="menuitem" {...rest}>
      {icon != null && <span className="ic">{icon}</span>}
      {children}
      {shortcut != null && <span className="shortcut">{shortcut}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Empty + Skeleton**

`Empty.tsx`:
```tsx
import { cx } from "./cx";
import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: ReactNode;
  message?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function Empty({ icon, title, message, action, className }: Props) {
  return (
    <div className={cx("empty", className)}>
      {icon != null && <span className="icn">{icon}</span>}
      <div className="ttl">{title}</div>
      {message != null && <div className="msg">{message}</div>}
      {action}
    </div>
  );
}
```
`Skeleton.tsx`:
```tsx
import { cx } from "./cx";
import type { CSSProperties } from "react";

export function Skeleton({ width, height, className }: { width?: CSSProperties["width"]; height?: CSSProperties["height"]; className?: string }) {
  return <div className={cx("skel", className)} style={{ width, height }} />;
}
```

- [ ] **Step 5: Stories** — states:
  - `Modal.stories.tsx`: open modal "Level Up — Magic-User 3 → 4" with body text and footer (`<Button variant="ghost">Cancel</Button>` + `<Button variant="primary">Confirm</Button>`). Use local `useState(true)`.
  - `Toast.stories.tsx`: success ("Save passed"), danger, warning, default — stacked.
  - `Menu.stories.tsx`: a `Menu` with MenuLabel, two MenuItems (one with icon + shortcut), MenuSep, a danger MenuItem; plus a popover variant (`popover open`) shown inside a relatively-positioned box.
  - `Empty.stories.tsx`: "No spells memorized" with message + an `action` Button.
  - `Skeleton.stories.tsx`: a few bars of varying width/height.

- [ ] **Step 6: Verify** — `pnpm ladle:build` success; `pnpm exec tsc -b` clean.

- [ ] **Step 7: Commit**

```bash
git add src/ReactorSheet/components/ui/Modal.tsx src/ReactorSheet/components/ui/Toast.tsx src/ReactorSheet/components/ui/Menu.tsx src/ReactorSheet/components/ui/Empty.tsx src/ReactorSheet/components/ui/Skeleton.tsx src/ReactorSheet/components/ui/{Modal,Toast,Menu,Empty,Skeleton}.stories.tsx
git commit -m "feat(ui): Modal, Toast, Menu, Empty, Skeleton"
```

---

## Task 8: Barrel export + Foundry-agnostic guard + final verification

**Files:** Create `src/ReactorSheet/components/ui/index.ts`.

- [ ] **Step 1: Barrel**

`src/ReactorSheet/components/ui/index.ts` — re-export every component:
```ts
export { cx } from "./cx";
export { Stamp } from "./Stamp";
export { Button } from "./Button";
export { Tag } from "./Tag";
export { SectionTitle } from "./SectionTitle";
export { Card, KvCard } from "./Card";
export { Table, Th, Td, Tr } from "./Table";
export { Field, Input } from "./Field";
export { Textarea } from "./Textarea";
export { Select } from "./Select";
export { Stepper } from "./Stepper";
export { Toggle } from "./Toggle";
export { Check } from "./Check";
export { Radio } from "./Radio";
export { Segmented } from "./Segmented";
export { Tabs } from "./Tabs";
export { ProgressBar } from "./ProgressBar";
export { Die } from "./Die";
export { Modal } from "./Modal";
export { Toast } from "./Toast";
export { Menu, MenuLabel, MenuSep, MenuItem } from "./Menu";
export { Empty } from "./Empty";
export { Skeleton } from "./Skeleton";
```

- [ ] **Step 2: Foundry-agnostic guard**

Run:
```bash
grep -rnE "foundry-vtt-react|\\bfoundry\\b|\\bgame\\.|\\bCONFIG\\b|actor\\.system" src/ReactorSheet/components/ui/ --include="*.tsx" --include="*.ts"
```
Expected: NO matches. The `ui/` layer must be pure presentation (so it can lift out to the web app). If anything matches, refactor that dependency out into the consuming layer and report it.

- [ ] **Step 3: Full verification**

- `pnpm exec tsc -b` → clean.
- `pnpm ladle:build` → success; all stories compile.
- `pnpm test` → existing 11 tests still pass (no new tests added — this is presentational).
- `pnpm build` → app still builds green (the `ui/` lib is importable but not yet consumed; that's fine).

- [ ] **Step 4: Visual review (manual / controller via playwright)**

Run `pnpm ladle` and review every component in both themes: default URL (dark) and `?theme=cream`. Drag the resize handle on a story to confirm components don't break across widths. Confirm stamps stay ink+cream in both themes, accents use tokens, no pure white.

- [ ] **Step 5: Commit**

```bash
git add src/ReactorSheet/components/ui/index.ts
git commit -m "feat(ui): barrel export and library index"
```

---

## Task 9: Publish Ladle preview for review

Produce a hosted, browsable Ladle build so the user can review the library without a local server.

**Files:** none (deploy step).

- [ ] **Step 1: Static build at the namespaced base**

Ladle assets must resolve under the Pages subpath, so build with `--base`:
```bash
pnpm ladle:build --base=/reactor-sheet/ladle/
```
Outputs the static site to `build/`. Confirm it contains `index.html` and that asset URLs are prefixed with `/reactor-sheet/ladle/`.

- [ ] **Step 2: Deploy to the `ladle/` subdir of `gh-pages` (does NOT touch the Pages root)**

```bash
npx gh-pages -d build --dest ladle --add -b gh-pages -m "Ladle UI library preview (reskin/ui-library)"
```
- `--dest ladle` publishes into the `ladle/` subdirectory.
- `--add` adds/updates only those files — it does NOT wipe anything else already on `gh-pages` (the repo's Pages root stays free for the web app / module landing).

Preview URL: **`https://tasandberg.github.io/reactor-sheet/ladle/`**

Requires GitHub Pages enabled once for the repo, serving from the `gh-pages` branch (Settings → Pages). If Pages isn't enabled / the push lacks permission, STOP and report in the PR that the build succeeded (`build/` artifact) and Pages just needs enabling — do not fail the whole run.

> Alternative (only if the user provides `NETLIFY_AUTH_TOKEN`): `pnpm dlx netlify-cli deploy --dir=build` (draft deploy); capture the returned URL. Not the default.

If neither credential/Pages path is available, STOP and report in the PR that the build succeeded (`build/` artifact) but publishing needs a deploy credential — do not fail the whole run.

- [ ] **Step 3: Post the URL**

Add the preview URL to the PR description (and a PR comment) so the user can open it. Include a one-line index of the component sections.

- [ ] **Step 4: Commit** (only if a config file was added)

```bash
git add netlify.toml 2>/dev/null || true
git commit -m "chore: Ladle preview deploy config" 2>/dev/null || true
```

---

## Final verification (whole plan)

- [ ] `pnpm exec tsc -b` clean; `pnpm ladle:build` success; `pnpm test` 11/11; `pnpm build` green.
- [ ] Foundry-agnostic grep returns nothing under `ui/`.
- [ ] Every component has a story; both themes render; container resize doesn't break layouts.
- [ ] No new CSS files or hardcoded colors introduced (only token-driven inline layout where unavoidable — ProgressBar/Skeleton).

## Notes / deferred

- **No unit tests by design** — presentational className-mappers; Ladle stories + TS types are the verification surface (matches the stingy-with-tests preference).
- Sheet-specific composed components (header, vitals, the roll→chat wiring, FilePicker portrait) are **not** built here — they live in the Foundry-bound layer in P3–P6 and consume this `ui/` library + the P1 view-models.
- The `.menu` popover *positioning* (anchor/overhang/z-index) is left to the consumer's `.menu-host` wrapper in the chunk that needs it; this task ships the menu surface only.
- If any component's exact contract markup differs from DESIGN_SYSTEM.md once you read the vendored `components.css`, follow the **vendored CSS** (it's the built truth) and report the divergence.
