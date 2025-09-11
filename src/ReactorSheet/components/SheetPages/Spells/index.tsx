import { useReactorSheetContext } from "../../context";
import PreparedSpells from "./PreparedSpells";
import Grimoire from "./Grimoire";

export default function Spells() {
  const { actor } = useReactorSheetContext();

  const availableSlots = [];
  for (const level in actor.system.spells.slots) {
    const slotInfo = actor.system.spells.slots[level];
    if (slotInfo.max <= 0) continue;
    availableSlots.push(
      `${slotInfo.used} of ${slotInfo.max} level ${level} spells memorized`
    );
  }

  return (
    <div>
      <div className="flex-row justify-end italic text-secondary pb-2 pt-2">
        <p>{availableSlots.join(" ")}</p>
      </div>
      <PreparedSpells deleteable />
      <Grimoire spellList={actor.system.spells.spellList} />
    </div>
  );
}
