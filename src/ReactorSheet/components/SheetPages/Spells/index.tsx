import { useReactorSheetContext } from "../../context";
import PreparedSpells from "./PreparedSpells";
import Grimoire from "./Grimoire";

export default function Spells() {
  const { actor } = useReactorSheetContext();

  return (
    <div>
      <PreparedSpells />
      <Grimoire spellList={actor.system.spells.spellList} />
    </div>
  );
}
