import type { OSEActor, OseSpell } from "../../types/types";
import { SectionTitle } from "../ui/SectionTitle";
import { SpellCastRow } from "../spells/SpellCastRow";

type Props = { actor: OSEActor };

/**
 * Quick-cast list of selected spells (shares <SpellCastRow> with the Spells tab).
 * Gated on `cast > 0 || memorized > 0` so it catches every selected spell incl.
 * fully-spent ones (memorized persists). Cast → `spendSpell`.
 */
export function MemorizedSpells({ actor }: Props) {
  // Same flatten + path as the Spells tab: spellList is Record<level, OseSpell[]>.
  const spells: OseSpell[] = Object.values(actor.system.spells?.spellList ?? {})
    .flat()
    .filter((s) => (s.system.cast ?? 0) > 0 || (s.system.memorized ?? 0) > 0)
    .sort((a, b) => a.system.lvl - b.system.lvl);

  if (spells.length === 0) return null;

  return (
    <section className="rs-section">
      <SectionTitle hint="click to cast">Memorized Spells</SectionTitle>
      <div className="fvtt-castlist">
        {spells.map((spell) => (
          <SpellCastRow
            key={spell._id as string}
            spell={spell}
            rowClass="fvtt-spell"
            meta={[`Lvl ${spell.system.lvl}`, spell.system.range]
              .filter(Boolean)
              .map((m) => <span key={m}>{m}</span>)}
            onCast={() => spell.spendSpell({ skipDialog: false })}
          />
        ))}
      </div>
    </section>
  );
}
