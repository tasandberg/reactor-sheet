import type { OSEActor, OseSpell } from "../../types/types";
import { SectionTitle } from "../ui/SectionTitle";
import { cx } from "../ui/cx";

type Props = { actor: OSEActor };

/**
 * Quick-cast list of selected spells. Per OSE: `memorized` = slots SELECTED for a
 * spell (persists across rests), `cast` = casts REMAINING now (decrements on cast,
 * refilled to `memorized` on rest). A spell with `cast === 0` but `memorized > 0`
 * is SPENT but still selected — shown struck-through and disabled, not removed.
 * `total` (the dot count) is max(memorized, cast) so it still works when only
 * `cast` is set (e.g. spells prepared via the cast field). Cast → `spendSpell`.
 */
export function MemorizedSpells({ actor }: Props) {
  // Same flatten + path as the Spells tab: spellList is Record<level, OseSpell[]>.
  const spells: OseSpell[] = Object.values(actor.system.spells?.spellList ?? {})
    .flat()
    .filter((s) => (s.system.cast ?? 0) > 0 || (s.system.memorized ?? 0) > 0)
    .sort((a, b) => a.system.lvl - b.system.lvl);

  if (spells.length === 0) return null;

  const cast = (spell: OseSpell) => void spell.spendSpell({ skipDialog: false });

  return (
    <section className="rs-section">
      <SectionTitle hint="click to cast">Memorized Spells</SectionTitle>
      <div className="fvtt-castlist">
        {spells.map((spell) => {
          const left = spell.system.cast ?? 0;
          const total = Math.max(spell.system.memorized ?? 0, left);
          const spent = left <= 0;
          const meta = [`Lvl ${spell.system.lvl}`, spell.system.range].filter(Boolean);
          return (
            <div className={cx("fvtt-spell", spent && "spent")} key={spell._id as string}>
              {/* one dot per selected slot; filled = casts remaining, empty = spent */}
              <span className="sp-dots" role="img" aria-label={`${left} of ${total} casts remaining`}>
                {Array.from({ length: total }).map((_, i) => (
                  <span key={i} className={cx("sp-dot", i < left && "filled")} aria-hidden="true" />
                ))}
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
                className="sp-cast"
                disabled={spent}
                onClick={() => cast(spell)}
                title={spent ? `${spell.name} — spent (Rest to recover)` : `Cast ${spell.name}`}
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
