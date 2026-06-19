# Handoff: OSE Character Sheet — Compact (Foundry-window) layout & Inventory

## Overview

This is the **online character sheet + campaign hub** for **Old-School Essentials (OSE)** — the role D&D Beyond fills for 5e, but for OSE. Players keep it open beside their VTT (Foundry, Roll20, Owlbear) and use it as a live sheet: roll dice, track HP, manage spell prep, mark inventory, equip gear.

This bundle is the **compact / "Foundry-window" presentation** — a resizable window (≈500–1040 px wide) meant to sit next to a VTT. The demo character is **Eldra Vey**, a level-3 Magic-User.

### What is definitive here

This package is **definitive for the medium and large (desktop / window) layout** — especially the **Inventory**, the **collapsing header**, and the **tab content** (Actions, Abilities/Features, Spells).

> ⚠️ **Mobile layout is NOT defined here.** The current live app has a better small-screen layout. For phone/narrow widths, take the mobile layout from the live version — this bundle is the source of truth for **medium and large only**.

## About the design files

The files in `prototype/` are **design references created in HTML/CSS + React-via-Babel** — runnable prototypes showing intended look and behavior. **They are not production code to ship directly.** Recreate these designs in the target codebase's environment (React/Vue/Svelte/etc.) using its established patterns, component library, and state tooling. The prototypes use UMD React + in-browser Babel and global `window.*` wiring only so they run with no build step — do not carry those patterns into production.

To view: serve `prototype/` over any static server and open `OSE Character Sheet Composite.html` (needs network for Google Fonts + Font Awesome). Resize the window/iframe to see responsive behavior; toggle theme with the ◐ button.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, interactions, and copy. All visual values are tokenized in `prototype/styles.css` (see **Design Tokens**) — reuse those tokens; never hardcode px font-sizes or invent colors.

---

## ⭐ Key interactive behaviors (implement these precisely)

These behaviors are the heart of the design — describe-and-rebuild them faithfully.

### 1. Header collapses to a minibar on scroll
- The full identity header shows: square **portrait**, **name** (display serif ~33px), **class · level · alignment**, the **INIT / HD / MOVE** ink-stamp sub-stats, and the **HP / AC** hero cards.
- As the tab body scrolls, the **moment the character name scrolls out of view** the whole header collapses into a single pinned **minibar**: small portrait + name + class/level + a compact **HP** field + a compact **AC** chip.
- The collapse threshold is **computed dynamically from the name element's offset** (`scrollTop > name.offsetTop + name.offsetHeight − 8`), not a magic pixel number — so it stays correct if the header reflows. Reverses on scroll up. Use a short transition; no layout jank.
- Implementation reference: `foundry-app.jsx` (scroll listener + `scrolled`/`minibar` state), `foundry-styles.css` (`.fvtt-minibar`, topbar).

### 2. Inventory: Equipped tray + All Items list, BOTH headers sticky
- The inventory is a **single list view** (a previous grid view + list/grid toggle were **removed** — do not reintroduce). Two stacked sections:
  - **"Equipped items"** tray (top): dashed-bordered row of large square cards, one per equipped item; hover a card → popover (name, type, key detail, "Click to unequip"); click → unequip.
  - **"All Items"** table below: every item, with drag handle, ink-stamp icon, name (+ muted `xN` qty), Type, weapon damage, weight, and an equip toggle.
