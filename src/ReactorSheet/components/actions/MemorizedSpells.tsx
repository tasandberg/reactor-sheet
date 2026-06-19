import type { OSEActor, OseSpell } from "../../types/types";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { actor: OSEActor };

/**
 * Quick-cast list of prepared spells with uncast slots (additive to the Actions
 * tab). Cast → `spell.spendSpell` (OSE decrements `cast` + routes the roll). When
 * a spell's `cast` hits 0 it leaves the list — there's no persistent "spent" row.
 */
export function MemorizedSpells({ actor }: Props) {
  // Same flatten as PreparedSpells: spellList is Record<level, OseSpell[]>.
  const spells: OseSpell[] = Object.values(actor.system.spells?.spellList ?? {})
    .flat()
    .filter((s) => s.system.cast > 0)
    .sort((a, b) => a.system.lvl - b.system.lvl);

  if (spells.length === 0) return null;

  const cast = (spell: OseSpell) => void spell.spendSpell({ skipDialog: false });

  return (
    <section className="rs-section">
      <SectionTitle hint="click to cast">Memorized Spells</SectionTitle>
      <div className="fvtt-castlist">
        {spells.map((spell) => {
          const meta = [`Lvl ${spell.system.lvl}`, spell.system.range].filter(Boolean);
          return (
            <div className="fvtt-spell" key={spell._id as string}>
              <span className="chk" aria-hidden="true">
                ✓
              </span>
              <div className="spinfo">
                <span className="spn">{spell.name}</span>
                <span className="spm">
                  {meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </span>
              </div>
              <button
                type="button"
                className="rs-link sp-cast"
                onClick={() => cast(spell)}
                title={`Cast ${spell.name}`}
              >
                cast{spell.system.cast > 1 ? ` ×${spell.system.cast}` : ""}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
