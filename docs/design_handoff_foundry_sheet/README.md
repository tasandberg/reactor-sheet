# Handoff: OSE Character Sheet — Foundry VTT Sheet

## Overview

Build a **Foundry VTT character sheet** for **Old-School Essentials (OSE)** — starting with the **Classic, race-as-class Magic-User**. The target is the compact pop-out window a player keeps open beside the map during play: roll attacks/saves/abilities, track HP, prepare & cast spells (slot-based memorisation), manage inventory, and level up.

The look, layout, and every interaction are already designed and working as an HTML/React prototype. Your job is to **recreate that design as a real Foundry system (or sheet on an existing system)** using Foundry's own architecture — *not* to embed the React prototype in Foundry.

This Foundry sheet is the **spiritual in-Foundry sibling of the eventual Old School Chronicle web app** — the same design language, tokens, and OSE rules logic, expressed natively at the VTT table. Keep it visually and mechanically consistent with that shared system so a player moving between the web app and the Foundry window feels at home in both.

> Scope note: This bundle is the **Foundry pop-out window** variant only. A separate full-bleed three-column desktop sheet also exists in the source project but is out of scope here.

---

## About the Design Files

The files in `prototype/` are **design references created in HTML + React (UMD + Babel-standalone, no build step)**. They are an interactive specification of the intended look and behaviour — **not production code to port line-by-line.**

A Foundry sheet is **Handlebars templates + a DataModel + an `ApplicationV2`/`ActorSheet` class + Foundry's `Roll`/`ChatMessage` APIs.** React does not run inside a Foundry sheet. So:

- **Recreate** the markup as Handlebars partials.
- **Recreate** the styling from the CSS (the CSS tokens transfer almost 1:1 — see Design Tokens).
- **Reimplement** the game logic in a Foundry DataModel + derived-data methods. The *formulas and tables* in `data.js` are correct and authoritative — copy the numbers, rewrite the plumbing.
- **Reimplement** rolls through Foundry's `Roll` + `ChatMessage` instead of the prototype's in-memory dice store.

If you are starting a brand-new Foundry system from scratch, follow the current Foundry system-development conventions (DataModels, ApplicationV2, Active Effects). If you are extending an existing OSE-compatible system, map these concepts onto its actor schema instead.

---

## Fidelity

**High-fidelity.** Final colours, typography, spacing, layout, copy, and interactions are all settled. Recreate the UI faithfully. The only intentionally-open piece is responsive/mobile tuning, which is deferred.

---

## The single most important file: `prototype/data.js`

This is the **rules brain** and the **canonical demo character**. Everything mechanical the sheet shows is computed from here. Port this first; it becomes your DataModel schema + derived-data logic + a seed Actor.

### Demo / smoke-test character — **Eldra Vey**
Do not invent another character. Use Eldra to validate the port.

- Level 3 **Magic-User**, OSE Classic, title "Conjurer", **Neutral**
- XP 6420 (Lv3 threshold 5000, Lv4 at 10000)
- Abilities: STR 9, INT 17, WIS 12, DEX 13, CON 10, CHA 11
- HP 8/9 · AC AAC 12 / DAC 7 (system toggle, default AAC)
- Encumbrance 380 / cap 1600 coins → Unencumbered, **120′** move
- Coin: 152 gp, 8 sp
- Spellbook L1 (6 spells) + L2 (2 spells); prepared L1 ×2 (Magic Missile, Sleep), L2 ×1 (Web)
- Full weapons / armour / inventory / notes — see `data.js`

### Rules tables & helpers (all in `RULES`, `MU_*`)
Port these verbatim — the numbers are the OSE Classic Magic-User SRD:

