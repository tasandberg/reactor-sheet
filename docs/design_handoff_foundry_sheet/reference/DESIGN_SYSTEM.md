# Vellum — Design System Reference

Portable reference for migrating the OSE Character Sheet design system to any frontend stack (Next.js, Vite + React, SvelteKit, etc.). The HTML/JSX in this repo is throwaway prototype scaffolding — **this document plus `styles.css` + `design-system.css` is the contract.**

For a live, browsable preview of every component, open `Design System.html`.

---

## Principles

1. **One token set, two themes.** Every color goes through a CSS custom property on `:root`. `[data-theme="cream"]` overrides only the values that shift — token *names* never change. Components consume tokens, not raw hex.
2. **Stamps don't follow the theme.** The ink-black-with-cream-caps "stamp" treatment (used for STR/HP/AC and other stat keys) is the same in both themes. It uses `--ink` / `--stamp-text`, which are constants.
3. **`--on-accent` is its own token.** Text that sits *on* a teal/brass surface gets `--on-accent`, not `--text`. In dark mode that's the ink color; in cream mode it's the cream stamp-text. Never hardcode `var(--ink)` on accent buttons.
4. **No pure white.** Even the cream theme's lightest surface is `#fbf5e2`, not `#fff`.
5. **IM Fell English SC renders small caps natively.** Don't apply `text-transform: uppercase` to display text — it doubles the caps. Apply uppercase to **sans** UI elements only (tabs, buttons, labels).
6. **Hit targets ≥ 44 px on touch.** Desktop primary, but build with this floor.

---

## Type

| Token                 | Family                                                          | Use                                              |
| --------------------- | --------------------------------------------------------------- | ------------------------------------------------ |
| `--display`           | `"IM Fell English SC", "IM Fell English", Georgia, serif`       | Headings, section titles, stat values, monograms |
| `--serif`             | `"IM Fell English", Georgia, serif`                             | Body copy, rule callouts, flavour, empty states  |
| `--sans`              | `"Inter", -apple-system, system-ui, sans-serif`                 | Buttons, tabs, nav, form controls, micro-labels  |
| `--mono`              | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace`    | Stats, formulae, dice, hex codes, timestamps     |

### Scale (display + serif)

| Use case             | Size | Line-height | Tracking |
| -------------------- | ---- | ----------- | -------- |
| Display XL           | 44   | 1.1         | 0.02em   |
| Display L            | 32   | 1.1         | 0.02em   |
| Section title        | 22   | 1.15        | 0.02em   |
| Card title           | 15   | 1.2         | 0.02em   |
| Body                 | 14   | 1.55        | 0        |
| Body small / italic  | 12.5 | 1.5         | 0        |

### Scale (sans / UI)

| Use case                | Size | Weight | Tracking | Notes                       |
| ----------------------- | ---- | ------ | -------- | --------------------------- |
| UI body                 | 13.5 | 400    | 0        | Inputs, body text in panels |
| UI label                | 11   | 500    | 0.08em   | `text-transform: uppercase` |
| Button text             | 11   | 500    | 0.1em    | `text-transform: uppercase` |
| Tab text                | 11.5 | 500    | 0.1em    | `text-transform: uppercase` |
| Micro                   | 10   | 600    | 0.1em    | Section labels in sidebars  |

### Scale (mono)

| Use case          | Size | Notes                              |
| ----------------- | ---- | ---------------------------------- |
| Formula           | 13   | "1d20 + 2 = 17 vs AAC 12"           |
| Stat value        | 12   | Right-aligned in tables             |
| Hex code          | 10   | Color swatches, timestamps          |

---

## Color

### Dark theme (default)

| Token             | Value      | Role                              |
| ----------------- | ---------- | --------------------------------- |
| `--bg`            | `#181612`  | Page background                   |
| `--bg-2`          | `#1f1c17`  | Topbar background, alt page bg    |
| `--surface`       | `#23201a`  | Cards, panels                     |
| `--surface-2`     | `#2e2a23`  | Raised cards, button bg           |
| `--surface-3`     | `#3a3429`  | Input bg, pressed buttons         |
| `--border`        | `#3a342c`  | Primary border                    |
| `--border-soft`   | `#2c2823`  | Subtle dividers                   |
| `--text`          | `#e5dec8`  | Primary text                      |
| `--text-dim`      | `#b5ad97`  | Secondary text                    |
| `--text-mute`     | `#8a8270`  | Labels, hints                     |
| `--text-faint`    | `#6a6354`  | Timestamps, axis labels           |
| `--teal`          | `#1f7575`  | Primary accent · magic · active   |
| `--teal-dim`      | `#165858`  | Hover/pressed teal                |
| `--crimson`       | `#c75044`  | Damage · danger · HP              |
| `--crimson-dim`   | `#a83a2a`  | Hover/pressed crimson             |
| `--forest`        | `#7a9272`  | Hit · success · save              |
| `--mustard`       | `#d4b878`  | Warning · secondary               |
| `--accent-alt`    | `#c89e54`  | Brass-gold alt accent · treasure  |
| `--accent-alt-dim`| `#a88240`  | Hover brass                       |

