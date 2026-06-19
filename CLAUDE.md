# reactor-sheet — repo guide

React OSE character sheet for Foundry v13/v14. Consumes `foundry-vtt-react`; renders the
`ose` system's data model. Manifest is `module.json`. Workspace-level cross-project context
lives in `../CLAUDE.md`.

## Dev

- pnpm. `pnpm dev` (vite, serves into local Foundry), `pnpm build` (`tsc -b && vite build`),
  `pnpm lint`, `pnpm test` (vitest). Verify changes with all four before committing.
- App entry: `src/ReactorSheet/index.tsx` → `ReactorSheetProvider` (Foundry actor sync) →
  `SheetShell` (view-models + chrome slots) → tab bodies. State = React Context + Foundry
  actor as source of truth; view-models in `viewModels/` compute derived data.
- Tokens/spacing: use the `--space-*`/`--spacer-*` (4px) scale and design tokens, never
  hardcoded px or invented colors. Brass = `--accent-alt`; equipped = `--teal`.

## Refactor / cleanup backlog

**Keep this list current as we build.** When a file grows unwieldy or a responsibility
wants its own module, add it here (don't silently let files balloon). Prune entries when done.

- **`components/inventory/InventoryViewDnd.tsx` (~770 lines)** — too big. Holds the root
  component AND a dozen sub-components (EquippedTray, ItemContextMenu, ContainerRow,
  SortableRow, SortHeader(Row), CoinRow, EncumbranceBar, NameCell, RowEquip…). Split sub-
  components into their own files (e.g. `inventory/EquippedTray.tsx`, `ItemContextMenu.tsx`,
  `rows/`), and lift the groups↔VM helpers (`buildGroups`, `persist`, etc.) into a module.
- **`components/inventory/InventoryView.tsx` (~600 lines)** — legacy `@dnd-kit` implementation,
  superseded by `InventoryViewDnd`. Confirm unused, then delete (and drop the `@dnd-kit` dep).
- **`SheetShell.tsx`** — accumulating item-mutation handlers (equip/nest/consume/reorder/
  equippedOrder + toasts). Extract into a `useInventoryActions(actor, items)` hook.
- **`components/SheetPages/Actions/` (capital-A)** — legacy Actions tab, replaced by the
  lowercase `components/actions/` reskin. Confirm dead, then remove.
- **`styles/inventory.scss` (~450 lines)** — split alongside the component breakup
  (equipped tray, rows, container, sticky head as separate partials).
