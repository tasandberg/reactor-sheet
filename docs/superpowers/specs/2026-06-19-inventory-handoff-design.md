# Phase 1 — Inventory: design-handoff alignment + drag fixes

Branch: `osc-sheet` descendant. Scope: the Inventory tab only (`components/inventory/`). Desktop two-pane layout, header, and themes are untouched.

Handoff reference: `docs/design-handoff/` (README behaviors #2–#5; `prototype/hifi-center.jsx`, `hifi-sheet.css`).

## Goals

Bring the live `InventoryViewDnd` to the handoff's "definitive" inventory: sticky equipped tray + sticky All-Items header, brass container affordances, teal = equipped everywhere. Plus two drag-behavior changes that **override** the handoff.

Non-goals: grid view redesign, coin section redesign, encumbrance bar (already matches), any rail/header/theme change.

## Tokens

No new tokens. `--accent-alt` (#c89e54) / `--accent-alt-dim` (#a88240) brass and `--teal` (#1f7575) already resolve in both themes (`styles/vellum/tokens.css`). Do **not** use `--gold` for brass — it aliases to teal for hirelings (`styles.scss`).

## Work items

### 1. Sticky equipped tray + JS-offset All-Items header

Scroll container is `.rs-sheet` (`overflow-y:auto`); all `position:sticky` descendants resolve against it.

- Add stable classes: `rs-inv-sec--equipped` on the equipped `<section>` (InventoryViewDnd.tsx:705), `rs-inv-sec--carried` on the carried `<section>` (:720).
- SCSS (`inventory.scss`):
  - `.rs-inv-sec--equipped { position: sticky; top: 0; z-index: 7; background: var(--bg); }`
  - `.rs-inv-sec--carried > .rs-inv-sec-head { position: sticky; top: 0; z-index: 6; background: var(--bg); }`
  - `background: var(--bg)` is required so scrolled rows don't bleed through.
- Add a `useLayoutEffect` that measures the equipped section's `offsetHeight` and writes it to the carried header's `style.top`. **Scope queries to a component `ref` on `.rs-inv`** (not `document.querySelector`) — multiple sheets can be open at once in Foundry. Re-run on resize and whenever `equipCollapsed`, `inventory.equipped.length`, or `inventory.count` change.
- When no equipped section renders (`inventory.equipped.length === 0`), set carried header `top = 0` (guard `eq ? eq.offsetHeight : 0`).

### 2. Brass container affordances

Recolor container nesting from teal to brass; keep before/after insertion line teal.

- **Count pill** `.rs-inv-count` (inventory.scss:205): brass pill — `color: var(--on-accent); background: var(--accent-alt-dim); border-radius: 999px; padding: 1px 7px; min-width: 16px; text-align: center;`. Drop the literal parens around `{count}` (InventoryViewDnd.tsx:325) for the pill.
- **Drop-into highlight** `.rs-inv-container.is-drop-target` (:297): brass ring — `box-shadow: inset 0 0 0 2px var(--accent-alt); background: color-mix(in oklab, var(--accent-alt) 9%, transparent);`. Remove/recolor the inner teal fill.
- **Nested rows**: add a brass left-rail + brass-tinted icon border on nested rows (mirror handoff `.il-row.il-nested`): `::before` `border-left: 2px solid color-mix(in oklab, var(--accent-alt-dim) 55%, transparent)`; nested `.rs-inv-img` `border: 1px solid color-mix(in oklab, var(--accent-alt-dim) 60%, transparent)`. Keep existing `--rs-inv-depth` indent.
- **Before/after line** `.drop-before/.drop-after` (:119): unchanged (teal).

### 3. Teal = equipped everywhere

- `.rs-inv-equip.is-on` (inventory.scss:181): `--gold` → `var(--teal)` (hover `var(--teal-dim)`). Currently renders brass for PCs — a mismatch.
- `.rs-equip-hand` (:447) and `.rs-equip-imgbtn:hover` (:440) in the equipped image-strip: `--gold` → `var(--teal)` for consistency.
- Grid-card equip `.rs-inv-cardeq.on` (:363) already teal — no change.

### 4. (Override) Expanded container = normal list row

Today `ContainerRow` always passes `{ container: true }`, so its header is always a nest target. Change so only **collapsed** containers accept drop-into; expanded ones drag/drop as normal ROOT rows.

- InventoryViewDnd.tsx:319 — `{ container: collapsed, containerZone: item.id, ownZone: ROOT }`.
- :302 — `const isDropTarget = collapsed && dnd.isInto(ROOT, index);`.
- Expanded containers are filled by dropping among their visible child rows (existing `SortableRow` in group `gkey(id)`) — already works. The empty-expanded nest body (`dnd.nestProps`, :336) stays.

### 5. (Override) Remove "Move out of container" box; un-nest by drag-to-root

`RootZone` is currently the only un-nest path because `useDragReorder` rejects cross-group reorders.

- **Hook (`useDragReorder.ts`)**: add `RowOpts.acceptCrossGroup?: boolean`. In `onDragOver`/`onDrop` (lines ~65–91), when `!into && drag.group !== group` but the target row has `acceptCrossGroup`, permit the hover (show before/after line) and on drop route through `onNest({ fromGroup, from, targetIdx: to, zone: null })` instead of rejecting. Do **not** apply the `drag.idx < to` self-shift (item leaves a different group).
- Set `acceptCrossGroup: true` on root `SortableRow`s and the container header (root targets). Scope tightly to **root targets only** for this pass (un-nest); root→container nesting still works via the collapsed-container drop-into ring from item 4.
- **`onNest` (InventoryViewDnd.tsx:642)**: honor `targetIdx` when `zone == null` — `dest.splice(targetIdx, 0, moved)` instead of always appending, so the un-nested item lands at the drop position.
- **Delete**: `RootZone` component (:256–267) + its render site (:749), now-unused `ROOT_ZONE_IDX`/`dragActive`, and `.rs-inv-rootzone` SCSS (:313–328). Keep `nestProps` (still used by empty-container body).

Edge cases: self-drop and same-container reorder unchanged (same-group path). Fully-empty root (only the column header + containers) has no row to drop among — minor, acceptable.

## Testing

- Unit: extend `viewModels/inventory.test.ts` only if VM logic changes (the drag changes are hook/UI; likely add a focused test for the un-nest `targetIdx` splice in `onNest` if extracted to a pure helper). Keep tests lean — assert real behavior, not fixtures.
- Manual (Foundry, via `verify`/`run`): sticky tray+header while scrolling a long list; drag-to-reorder (teal line); drag onto a *collapsed* container nests (brass ring); expanded container reorders normally (no ring); drag nested row to root un-nests at drop position; equip toggles teal.

## Risks

- Sticky `top` measurement vs `.rs-pad` padding: sticky pins at the padded top edge, not raw scroller top — visually fine, note if a gap appears.
- Cross-group un-nest interacting with the column header row / empty root — verify the always-rendered `SortHeaderRow` isn't a drop target.