### Cream theme (`[data-theme="cream"]`)

| Token            | Value      | Notes                              |
| ---------------- | ---------- | ---------------------------------- |
| `--bg`           | `#efe9d8`  | Warm parchment background          |
| `--bg-2`         | `#e8e1ca`  | Alt parchment                      |
| `--surface`      | `#f5efde`  | Card background (NOT white)        |
| `--surface-2`    | `#e6dfca`  | Raised cards                       |
| `--surface-3`    | `#d8cfb5`  | Input bg                           |
| `--border`       | `#c8bea0`  | Primary border                     |
| `--border-soft`  | `#d8cfb5`  | Subtle dividers                    |
| `--text`         | `#1a1715`  | Primary text                       |
| `--text-dim`     | `#5a5550`  | Secondary text                     |
| `--text-mute`    | `#8a8480`  | Labels                             |
| `--text-faint`   | `#aaa295`  | Timestamps                         |
| `--teal`         | `#1f7575`  | Same as dark — works on cream     |
| `--teal-dim`     | `#165858`  |                                    |
| `--crimson`      | `#b03a20`  | Darker on cream                    |
| `--crimson-dim`  | `#862c18`  |                                    |
| `--forest`       | `#3d6e3d`  | Darker on cream                    |
| `--mustard`      | `#8a6a20`  | Darker on cream                    |
| `--accent-alt`   | `#8a6418`  | Darker brass on cream              |
| `--accent-alt-dim`| `#6e4f12` |                                    |

### Theme-independent

| Token              | Value      | Notes                                          |
| ------------------ | ---------- | ---------------------------------------------- |
| `--ink`            | `#070605`  | Stamp background. Constant across themes.      |
| `--stamp-text`     | `#e5dec8`  | Cream cap text on ink. Constant.               |
| `--stamp-text-dim` | `rgba(229,222,200,.55)` | Secondary text on ink (topbar crumb) |
| `--on-accent`      | `var(--ink)` (dark) / `var(--stamp-text)` (cream) | Text on teal/brass fills. **Always use this** when placing text on accent backgrounds. |

### Semantic aliases

```css
--hit:     var(--forest);
--miss:    var(--text-mute);
--damage:  var(--crimson);
--magic:   var(--teal);
--gold:    var(--mustard);
```

### Legacy aliases (do not introduce new uses)

```css
--brass:    var(--teal);   /* old code that called the primary accent "brass" */
--oxblood:  var(--crimson);
--sage:     var(--forest);
--lapis:    var(--teal);
```

---

## Spacing & Radius

| Token     | Value | Use                              |
| --------- | ----- | -------------------------------- |
| `--r-sm`  | 4px   | Inputs, small buttons            |
| `--r-md`  | 6px   | Cards (default)                  |
| `--r-lg`  | 10px  | Modals                           |
| `--r-xl`  | 14px  | Feature cards                    |

