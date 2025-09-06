import type { OseSpell } from "@src/ReactorSheet/types/types";
import { useReactorSheetContext } from "../../context";
import { SectionHeader } from "../../shared/elements";
import GridTable from "../../shared/GridTable";
import { useSpellColumns } from "./useSpellColumns";

export default function PreparedSpells() {
  const { actor } = useReactorSheetContext();
  const columns = useSpellColumns({ detail: true });
  const preparedSpells: OseSpell[] = Object.values(
    actor.system.spells.spellList
  ).reduce(
    (all, spells) =>
      all.concat(spells).filter((spell) => spell.system.cast > 0),
    []
  );

  return preparedSpells.length > 0 ? (
    <div>
      <SectionHeader className="m-0">Prepared Spells</SectionHeader>
      <div className="p-3 pb-4">
        {preparedSpells.length === 0 && <div>No prepared spells</div>}
        <GridTable<OseSpell>
          columns={columns}
          getRowId={(item) => item._id as string}
          data={preparedSpells}
          showHeader={false}
        />
      </div>
    </div>
  ) : null;
}