| Helper | What it returns | Notes |
|---|---|---|
| `abilityMod(score)` | OSE small modifier | −3 (≤3) … 0 (9–12) … +3 (18) |
| `savesAtLevel(lvl)` | `{D,W,P,B,S}` target numbers | **roll-over**, lower target = better. Two bands: Lv1–5 `{13,14,13,16,15}`, Lv6–10 `{11,12,11,14,12}` |
| `xpFor(lvl)` / `nextXp(lvl)` | XP threshold of this / next level | from `MU_XP_TABLE` |
| `titleFor(lvl)` | class title string | "Medium"→"Wizard" |
| `hdFor(lvl)` | hit-die spec e.g. `"3d4"` | Magic-User is `<lvl>d4` |
| `attackBonus(lvl)` | AAC attack bonus | `MU_AB`: 0 to Lv4, +1 Lv5–8, +2 Lv9 |
| `slots(lvl)` | `[L1..L6]` spell-slot counts | `MU_SLOTS`; Lv3 = `[2,1,0,0,0,0]` |
| `movement(coins)` | `{rate, band}` | encumbrance→move: ≤400→120′, ≤600→90′, ≤800→60′, ≤1600→30′, else 0 |
| `hitsAAC(roll,ab,targetAAC)` | bool | hit if `roll+ab+targetAAC ≥ 20` or nat 20 |
| `isAbilityCheckPass(roll,score)` | bool | **roll-under**: d20 ≤ score |
| `isSavePass(roll,target,wisMod,kind)` | bool | d20(+WIS mod if `kind==="S"`) ≥ target |

`SPELLS` holds the L1/L2 Magic-User catalog (name, range, dur, save, optional `damage`). `MU_XP_TABLE` holds level→{xp, hd, title}.

**Foundry mapping:** `MU_XP_TABLE`/`MU_SLOTS`/`MU_SAVES` become static config (e.g. a `config.js` or system constants). `RULES.*` become methods on your DataModel's `prepareDerivedData()` (AC, saves, slots, init, move, attack bonus are all *derived* — never stored). The demo character becomes a seed Actor / world template.

---

## Screens / Views

There is **one window** with a persistent header + a tabbed body. Default footprint **625 × 750 px**, user-resizable (`min 320×360`), with three Tweak presets (Default / Compact 380×680 / Wide 1040×780 — in Foundry these are just window sizes). The layout is driven by **CSS container queries on `.fvtt-sheet`** so it reflows to the *window* size, not the viewport — replicate that (container queries work fine inside a Foundry app).

### Persistent chrome (always visible, above the tabs)

1. **Titlebar** — `Character: <name>` + sheet menu / compendium / close buttons. In Foundry this is the native app header; you mostly inherit it.
2. **Topbar** — `Lv N` (with current threshold) · **XP progress bar** to next level · `Lv N+1` (next threshold) · **Rest** button · **Level Up** button · **Edit** toggle · theme toggle.
3. **Header (two-pane top)**
   - **Portrait** — square, rounded 6px. Drag-drop image (prototype uses the `image-slot` web component; in Foundry use the native actor `img` / FilePicker). Replace/Remove on hover.
   - **Identity** — name + `Class Level · Alignment`. In **Edit mode** this swaps to form fields (name text, title text, alignment select); **Class and Level are locked** (Level changes only via Level Up; Class drives saves/HD/spells).
   - **Vitals pair** — **Hit Points** (crimson) and **Armor Class** (teal) side by side as the hero numbers.
     - HP: big current value, "Maximum N" sub, −/+ steppers; Edit mode exposes current **and** max steppers.
     - AC: big value; **click to toggle AAC⇄DAC**; hover reveals an **AC breakdown popover** (Base 10 + DEX mod + each equipped ward). AC is **derived, never directly editable.**
   - **Sub-stack** — Init (`+DEX mod`, rolls 1d6+mod), HD (`<lvl>d4`, rolls a hit die), Move (`<rate>′`, read-only).
   - **Saves & Skills** rail (`FvttSavesSkills`) under the header.

### Tabs (vertical rail on the right + a horizontal tab strip)
Counts shown as badges where noted.

