# reactor-sheet → Vellum reskin — roadmap spec

**Date:** 2026-06-14
**Status:** Approved design; roadmap altitude
**Branch model:** This is the feature branch many sub-branches merge into. Each chunk below is an independently-mergeable unit and gets its own spec → plan → implementation cycle hanging off this roadmap.

## Goal

Replace reactor-sheet's presentation with the **Vellum** design system (handoff in `docs/design_handoff_foundry_sheet/`), keeping the data layer intact. reactor-sheet remains a **presentation + interaction layer** over the `ose-foundry-core` system.

## Non-goals / scope guardrails (YAGNI)

- **No rules port.** OSE rules (saves/slots/XP/AC/movement derivation — the handoff's `data.js` "rules brain") stay in `ose-foundry-core`. reactor-sheet reads derived values; anything missing is added *upstream*, not duplicated here.
- **No Handlebars.** The handoff is written generically ("recreate as Handlebars + DataModel") because it targets any stack. reactor-sheet is React-in-Foundry via `foundry-vtt-react`; presentation stays React.
- **Window-resize responsive layout IS in scope** (container-query reflow). Only **mobile/touch tuning** is deferred (per handoff).
- **styled-components stays available** as a transitional bridge but is no longer the target. New work uses the design system; old styled-components/SCSS is retired per area as it's migrated.

## Key architectural facts (verified)

- The React tree mounts into Foundry's **light DOM** under a `.reactor-sheet` class on the ApplicationV2 window element. No shadow DOM.
- Foundry v14 wraps its core CSS in cascade layers (`reset, variables, elements, blocks, applications, layouts, system, modules, exceptions`). **Unlayered CSS beats every layer** — so keeping the design system unlayered makes it win over Foundry's base without `!important`.
- Foundry styles bare `button`/`input`/`select`/`a` heavily → a scoped element reset is required regardless of styling approach (this is why styled-components would *not* have solved isolation).
- CSS ships via `module.json` `styles` (built `dist/main.css`); not runtime-injected.

## Reuse & tooling (decided)

The design system is the spiritual sibling of the Old School Chronicle web app and **may be reused on the website**. This sets two constraints:

- **Keep the `ui/` primitive library Foundry-agnostic** — props in → classNames out, zero Foundry imports. Sheet-specific concerns (FilePicker portrait, roll→chat wiring, the ApplicationV2 shell) stay in a separate Foundry-bound layer. This makes a future lift-out into a shared package (`@osc/vellum-ui` or similar) a move, not a rewrite. **Do not** build the separate package/monorepo now (YAGNI) — just hold the boundary. This is a further reason to consume the portable CSS rather than rebuild it in styled-components (CSS travels to the website for free).
- **Workbench: Ladle**, set up as the first task of P2 (Vite-native, fast local loop). Components consume view-models, so they render in Ladle against the Raistlin fixture with no Foundry — enabling isolated dev of both themes, the container-query reflow at every width, and edge states. The *canonical* cross-team design-system docs likely live with the extracted package later; the in-repo Ladle is reactor-sheet's local dev tool.

## Styling strategy (decided)

Consume the CSS contract; do **not** re-implement it as styled-components.

- Ship Vellum **tokens** (CSS custom properties) + **`design-system.css`** (global class library) as stylesheets.
- Build a small `components/ui/` layer of **typed presentational React wrappers** mapping props → design-system classNames (`<Button variant="primary">`, `<Stamp size="sm">`, etc.). Clean typed API; CSS stays canonical and portable.
- **Why not styled-components:** (1) doesn't solve the element reset; (2) the CSS *is* the contract — the design system is the spiritual sibling of the web app and evolves in lockstep, so a design update should be a file copy, not a manual re-port; (3) avoids hand-transcribing a large, settled, high-fidelity library; (4) lets us collapse to one styling system.

## Theme handling (dark + cream)

- **All tokens defined on the `.reactor-sheet` root, not `:root`** — so they don't leak into Foundry (which has its own light/dark) and so each open sheet window themes independently.
- Default = dark. Cream = `.reactor-sheet[data-theme="cream"]` overriding only the shifting values; token *names* never change.
- Theme-independent constants (`--ink`, `--stamp-text`, `--on-accent` logic) stay constant.
- Toggle driven by a client setting + per-sheet toggle, setting the attribute on the window root — never on `<html>`.

## Responsive layout (container queries)

Layout reflows to **window width**, not viewport, via `container-type: inline-size` on the sheet root:

- **Wide:** persistent left sidebar (portrait, identity, HP/AC vitals, init/hd/move, saving throws, exploration) + right column with a horizontal tab strip over tab content.
- **Narrow:** portrait/identity/vitals/sub-stats collapse into a full-width header band; body stacks vertically; the tab strip becomes a **vertical rail pinned to the right edge** with rotated labels + count badges.

Breakpoints live in the design system CSS, not bolted on per component.

---

## Phases & chunks

Each chunk lists: scope · depends-on · the contract it exposes/consumes.

### P0 — Foundation: style isolation + container queries
**Scope:** Token scoping under `.reactor-sheet`; scoped element reset for `button`/`input`/`select`/`a`; keep design-system CSS unlayered (beats Foundry layers); PostCSS step prefixing design-system selectors with `.reactor-sheet` for module isolation; bundle the 4 fonts (IM Fell English SC, IM Fell English, Inter, JetBrains Mono); `data-theme` dark/cream wiring; `container-type: inline-size` on the sheet root.
**Depends on:** —
**Contract:** A clean, isolated, themeable, container-query-capable style context. *Blocks everything.*

### P1 — Data/view-model seam
**Scope:** Typed view-model per sheet area mapping the OSE actor → exactly what the new UI renders. Display-only derivations live here; canonical rules stay in `ose-foundry-core` (add upstream if missing). Harden the boundary so presentation can be gutted against a stable contract.
**Depends on:** — (parallel with P0)
**Contract:** Typed view-models consumed by every presentation chunk. *Blocks all of P3+.*

### P2 — Design system import + typed UI library
**Scope:** Set up **Ladle** (first task). Import tokens + `design-system.css`; build `components/ui/` typed wrappers: Button, Stamp, Table, Tabs, Die, form controls (input/select/textarea/stepper/toggle/check/radio/segmented), Card, Tag, Modal, Toast, ProgressBar, Menu/popover, Empty, Skeleton. Each gets a Ladle story. **`ui/` stays Foundry-agnostic** (see Reuse & tooling).
**Depends on:** P0
**Contract:** The component vocabulary every later chunk builds with. *Blocks P3+.*

### P3 — App shell + responsive layout scaffold
**Scope:** The two-column ⇄ stacked container-query grid; right-edge vertical tab rail; tab routing; empty placeholder regions for chrome + tab body.
**Depends on:** P2
**Contract:** The skeleton every chrome/tab chunk mounts into.

### P4 — Persistent chrome (4 parallel chunks)
- **4a Topbar** — Lv / XP progress bar / Lv+1, Rest, Level Up, Edit toggle, theme toggle.
- **4b Header / identity** — portrait + FilePicker (native actor `img`), name · class · alignment; edit-mode swaps to fields; **class and level locked** (level changes only via Level Up).
- **4c Vitals** — HP (crimson) big value + Maximum sub + −/+ steppers (edit mode exposes max); AC (teal) value + click to toggle AAC⇄DAC + hover breakdown popover; AC is **derived, read-only**.
- **4d Sub-stats + rails** — Init (`+DEX mod`, 1d6+mod), HD (`<lvl>d4`), Move (read-only); Saving Throws rail (D/W/P/B/S); Exploration 1-in-6 skills.

**Depends on:** P3 (4c also consumes P5 for rolls)

### P5 — Roll pipeline → Foundry chat
**Scope:** Reimplement the prototype's `queueRoll` contract as Foundry `Roll` + `ChatMessage` + a chat-card template. Respect roll-under (ability/skill), roll-over (save), AAC-hit (attack); crit (nat 20) / fumble (nat 1); damage verdict. Kinds: attack, damage, ability, save, skill, spell, hd, init, rest, levelup, info. Optional brief toast as a nicety; Foundry chat is canonical.
**Depends on:** P3
**Contract:** A roll API consumed by 4c, 6a, 6c. *Build right after P3.*

### P6 — Tabs (chunks, parallelizable once P3 + P5 land)
- **6a Actions** — ability plaques; attacks (melee/missile w/ ammo decrement, block at 0); damage rolls; the 5 saves; exploration rolls; wealth/coin row; movement readout (Encounter/Explore/Travel + encumbrance band).
- **6b Inventory** (badge = item count) — items with weight; live total weight → encumbrance bar → movement band; recompute on any item change.
- **6c Spells** (badge = prepared count) — spellbook by level; prepare into slots (cap = `slots(lvl)[i]`); cast = move to spent; damage spells roll dice; Rest clears spent + heals.
- **6d Abilities** — class/level features readout.
- **6e Notes** — freeform bio/notes text.

**Depends on:** P3, P5

### P7 — Cross-cutting flows + cleanup
**Scope:** Edit-mode toggle wiring (swaps mechanical fields — abilities, name/title/alignment, max HP — to editable; derived stays read-only, updates live); Level-Up flow (guard `xp ≥ nextXp(lvl)`; roll HP gain; bump level; saves/slots/attack-bonus re-derive); Rest flow (clear spent, heal); theme persistence (client setting); retire leftover SCSS/styled-components per migrated area.
**Depends on:** the rest.

---

## Merge order

```
P0 ─┐
    ├─► P2 ─► P3 ─► P5 ─► (4a 4b 4c 4d + 6a 6b 6c 6d 6e parallel) ─► P7
P1 ─┘
```

## Verification (per handoff)

Smoke-test against the demo character **Raistlin Majere** (L3 Magic-User, OSE Classic — full stats in handoff README):

- Every derived number matches the prototype (AC 12 AAC/7 DAC, saves `{13,14,13,16,15}`, slots `[2,1]`, move 120′, XP 6420/10000, etc.).
- One roll of each kind fires to Foundry chat with correct verdict logic.
- Both themes render; no pure white anywhere.
- Layout reflows wide ⇄ narrow at the container-query breakpoints.

## References

- `docs/design_handoff_foundry_sheet/README.md` — product brief, screens, interactions, build order.
- `docs/design_handoff_foundry_sheet/reference/DESIGN_SYSTEM.md` — the design system contract.
- `docs/design_handoff_foundry_sheet/prototype/{styles.css,design-system.css}` — tokens + component class library (the consumable CSS).
- `docs/design_handoff_foundry_sheet/prototype/data.js` — OSE rules tables + Raistlin Majere (reference for `ose-foundry-core`, not ported here).
