import { useReactorSheetContext } from "../../context";
import { SectionTitle } from "../../ui/SectionTitle";
import { selectSpellLevels } from "../../../viewModels/spells";
import SpellLevel from "./SpellLevel";

/**
 * Spells tab: per-level panels (slot pips + prepared cast rows + expandable
 * spellbook). Rest re-memorises every spell (restores `cast` to `memorized`).
 */
export default function Spells() {
  const { actor } = useReactorSheetContext();
  const levels = selectSpellLevels(actor);

  const rest = () => {
    for (const { spellbook } of levels) {
      for (const spell of spellbook) {
        if (spell.system.cast !== spell.system.memorized) {
          void spell.update({ "system.cast": spell.system.memorized });
        }
      }
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
          title="Re-memorise all spells"
        >
          <i className="fa-solid fa-campground" aria-hidden="true" /> Rest
        </button>
      </SectionTitle>
      {levels.map((vm) => (
        <SpellLevel key={vm.level} vm={vm} />
      ))}
    </section>
  );
}
