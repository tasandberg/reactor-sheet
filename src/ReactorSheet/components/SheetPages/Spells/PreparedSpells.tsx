import type { OseSpell } from "@src/ReactorSheet/types/types";
import { useReactorSheetContext } from "../../context";
import { SectionHeader } from "../../shared/elements";
import GridTable from "../../shared/GridTable";
import spellColumns from "./spell-columns";

export default function PreparedSpells() {
  const { actor } = useReactorSheetContext();
  const preparedSpells: OseSpell[] = Object.values(
    actor.system.spells.spellList
  )
    .flat()
    .filter((spell) => spell.system.memorized > 0);

  return (
    <div>
      <SectionHeader className="m-0">Prepared Spells</SectionHeader>
      <div className="p-3 pb-4">
        {preparedSpells.length === 0 && <div>No prepared spells</div>}
        <GridTable<OseSpell>
          columns={spellColumns(null, true)}
          getRowId={(item) => item._id as string}
          data={preparedSpells}
          showHeader={false}
        />
      </div>
    </div>
  );
}
