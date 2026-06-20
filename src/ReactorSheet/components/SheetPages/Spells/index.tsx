import { useState } from "react";
import { useReactorSheetContext } from "../../context";
import { SectionTitle } from "../../ui/SectionTitle";
import { selectSpellLevels } from "../../../viewModels/spells";
import { cx } from "../../ui/cx";
import SpellLevel from "./SpellLevel";

/**
 * Spells tab: per-level panels (slot pips + prepared cast rows + expandable
 * spellbook). Rest re-memorises every spell (restores `cast` to `memorized`).
 */
export default function Spells() {
  const { actor } = useReactorSheetContext();
  const levels = selectSpellLevels(actor);
  const [resting, setResting] = useState(false);

  const rest = async () => {
    if (resting) return;
    setResting(true);
    try {
      const updates: Promise<unknown>[] = [];
      for (const { spellbook } of levels) {
        for (const spell of spellbook) {
          if (spell.system.cast !== spell.system.memorized) {
            updates.push(spell.update({ "system.cast": spell.system.memorized }));
          }
        }
      }
      await Promise.all(updates);
    } finally {
      setResting(false);
    }
  };

  return (
    <section className="rs-section rs-spells">
      <SectionTitle className="rs-spells-title">
        Spells
        <span className="hint">memorised slots</span>
        <button
          type="button"
          className="rs-rest"
          onClick={rest}
          disabled={resting}
          aria-busy={resting}
          title="Re-memorise all spells"
        >
          <i
            className={cx("fa-solid", resting ? "fa-spinner fa-spin" : "fa-campground")}
            aria-hidden="true"
          />{" "}
          Rest
        </button>
      </SectionTitle>
      {levels.map((vm) => (
        <SpellLevel key={vm.level} vm={vm} />
      ))}
    </section>
  );
}