- **Actions** — ability plaques (`FvttAbilities`) + the action body (`FvttActions`): attack rolls (melee/missile w/ ammo decrement), damage rolls, the 5 saving throws (D/W/P/B/S), 1-in-6 adventuring skills, coin row.
- **Inventory** (badge = item count) — items with weight; live total weight → encumbrance bar → movement band.
- **Spells** (badge = prepared count) — spellbook by level, prepare into slots, cast = spend slot; damage spells roll their dice; Rest re-memorises.
- **Abilities** (`FvttFeatures`) — class/level features readout.
- **Notes** (`FvttNotes`) — freeform bio/notes text.

### Roll output — **RollToast** (`foundry-app.jsx`)
The prototype shows each roll as a 5.4s auto-dismissing **toast** (dice faces + label + source + total + verdict), because the window has *no chat sidebar*. **In Foundry, send rolls to the real chat log instead** (`ChatMessage` with a roll template). You may keep a brief toast as a nicety, but Foundry chat is the canonical output. (Nat-20 = `crit`, nat-1 = `fumble` styling on d20s.)

---

## Interactions & Behavior

### The roll contract (`prototype/dice.jsx` → `window.queueRoll`)
Every roll in the prototype flows through one function. This is your behavioural spec for what each control rolls; reimplement each as a Foundry `Roll` + chat card.

`queueRoll({ kind, label, source, dice:[{sides,n,mod?}], target?, breakdown?, evaluate? })`
- `evaluate({dice,total})` returns `{ verdict, text }` where `verdict ∈ hit|miss|crit|fumble|success|fail|dmg|null`.
- The kinds used across the sheet: `attack`, `damage`, `ability`, `save`, `skill`, `spell`, `hd`, `init`, `rest`, `levelup`, `info`.

| Action | Dice | Pass/verdict rule |
|---|---|---|
| Attack | `1d20 + attackBonus(lvl)` | `hitsAAC` — needs target AAC; nat-20 crit / nat-1 fumble |
| Damage | weapon die `+mod` | verdict `dmg` |
| Ability check | `1d20` | **roll-under**: pass if ≤ score |
| Save | `1d20` (+WIS mod on S) | **roll-over**: pass if ≥ target |
| Skill | `1d6` | pass if ≤ N (the "N-in-6") |
| Spell | spell's damage die, or 1d20 marker | spends a slot |
| Hit Die | `<lvl>d4` | informational |
| Initiative | `1d6 + DEX mod` | informational |

