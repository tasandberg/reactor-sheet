# Phase 3 — Collapsing header → minibar (xs/medium only)

Handoff behavior #1, scoped to the single-column layouts. The **lg two-pane left-rail layout is unaffected** (header is sticky in `.rs-left`, never scrolls out — no minibar).

## The dividing line

One boundary governs everything: the `sheet` container query at **630px** (`shell.scss:176-192`), where `.rs-twopane` becomes a grid and `.rs-left` becomes `position: sticky`.

- **< 630px** (xs ≤560 + the medium band 561–629): `.rs-left` stacks above `.rs-right` inside the `.rs-sheet` scroller and scrolls away → **minibar active**.
- **≥ 630px**: `.rs-left` sticky, header always visible → **minibar disabled**.

Scroll container is `.rs-sheet` at all widths (`overflow-y:auto`, and it *is* the `sheet` container, so its `clientWidth` equals the container-query width).

## Behavior

- A scroll listener on `.rs-sheet` collapses the full header into a pinned minibar the moment the name scrolls out: `collapsed = scrollTop > max(8, name.offsetTop + name.offsetHeight − 8)`. Reverses on scroll up. Short transition (opacity + translateY/max-height), no layout jank.
- `name` = `.rs-name` in `HeaderBand` (`HeaderBand.tsx:46`). `offsetTop` resolves against `.rs-sheet`'s padding box in single-column mode (no positioned ancestor below 630), which is what we compare to `scrollTop`. Recompute the threshold on resize (name font-size changes across the 470/560/630 breakpoints).
- A `ResizeObserver` on `.rs-sheet` sets `narrow = clientWidth < 630`. The minibar renders only when `narrow && collapsed`. (JS can't read container-query state, so we observe width directly on the same 630 constant.)

## Minibar content

Compact bar: small portrait · name · `classLabel level` · compact HP number input · AC chip.

- Portrait/name/class/level ← `selectIdentity(actor)` (`img`, `name`, `classLabel`, `level`).
- HP input ← `selectVitals(actor).hp` + the existing clamped `onSetHp` from `SheetShell.tsx:25-28` (reuse, don't reimplement clamp). Same controlled pattern as `HeaderBand`'s HP input (`HeaderBand.tsx:78-98`): `key`-reset, commit on blur/Enter, native spinners hidden, value in crimson.
- AC chip ← `selectVitals(actor).ac.ascending` — **read-only display** (no AC popover; that stays out of scope).

## Components & wiring

- New `components/chrome/Minibar.tsx`: `<Minibar identity vitals onSetHp />`. On mount, find the scroller via `ref.closest(".rs-sheet")` (per-sheet — never `document.querySelector`, multiple sheets open at once), attach the scroll listener + ResizeObserver, query `.rs-name` within that scroller for the threshold.
- `Shell.tsx`: add a `minibar?: ReactNode` slot, mounted as the **first child of `.rs-sheet`** (before `.rs-pad`) as a sticky element (`position: sticky; top:0; z-index`). This keeps it inside the `sheet` container so the CSS gate matches the layout breakpoint exactly.
- `SheetShell.tsx`: pass `minibar={<Minibar identity={selectIdentity(actor)} vitals={vitals} onSetHp={onSetHp} />}` (all already in scope).
- Styles (new `styles/minibar.scss` or a block in `shell.scss`): the bar visuals + the gate `@container sheet (min-width: 630px) { .rs-minibar { display: none } }`. The CSS gate (630-sheet) and the JS gate (`clientWidth < 630`) MUST use the same constant.

## Out of scope

LG/two-pane header, AC popover, the topbar, mobile bottom bar. No change to `.rs-left`/`HeaderBand` beyond (possibly) exposing the `.rs-name` ref if querySelector proves insufficient.

## Testing

- Manual at three widths: **xs (~520px)** — scroll, minibar pins with portrait/name/HP/AC; HP input edits commit; scroll up restores full header. **medium (~600px)** — same. **lg (≥630px)** — scroll, **no minibar** ever appears; header stays in the sticky rail.
- Multiple sheets open simultaneously — each minibar tracks its own scroll (no cross-talk).
- Unit: minibar logic is DOM/scroll-bound; if the threshold calc is extracted to a pure helper, one focused test. Otherwise none — keep lean.

## Risks

- CSS gate vs JS gate drifting off 630 → a band where one thinks single-column, the other two-pane. Single shared constant.
- `offsetTop` measured at the wrong moment (before fonts/layout settle) → recompute on resize and on first scroll.
