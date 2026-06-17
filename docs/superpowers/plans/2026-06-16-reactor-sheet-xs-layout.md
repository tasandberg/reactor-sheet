# Reactor Sheet — XS (mobile) layout

Branch: `reskin/actions-display` (presentational/foundational). Adds a mobile/XS
responsive state per the prototype phone mock: **bottom tab bar** nav, **compact
single-column header**, full-width content, and the top-bar action buttons
**collapsed into the `⋮` overflow menu**. Display-only (no new rolls).

## Current responsive system (for reference)
- Two container contexts: `app` on `.reactor-sheet-app` (drives nav), `sheet` on
  `.rs-sheet` scroll element (drives content single ⇄ two-pane).
- Nav today: right vertical rail `.rs-tabrail` by default; top horizontal tabs
  `.rs-htabs` at `@container app (min-width: 800px)`.
- Content: single column (inline grid-areas header) by default; two-pane
  (`.rs-twopane` left chrome sidebar + right content, header stacked) at
  `@container sheet (min-width: 630px)`.
- Header uses CSS `grid-template-areas` (`.rs-head`): medium = `portrait | ident
  (name + Init/HD/Move) | vitals (HP/AC)`; rail = stacked.
- Window `.reactor-sheet { min-width: 640px }` (current floor to stop the inline
  header clipping). `reactor-sheet.js` DEFAULT_OPTIONS position width 640.

## Responsive tiers (confirmed)
| Tier | `app` width | Nav | Content | Header |
|------|------------|-----|---------|--------|
| **XS** | ≤ 560px | bottom bar | single column | compact, Init/HD/Move full-width row |
| Rail/medium | 560–800px | right vertical rail | single ⇄ two-pane (sheet ≥ 630) | inline / stacked |
| Wide | ≥ 800px | top htabs | two-pane | stacked in rail |

(Below XS the sheet container is < 630 so two-pane never engages — no conflict.)

## Tasks

1. **Min-width** (`styles.scss`): lower `.reactor-sheet` min-width `640 → 360` so
   mobile widths are allowed. The XS compact header fits ~360px, so the clip that
   forced 640 is now handled by layout. Leave position default width 640.

2. **BottomBar component** (`components/shell/BottomBar.tsx`, new): mirrors
   `TabRail`/`TabBar` props (`tabs`, `active`, `onSelect`). Renders each tab as an
   **icon-above-label** button (`role="tab"`, `aria-controls="rs-tabpanel"`),
   active one accented. Add barrel export in `shell/index.ts` and a
   `BottomBar.stories.tsx`. Selectors qualified (`.rs-bottombar .rs-botbtn`) to
   beat the `.reactor-sheet-app button` reset (0,1,1).

3. **Shell** (`Shell.tsx`): render `<BottomBar …/>` (`.rs-bottombar`) as a third
   row of the app, after `.rs-body`. Pass the same `tabs/active/onSelect`.

4. **shell.scss XS rules** — `@container app (max-width: 560px)`:
   - `.rs-bottombar { display: flex }` (pinned bottom, `flex: 0 0 auto`, top
     border, `var(--bg-2)` bg); base rule `.rs-bottombar { display: none }`.
   - hide `.rs-tabrail` (and ensure htabs stays hidden).
   - bottom-bar item styling: icon glyph on top (gold-dim), small label below,
     active = accent text + `--gold` top indicator (mirror `.rs-tab.active`).
   - give `.rs-sheet` (or `.rs-pad`) bottom padding ≈ bottom-bar height so the
     last content rows aren't covered.

5. **Header XS reflow** (`actions.scss` + the XS container block): smaller
   portrait (~60px), smaller `.rs-name`, compact HP/AC; reflow grid areas to
   `"portrait ident vitals" / "subs subs subs"` so Init/HD/Move become a
   full-width 3-box row below (boxed, like the rail). Verify it fits ~360px with
   no overflow.

6. **Top-bar overflow collapse (XS)** (`Topbar.tsx`): at XS, hide the inline
   Rest / Level Up / Edit buttons and surface them under a `⋮` overflow button
   (a small popover/menu), keeping Lv/XP + the ◐ theme toggle inline. Simplest:
   a React overflow menu in the topbar shown only at XS (CSS toggles the inline
   buttons vs the `⋮`); avoids depending on Foundry header-control injection.

7. **Content bottom padding**: confirm the active tab body clears the fixed bottom
   bar at XS (task 4 padding); check the saves/exploration + attacks tables.

## Files
- New: `components/shell/BottomBar.tsx`, `components/shell/BottomBar.stories.tsx`.
- Edit: `components/shell/index.ts`, `components/shell/Shell.tsx`,
  `components/chrome/Topbar.tsx`, `styles/shell.scss`, `styles/actions.scss`,
  `styles/styles.scss`.

## Verification
- Gates: `tsc -b`, `eslint`, `vitest`, `ladle build`, `vite build` — all green;
  branch source-only (dist gitignored).
- Live (resize the Foundry window / detached popout):
  - ~390px → bottom bar shows, rail hidden, header compact, no clipping, top-bar
    actions under `⋮`.
  - ~700px → right rail + two-pane.
  - ≥800px → top htabs.

## Notes / open during impl
- Pick the exact bottom-bar height and the matching content padding together.
- Bottom-bar tabs = the 5 existing (Actions/Inventory/Spells/Abilities/Notes)
  with their unicode glyphs; Spells hidden when `system.spells.enabled` is false
  (already filtered in SheetShell).
- The `⋮` overflow could later fold in module-added header controls (issue #13).