### Stateful flows (drive these off the DataModel + Active Effects / item updates)
- **HP +/−** — clamp 0..max. Edit mode also edits max (current clamps to new max).
- **AC toggle** — flips `ac.system` AAC⇄DAC; the shown value follows; AC value is derived from base 10 + DEX + equipped wards.
- **Ammo** — missile attacks decrement `weapon.ammo`; block at 0.
- **Spell prep / cast** — prepare from spellbook into the level's slots (cap = `slots(lvl)[i]`); casting moves a spell into `spent`; **Rest** clears `spent` (re-memorise) and heals 1d3.
- **Encumbrance** — inventory weight total → `movement()` band → move rate. Recompute live on any item change.
- **Level Up** — guard on `xp ≥ nextXp(lvl)`; on success: roll `1d<hd sides>` for HP gain, bump level, refresh title, raise max & current HP. (Saves/slots/attack bonus then re-derive from the new level automatically — that's the point of keeping them derived.)
- **Edit mode** — a sheet-wide toggle that swaps display cells for editable controls on the *mechanical* fields (abilities, name/title/alignment, max HP). Derived stats stay read-only and update live. Map this onto Foundry's sheet edit affordances or a custom toggle.

### Theme
Two first-class themes, `dark` (default in this window) and `cream`, toggled via `document.documentElement.dataset.theme`. In Foundry, drive this with a body/root class or a client setting. **No pure white anywhere.**

---

## State Management → Foundry data model

The prototype holds one `char` object in React state. Decompose it into Foundry's actor model:

- **Stored on the Actor (`system.*`)**: name/title/alignment, class, level, xp, abilities `{STR…CHA}`, `hp.{current,max}`, `ac.{system, ...}` *base inputs only*, coin, encumbrance inputs, `prepared`/`spent` spell state, notes, the AC-system toggle.
- **Items (recommended)**: weapons, armour/wards, inventory, spells, spellbook entries → Foundry Items embedded on the Actor (gives you drag-drop, compendium reuse, Active Effects for wards/rings).
- **Derived (`prepareDerivedData`, never stored)**: ability modifiers, AC value & breakdown, saves table, spell-slot capacities, attack bonus, initiative mod, HD, movement rate & band, encumbrance %, XP %.
- **Config/constants (not on the actor)**: `MU_XP_TABLE`, `MU_SLOTS`, `MU_SAVES`, `MU_AB`, spell catalog.

Ascending/descending AC must be supported **per-character** (the toggle). Data model should already flex toward **OSE Advanced Fantasy** (race + class split, more classes) — keep class/level/saves/slots/HD table-driven so a second ruleset is added as data, not a fork.

---

## Design Tokens

All tokens live at the top of `prototype/styles.css` as CSS custom properties and transfer to Foundry almost unchanged. **Reuse them — do not invent new colours.** Type sizes are rem tokens anchored on a 16px root (`html { font-size: 100% }` — never override font-size on `<html>`). Radii: `--r-sm 4 / --r-md 6 / --r-lg 10 / --r-xl 14`.

### Type
- **Display** (`--display`): `IM Fell English SC` — stamped labels, section heads, big stat values.
- **Body serif** (`--serif`): `IM Fell English` italic — rule callouts / flavour.
- **Sans** (`--sans`): `Inter` — all interactive UI (buttons, tabs, forms). Keep controls sans, not serif.
- **Mono** (`--mono`): `JetBrains Mono` — stat readouts, formulae, dice.
- Section heads: Title Case (IM Fell SC renders small-caps natively) with a 3px rule under.
- Scale: `--fs-3xs` 10px … `--fs-8xl` 56px; `--fs-base` 15px body. Line-heights `--lh-flush/tight/snug/normal`.

### Colour (theme-independent)
- `--ink #070605` background / `--stamp-text #e5dec8` caps — the ink-stamp treatment for stat keys (STR/HP/AC labels, ability codes). The most distinctive recurring element.

### Colour (dark theme — default in this window)
| Token | Value | Use |
|---|---|---|
| `--bg` / `--bg-2` | `#181612` / `#1f1c17` | window / panel grounds |
| `--surface` … `--surface-3` | `#23201a` `#2e2a23` `#3a3429` | raised panels |
| `--text` / `--text-dim` / `--text-mute` / `--text-faint` | `#e5dec8` `#b5ad97` `#8a8270` `#6a6354` | text ramp |
| `--border` / `--border-soft` | `#3a342c` / `#2c2823` | hairlines |
| `--teal` | `#1f7575` | **primary accent** — magic, XP, primary, active |
| `--crimson` | `#c75044` | damage, danger, HP |
| `--forest` | `#7a9272` | success, hits, saves |
| `--mustard` | `#d4b878` | warning / secondary |
| `--accent-alt` | `#c89e54` | brass-gold — XP, treasure, level-up |
| `--on-accent` | `#070605` (ink) | text on a teal/brass fill |

### Colour (cream theme — shifts that change vs dark)
`--bg #efe9d8`, `--bg-2 #e8e1ca`, `--surface #f5efde`, `--text #1a1715`, `--border #c8bea0`; `--crimson #b03a20`, `--forest #3d6e3d`, `--mustard #8a6a20`, `--accent-alt #8a6418`; `--on-accent` = cream `#e5dec8`. Tokens are identical across themes — only values shift.

> The Foundry window's `foundry-styles.css` aliases `--gold` to `--accent-alt` (and to `--teal` when the "Teal" accent Tweak is chosen). Legacy aliases `--brass/--oxblood/--sage` point at the semantic tokens so nothing breaks.

---

## Assets

- **Fonts** — IM Fell English SC, IM Fell English, Inter, JetBrains Mono (Google Fonts; `<link>` in the prototype `<head>`). Bundle them with the Foundry module rather than hot-linking.
- **Portrait** — user-supplied per character. Prototype uses the `image-slot` web component (`prototype/image-slot.js`); in Foundry use the native actor portrait + FilePicker. The demo ships with no portrait (drop target only).
- **Icons** — simple ASCII glyphs / Unicode in the ink stamps and tab rail (◈ ▤ ✦ ❖ ✎ etc.). **No hand-drawn SVG, no emoji.** Swap for your icon set or keep the glyphs.
- No raster art assets are required to ship the MVP.

---

## Files in this bundle

### `prototype/` — the design reference (recreate, don't embed)
| File | Role | Port target in Foundry |
|---|---|---|
| `OSE Character Sheet - Foundry.html` | entry point; shows load order | the sheet template + class registration |
| `data.js` | **rules tables + helpers + demo character** | DataModel schema, `prepareDerivedData`, config constants, seed actor |
| `foundry-app.jsx` | window shell: titlebar, topbar (XP/Rest/Level-Up/Edit), header (portrait/HP/AC/sub-stats), tab routing, RollToast, AC breakdown | main `ActorSheet`/`ApplicationV2` + Handlebars header partial + chat output |
| `foundry-panels.jsx` | tab bodies: abilities, actions (attacks/saves/skills/coin), inventory, spells, features, notes | Handlebars partials + sheet listeners |
| `dice.jsx` | `queueRoll` roll contract + tray/log | Foundry `Roll` + `ChatMessage` + chat card template |
| `foundry-styles.css` | window chrome + compact panel layout (container queries) | sheet CSS |
| `styles.css` | **design tokens** — colour, rem type scale, radii | sheet CSS `:root` tokens |
| `design-system.css` | shared component/token styling | sheet CSS |
| `image-slot.js` | portrait drop component | replace with native Foundry portrait/FilePicker |
| `tweaks-panel.jsx` | prototype-only knobs (window size, accent, map backdrop) | **not needed** — becomes window sizing / a client setting, or drop entirely |

### `reference/`
| File | Role |
|---|---|
| `DESIGN_SYSTEM.md` | the committed design system — type pairing, palette/tokens, the ink-stamp treatment, section-head rule, theme rules |

---

## Suggested build order

1. **DataModel + config** from `data.js` — abilities, level/xp, hp, ac inputs, coin, encumbrance; static tables for saves/slots/xp/hd/attack-bonus. Seed Eldra Vey.
2. **`prepareDerivedData`** — ability mods, AC (+ breakdown), saves table, slot capacities, attack bonus, init, HD, movement, %s. Verify every derived number matches Eldra's sheet in the prototype.
3. **Sheet shell + header** — titlebar/topbar/portrait/HP/AC/sub-stats; container-query layout; tokens wired; both themes.
4. **Rolls** — port each `queueRoll` kind to `Roll` + a chat card; respect roll-under (ability/skill) vs roll-over (save) vs AAC hit.
5. **Tabs** — Actions, then Inventory (live encumbrance), Spells (prep/cast/rest), Abilities, Notes.
6. **Flows** — HP +/−, AC toggle, ammo, Edit mode, Level Up.
7. **Smoke test** — reproduce Eldra exactly; roll one of every kind; level her to 4 and confirm saves/slots/HD re-derive.

---

*Recreate the design in Foundry's native architecture using current Foundry system-development conventions. The HTML/React here is the spec, not the implementation.*
