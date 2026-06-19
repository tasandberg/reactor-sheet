import type { OSEActor, OseSpell } from "../../types/types";
import { SectionTitle } from "../ui/SectionTitle";
import { cx } from "../ui/cx";

type Props = { actor: OSEActor };

/**
 * Quick-cast list of MEMORIZED (prepared) spells. The list is stable — gated on
 * `memorized > 0` (not `cast`), so it doesn't vanish once slots are spent or
 * before a Rest. The cast button reflects remaining casts (`cast`): disabled and
 * marked "spent" at 0. Cast → `spell.spendSpell` (OSE decrements `cast` + routes
 * the roll); Rest refills `cast` to `memorized`.
 */
export function MemorizedSpells({ actor }: Props) {
  // Same flatten as PreparedSpells: spellList is Record<level, OseSpell[]>.
  const spells: OseSpell[] = Object.values(actor.system.spells?.spellList ?? {})
    .flat()
    .filter((s) => s.system.memorized > 0)
    .sort((a, b) => a.system.lvl - b.system.lvl);

  if (spells.length === 0) return null;

  const cast = (spell: OseSpell) => void spell.spendSpell({ skipDialog: false });

  return (
    <section className="rs-section">
      <SectionTitle hint="click to cast">Memorized Spells</SectionTitle>
      <div className="fvtt-castlist">
        {spells.map((spell) => {
          const left = spell.system.cast;
          const spent = left <= 0;
          const meta = [
            `Lvl ${spell.system.lvl}`,
            spell.system.range,
            `${left}/${spell.system.memorized} ready`,
          ].filter(Boolean);
          return (
            <div className={cx("fvtt-spell", spent && "spent")} key={spell._id as string}>
              <span className="chk" aria-hidden="true">✓</span>
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
                disabled={spent}
                onClick={() => cast(spell)}
                title={spent ? `${spell.name} — no casts left (Rest to recover)` : `Cast ${spell.name}`}
              >
                {spent ? "spent" : "cast"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