- **Both the Equipped tray AND the All Items header stay pinned while the list scrolls.** The Equipped tray is `position: sticky; top: 0; z-index: 7`. The All Items header is also sticky, and its `top` is **set in JS to the measured height of the equipped tray** (`useLayoutEffect` measuring `.il-sec-equipped` → sets the header's `top`, recomputed on resize) so it pins flush *beneath* the tray (`z-index: 6`, tucks under).
- Reference: `hifi-center.jsx` (Inventory component + the sticky-offset `useLayoutEffect`), `hifi-sheet.css` (`.il-sec-equipped`, `.il-list .il-sec > .il-sechead`).

### 3. Equip / unequip — three ways, teal = equipped
- Click the **hand toggle** in an All Items row (`fa-regular fa-hand` outline = unequipped → **`fa-solid fa-hand` teal** = equipped).
- Click a card in the **Equipped tray** to unequip.
- **Drag any All Items row onto the Equipped tray** to equip it.
- **Teal is reserved for the equipped state everywhere.**

### 4. Drag-to-reorder + containers (e.g. Backpack)
- All Items rows **drag to reorder** (single unified drag group — any item moves anywhere). The drop position shows as a **2px teal inset rule** on the target row's leading/trailing edge (never reflows mid-drag). Hook: `useDragReorder.jsx`.
- A **container** is just an item flagged `container: true` with a `containerZone`. Items whose `zone` equals that `containerZone` are its contents.
- **Drag a row onto a container row to stow it inside** (the container row highlights with a **brass** ring while hovered — brass `--accent-alt`, NOT teal). Its nested items render **indented beneath the container**, each with a brass left-rail + brass-tinted icon, in display order.
- The container row shows a **brass count pill** and a **caret** that collapses/expands its nested rows (state persisted per character).
- **Drag a nested row back among the top-level rows to take it out** (reordering at top level un-nests → `zone: "carried"`). Nesting also clears `equipped`.
- Reference: `hifi-center.jsx` (`setZoneByKey`, `onNest`/`onReorder`, `displayRows`, `ilRow`), `hifi-sheet.css` (`.il-row.il-container`, `.il-row.il-nested`, `.il-caret`, `.drop-into`).

### 5. Encumbrance drives movement
- Always-visible bar: `Encumbrance <carried> / <cap> cn` + movement band/rate; fill width = `carried / cap`. Recomputes live as items are added/removed/nested. All computed stats come from one `derive(char, houseRules)` helper (`hifi-panels.jsx`).

### 6. HP edit & AC popover
- **HP**: click the HP value (full header) or use the minibar's HP **number input** (`type=number`, native spinners hidden, value in crimson, **Enter blurs/commits**).
- **AC**: hover the AC card (full header) or the minibar AC chip → a **popover with the full AC breakdown** (base + DEX + sources). Supports both ascending (AAC) and descending (DAC) per character.

### 7. Actions tab — Memorized Spells quick-cast
- Below Attacks / Saving Throws / Exploration, the Actions tab shows a **"Memorized Spells"** section listing the character's currently-prepared spells with a **cast** button each. Casting spends the slot (marks spent + routes a roll via `queueRoll`); damage spells roll their damage. Mirrors the Spells tab's cast logic so play happens without leaving Actions. Reference: `foundry-panels.jsx` `FvttActions`.

### 8. Abilities tab — collapsible class-feature cards
- Each class/race feature is a **card: ink-stamp image + title**, **collapsed by default**, expanding on click to reveal its **description**.
- Features may be **rollable**: a feature with a `roll: { sides, target? }` field shows a dice tag (e.g. `1d6 ≤ 2`) and a **Roll** button that pipes through `queueRoll` (roll-under success/fail when `target` is set). Eldra (Magic-User) has only passive features, so none display a roll — populate `roll` on a feature (e.g. a Dwarf's "Detect Construction Tricks", 1-in-6) to surface it. Data lives on `char.features[]` in `data.js`; reference `foundry-panels.jsx` `FvttFeatures`, `foundry-styles.css` `.fvtt-feat`.

### 9. Responsive (window) & theme
- A **container query** on the inventory section shrinks chrome at narrow window widths. Full phone layout is **out of scope** (use live mobile version).
- **Theme** toggles `data-theme` between `dark`/`cream` at runtime (◐ button). Both first-class.

---

## Aesthetic direction

Modern app shell with vintage typographic accents — "woodcut/spellbook" feel without the parchment-skeuomorph trap. Two themes via `data-theme` on `<html>`: **dark** (token default) and **cream** (parchment; product default).

- **Display** `IM Fell English SC` — stamped labels, section heads, big stat values (small-caps native → Title Case, never uppercased).
- **Body serif** `IM Fell English` (italic) — rule callouts / flavor.
- **Sans** `Inter` — all interactive UI (buttons, tabs, table column heads, form controls).
- **Mono** `JetBrains Mono` — stat readouts, dice, weights, counts.
- **Ink-black stamps**: near-black `--ink #070605` rounded square holding cream small-caps/glyph — used for stat keys, INIT/HD/MOVE, item icons, feature images. Theme-independent (always ink + cream text).
- No pure white; no hand-drawn icons/emoji — real SVG icons (Font Awesome in the prototype) or typographic glyphs in ink stamps. Item/feature "art" is monogram glyphs in ink stamps (placeholders for real images).

## The window shell

`foundry-app.jsx` + `foundry-styles.css`: **titlebar** (`Character: <name>` + window controls) → **topbar** (`Lv N` + XP bar + next-level XP, then **Rest**, **Level Up** [brass when XP threshold reached], **Edit**, **theme ◐**) → **collapsing identity header / minibar** (behavior #1) → **vertical tab rail** (Actions / Inventory / Spells / Abilities / Notes, with counts; active tab persists per character) → scrolling **body** → dice/log sidebar (`foundry-chat.jsx`). Dice route through one entry point: `window.queueRoll({...})` (`dice.jsx`).

## Tabs

- **Actions** (`FvttActions` in `foundry-panels.jsx` + `FvttAbilities`): attacks (melee/missile, ammo tracking), damage, ability checks (roll-under d20), saving throws (D/W/P/B/S), exploration skills (1-in-6), **Memorized Spells quick-cast** (behavior #7), movement + wealth footer.
- **Inventory** (`hifi-center.jsx` `Inventory` via `window.HF.Inventory`): behaviors #2–#6.
- **Spells** (`FvttSpells`): slot-based Magic-User memorisation — prepare from spellbook, cast to spend a slot, rest to recover.
- **Abilities** (`FvttFeatures`): collapsible class-feature cards (behavior #8) + languages.
- **Notes** (`FvttNotes`): freeform bio/notes.

## State (prototype — re-implement with real app state)

Per character: `hp.current/max`, ability scores, `weapons[]`, `armor[]`, `inventory[]` (gear item: `name, qty, qtyMax?, wt, slot, zone, equipped?, container?, containerZone?`), `spellbook`/`prepared`/`spent`, `xp`, `level`, `coin`, `notes`, `features[]` (`{ title, glyph, desc, roll? }`), AC system (AAC/DAC). Demo data + rules helpers (`RULES.savesAtLevel/slots/nextXp/...`) in `data.js`. **UI-only** persisted bits in the prototype (replace with real persistence): active tab (`osc.tab.<id>`), inventory drag order (`osc.invOrder.<id>`), container collapse (`osc.invCollapsed.<id>`).

## Design tokens

All in `prototype/styles.css` under `:root` (dark) and `[data-theme="cream"]`. **Reuse; never hardcode.**

**Theme-independent**: `--ink #070605`, `--stamp-text #e5dec8` (+ dim/faint); radii `--r-sm 4 / --r-md 6 / --r-lg 10 / --r-xl 14`; fonts `--display / --serif / --sans / --mono`; rem type scale `--fs-3xs 10 … --fs-8xl 56` (anchored on 16px root — never override `<html>` font-size); line-heights `--lh-flush/tight/snug/normal`.

**Dark**: bg `#181612`/`#1f1c17`; surfaces `#23201a`/`#2e2a23`/`#3a3429`; text `#e5dec8`/`#b5ad97`/`#8a8270`/`#6a6354`; borders `#3a342c`/`#2c2823`; teal `#1f7575`, crimson `#c75044`, forest `#7a9272`, mustard `#d4b878`, accent-alt (brass) `#c89e54`/dim `#a88240`; `--on-accent: ink`.

**Cream**: bg `#efe9d8`/`#e8e1ca`; surfaces `#f5efde`/`#e6dfca`/`#d8cfb5`; text `#1a1715`/`#5a5550`/`#8a8480`/`#aaa295`; borders `#c8bea0`/`#d8cfb5`; teal `#1f7575`, crimson `#b03a20`, forest `#3d6e3d`, mustard `#8a6a20`, accent-alt `#8a6418`/dim `#6e4f12`; `--on-accent: stamp-text`.

**Semantic/state**: equipped = **teal**; container membership = **brass** (`--accent-alt`; on the always-ink item icons a mid-brass `#a88240` is used so it reads on dark in both themes). Coin dots (`.ci.gp/.sp/.cp/.pp/.ep` in `foundry-styles.css`) are deepened/saturated under `[data-theme="cream"]` so the pale metals don't wash out on parchment.

## Assets

- **Fonts**: Google Fonts — IM Fell English SC, IM Fell English (ital), Inter (400/500/600/700), JetBrains Mono (400/500/700).
- **Icons**: Font Awesome 6.5.2 (equip hand = `fa-hand` regular/solid; chevrons/checks). Swap for the codebase's icon set.
- **Portrait + feature/item art**: drag-drop via the `image-slot` web component (`image-slot.js`) for the portrait; item & feature images are ink-stamp glyph placeholders — wire real art/upload in production.

## Files (in `prototype/`)

| File | Role |
|---|---|
| `OSE Character Sheet Composite.html` | Entry point — loads everything below |
| `styles.css` | **Design tokens** — colors, rem type scale, radii (start here) |
| `design-system.css` | Additional shared component/token styles |
| `foundry-styles.css` | Window chrome: titlebar, topbar, collapsing header/**minibar**, tab rail, HP/AC cards & popovers, **feature cards**, coin dots |
| `hifi-sheet.css` | **Inventory** — equipped tray, All Items table, sticky headers, drag/nesting indicators, container caret, encumbrance |
| `foundry-inventory.css` | Spacing overrides so the inventory fits the window column |
| `data.js` | Demo character **Eldra Vey** (incl. `features[]`) + rules helpers |
| `hifi-panels.jsx` | Left-rail panels + abilities + the `derive(char, hr)` computed-stats helper |
| `hifi-center.jsx` | **Inventory** (equipped tray, All Items list, container nesting/collapse, sticky-offset effect) |
| `useDragReorder.jsx` | Reusable drag-to-reorder hook (edge indicator + container `onNest`) |
| `foundry-app.jsx` | Window shell: titlebar, topbar, header→minibar collapse, tab routing, theme |
| `foundry-panels.jsx` | Actions (+ Memorized Spells), Spells, **Features cards**, Notes |
| `dice.jsx` | Shared dice store + result-card log; `window.queueRoll(...)` |
| `tweaks-panel.jsx` | In-page knob panel (prototype-only) |
| `image-slot.js` | Drag-drop portrait web component |

## Implementation notes / gotchas

- **Theme is `data-theme` on the root** — never override `font-size` on `<html>` (every rem token shifts).
- In the prototype, deeply-scoped `[data-theme="cream"] .x .y` rules proved unreliable for one equipped-hand color; values were routed through inherited custom properties / theme-independent literals. In a real CSS pipeline this isn't a concern — keep equipped = teal, container = brass.
- Item/feature icons are always ink-dark in **both** themes, so any accent on them must read on dark (cream `--accent-alt-dim` is too dark on ink — `#a88240` is used where an on-ink brass is needed).
- US spelling in UI copy ("Armor Class"); attack/damage controls show actual dice (`d20 +mod`, `1dN`), not the words.