Spacing scale (use directly, no tokens for these — they're well-known steps): **4 · 6 · 10 · 14 · 18 · 24 · 32 · 44**.

---

## Component classes

All defined in `styles.css` (sheet-specific) and `design-system.css` (everything else).

### Stamp (the iconic OSE element)

```html
<span class="stamp lg">Strength</span>     <!-- 22px display, big -->
<span class="stamp md">AC</span>           <!-- 14px display, medium -->
<span class="stamp sm">HP</span>           <!-- 11px display, small (most common) -->
```

Black bg + cream caps regardless of theme. Use for stat keys (STR, INT, etc.), save codes (D/W/P/B/S), skill codes (FG/FT/HT/LD/OD/SD), section labels inside cards, and any tiny inviolable label.

### Section title

```html
<h3 class="section-title">Spells Memorized <span class="hint">cast a slot to spend it</span></h3>
```

Title Case (no uppercase) + 3px rule. The `.hint` span is italic serif and truncates if it overflows.

### Buttons

```html
<button class="btn">Default</button>
<button class="btn primary">Teal fill</button>
<button class="btn danger">Crimson outline</button>
<button class="btn ghost">No border</button>
<button class="btn sm primary">Small</button>
<button class="btn" disabled>Disabled</button>
```

### Form controls

```html
<div class="field">
  <label class="field-label">Character name</label>
  <input class="input" />
  <span class="field-hint">As it appears on session sheets.</span>
</div>

<textarea class="textarea"></textarea>

<select class="select"><option>…</option></select>

<div class="stepper">
  <button>−</button>
  <input type="number" />
  <button>+</button>
</div>

<label class="toggle">
  <input type="checkbox" />
  <span class="track"></span>
  Show derived stats
</label>

<label class="check">
  <input type="checkbox" />
  <span class="box"></span>
  Prepared
</label>

<label class="radio">
  <input type="radio" name="ac" />
  <span class="dot"></span>
  Ascending AC
</label>

<div class="segmented">
  <button class="on">Combat</button>
  <button>Spells</button>
</div>
```

Validation states: add `.is-error` to `.input` / `.textarea` / `.select` for crimson border; pair with `.field-error` text.

### Tabs

```html
<div class="tabs">
  <button class="tab active">Combat</button>
  <button class="tab">Spells <span class="count">3</span></button>
  <button class="tab">Inventory <span class="count">15</span></button>
</div>
```

### Cards & panels

`.card` is the default rectangular container. `.kv-card` centers a large stat with a label stamp. `.weapon` is a one-line row pattern.

### Tables

```html
<table class="table">
  <thead><tr><th>Spell</th><th class="num">Level</th></tr></thead>
  <tbody>
    <tr><td>Magic Missile</td><td class="num">1</td></tr>
  </tbody>
</table>
```

Header is always an ink stamp (cream caps on black). Even rows get a subtle alt tint. Add `.num` for right-aligned mono numerics.

### Tags / badges

```html
<span class="tag">Common</span>                <!-- neutral, mono -->
<span class="tag teal">magic-user</span>       <!-- intent variants -->
<span class="tag crimson">low HP</span>
<span class="tag forest">save passed</span>
<span class="tag mustard">over-encumbered</span>
<span class="tag solid">XP</span>              <!-- ink-stamp tag -->
```

### Dropdown menu

```html
<div class="menu">
  <div class="menu-label">Character</div>
  <div class="menu-item"><span class="ic">↻</span>Rest 1 day <span class="shortcut">⌘R</span></div>
  <div class="menu-sep"></div>
  <div class="menu-item danger"><span class="ic">×</span>Delete character</div>
</div>
```

#### Overflow trigger + floating popover

For card overflow menus (the ⋯ chip on tiles, list rows, etc.), use the canonical pattern:

```html
<div class="menu-host">      <!-- position: relative anchor -->
  <!-- card contents -->
  <button class="menu-trigger on-hover card-corner" aria-label="More">⋯</button>
  <div class="menu is-popover align-overhang is-open">
    <div class="menu-item"><span class="ic">✎</span>Rename</div>
    <div class="menu-sep"></div>
    <div class="menu-item danger"><span class="ic">×</span>Remove</div>
  </div>
</div>
```

Modifiers:
- `.menu-trigger.card-corner` — absolute top-right corner of the host
- `.menu-trigger.on-hover` — hidden until host is hovered/focused
- `.menu-trigger.light` — flat surface variant (ghost button with border instead of dark-on-image chip)
- `.menu-trigger.is-open` — locks visible + applies pressed state (toggle in JS)
- `.menu.is-popover` — absolute-positioned floating menu with arrow indicator. Hidden by default; add `.is-open` to show.
- Alignment: `.align-start` (anchor to left edge of host), default (anchor to right), `.align-overhang` (escape the right edge into the gutter — best for narrow card grids)

`:has(.menu.is-popover.is-open)` on `.menu-host` automatically raises z-index so the popover never gets clipped by neighbouring tiles.

### Modal / dialog

```html
<div class="modal-scrim">
  <div class="modal">
    <div class="modal-head">
      <span class="ttl">Level Up — Magic-User 3 → 4</span>
      <button class="x">×</button>
    </div>
    <div class="modal-body">
      <p>Body text. Serif italic carries rule callouts.</p>
    </div>
    <div class="modal-foot">
      <button class="btn ghost">Cancel</button>
      <button class="btn primary">Confirm</button>
    </div>
  </div>
</div>
```

### Toast

```html
<div class="toast success">   <!-- or .danger, .warning, default = teal -->
  <div class="ic">✓</div>
  <div class="body">
    <div class="ttl">Save passed</div>
    <div class="msg">Eldra resisted the Charm Person.</div>
  </div>
  <button class="x">×</button>
</div>
```

Real placement: bottom-right of viewport, stack vertically, auto-dismiss after ~5s.

### Empty state

```html
<div class="empty">
  <svg class="icn">…</svg>
  <div class="ttl">No spells memorized</div>
  <div class="msg">Open your spellbook below to prepare for the day.</div>
  <button class="btn sm primary">Open Spellbook</button>
</div>
```

### Loading skeleton

```html
<div class="skel" style="height: 18px; width: 60%"></div>
```

### Dice

```html
<div class="die d4"><span class="face">3</span></div>
<div class="die d6"><span class="face">5</span></div>
<div class="die d8"><span class="face">7</span></div>
<div class="die d20"><span class="face">15</span></div>
<div class="die d20 crit"><span class="face">20</span></div>      <!-- sage glow -->
<div class="die d20 fumble"><span class="face">1</span></div>     <!-- crimson, faded -->
```

Add `.rolling` class to animate a tumble entrance.

---

## Patterns

### Roll / chat card

Avatar + character name + formula + dice values + total stamp + verdict. See `Design System.html → Roll / Chat Cards` and `foundry-chat.jsx` for live implementation. Key behaviors:

- Critical (nat 20) → green forest verdict + sage glow on die
- Fumble (nat 1) → crimson verdict + faded die
- Damage → "X damage" verdict in crimson, no save/hit binary

### Top bar

Permanently ink-black in both themes. Uses `--stamp-text` family for text, not theme-aware text tokens. Brand + breadcrumb + nav.

---

## Naming conventions

- **CSS variables**: `--kebab-case` (`--text-mute`, `--surface-2`).
- **Component classes**: BEM-ish but loose. `.modal`, `.modal-head`, `.modal-body`. Modifier classes are space-separated: `.btn.primary`, `.tag.crimson`.
- **State classes**: `.active`, `.on`, `.is-error`, `.disabled`.
- **No CSS modules / scoped styles**: tokens + global classes only. Easier to port.

---

## What to ignore

- Anything in `*.jsx` files. The markup *patterns* in `panels.jsx` are decent reference, but re-implement in your real component layer.
- `dice.jsx`, `foundry-app.jsx`, etc. — prototype glue.
- The `window.queueRoll({...})` global API — fine for prototyping, not for production.

## What to keep

- `styles.css` — tokens + base sheet layout classes.
- `design-system.css` — component class library.
- This file (`DESIGN_SYSTEM.md`) — the contract.
- `CLAUDE.md` — product brief + working preferences.
- The OSE rules helpers in `data.js` (`RULES.savesAtLevel`, `RULES.slots`, etc.) — extend this when you add Advanced Fantasy support; **do not** scatter rules logic across React components.
