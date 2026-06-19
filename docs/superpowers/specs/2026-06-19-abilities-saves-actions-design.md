# Phase 2 — Abilities cards · Saves/Exploration restyle · Memorized Spells

Depends on Phase 1 landing (no code overlap, but sequence after). Scope: Abilities tab, the Saves & Exploration rail card visuals, and an additive Memorized-Spells section in the Actions tab. Desktop layout, header, themes untouched.

Handoff: README behaviors #7 (Memorized) and #8 (feature cards); `prototype/foundry-panels.jsx` (`FvttFeatures`, `FvttActions`), `foundry-styles.css` (`.fvtt-feat`, `.fvtt-save`, `.fvtt-skill`, `.fvtt-castlist`).

## A. Abilities tab → collapsible feature cards

OSE class/race features are real `ability` Items at `actor.system.abilities` (`Record<string, OseItem>`). They already carry `name`, `img`, `system.description` (HTML), `system.requirements`, and a native roll: `system.roll` (formula), `system.rollType` (`result|above|below` → `= / ≥ / ≤`), `system.rollTarget`. Passive features have empty `roll` → no roll affordance (matches the Magic-User test character).

Replace the current `GridTable` in `SheetPages/Abilities/index.tsx` with a list of collapsible cards:

- **Prereq**: extend the `OseAbility` TS type (`types/types.ts:158`) with `description`, `roll`, `rollType`, `rollTarget`, `save`, `blindroll`, and the item's roll method.
- **View model** (new, e.g. `viewModels/features.ts` — note existing `abilities.ts` is the 6 ability *scores*): per feature `{ id, name, img, description, requirements?, rollable: !!system.roll, rollTag?: "1d6 ≤ 2", onRoll? }`. Compose the tag symbol from `CONFIG.OSE.roll_type[rollType]`.
- **Card** (`FeatureCard.tsx`): native `<button class=ft-head aria-expanded>` (ink-stamp `img` or glyph fallback · title · optional roll-tag pill · chevron); collapsed by default; expanded `.ft-body` shows enriched HTML description + a "Roll {tag}" button when rollable.
- **Roll routing**: call the OSE ability item's own roll method (handles success/fail vs target, blind rolls, posts to Foundry chat) — do **not** reconstruct dice in React.
- **Description**: HTML — render via the existing Foundry-enrich path (check `Notes/EditableContent.tsx`).
- Keep the delete affordance; keep `<Languages />` below the cards.
- Styling from `.fvtt-feat*` (foundry-styles.css:1406–1448): `.ft-ic` 40px ink stamp, `.ft-roll-tag` brass mono pill, `.ft-body` indented under the title.

## B. Saves & Exploration card restyle (rail)

`components/actions/SavesExploration.tsx` renders in the left rail (`railExtra`, `tabbed`) and in the Actions body (`.actions-only`). **Restyle visuals only — do not move it or change the tab structure** (the rail tab-nav exists to save vertical space).

- Restyle the table rows → card visuals matching `.fvtt-save` (ink-stamp save key · mono `13+` target · tiny label) and `.fvtt-skill` (gold glyph · label · `N-in-6` pill on ink with gold-soft border), keeping the existing `.rs-se-nav` tab switch.
- Tokens: surfaces `--surface/--surface-2`, `--ink`, `--border-soft`, `--gold`/`--gold-soft`, `--mono`, IM Fell hints. Styles live in `actions.scss:309–336`.

## C. Memorized Spells quick-cast (Actions tab, additive)

New `components/actions/MemorizedSpells.tsx`, rendered in `ActionsView.tsx` after `AttacksTable`. Only renders when there are prepared-with-uncast spells.

- **Data**: reuse `PreparedSpells` logic — flatten `actor.system.spells.spellList` (`Record<number, OseSpell[]>`), filter `system.cast > 0`. Expose `{ id, name, lvl, range, damage?, cast }`.
- **Cast**: button → `spell.spendSpell({ skipDialog: false })` (OSE decrements `system.cast` and routes the roll/chat natively).
- **UX difference from prototype**: OSE has no separate "spent" set — casting decrements `cast`; when it hits 0 the spell leaves the list (no struck-through persistent row). Accept this; don't fake a spent array.
- Styling `.fvtt-castlist`/`.fvtt-spell` (foundry-styles.css:1232–1234, 1328–1342).

## Testing

- Unit: a focused test for the new feature view model (rollable detection + tag composition). Lean — no fixture bloat.
- Manual: passive features show no roll button; a feature with `roll`+`rollTarget` shows the tag + rolls to chat with success/fail; saves/exploration cards render in the rail with correct values; memorized spells list prepared spells, cast spends a slot and posts a roll, spell drops off at 0.

## Open question for Tim

Saves/Exploration: keep the existing rail **tab-nav** structure and only restyle rows→cards (recommended — rail real estate), or adopt the handoff's side-by-side card grid? Spec assumes the former.
