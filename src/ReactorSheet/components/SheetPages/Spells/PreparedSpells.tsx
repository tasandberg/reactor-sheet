import type { OseSpell } from "@src/ReactorSheet/types/types";
import { useReactorSheetContext } from "../../context";
import { SectionHeader } from "../../shared/elements";
import GridTable from "../../shared/GridTable";
import { useSpellColumns } from "./useSpellColumns";

export default function PreparedSpells() {
  const { actor } = useReactorSheetContext();
  const columns = useSpellColumns({ detail: true });
  console.log(actor.system.spells.slots);
  const preparedSpells: OseSpell[] = Object.values(
    actor.system.spells.spellList
  ).reduce(
    (all, spells) =>
      all.concat(spells).filter((spell) => spell.system.cast > 0),
    []
  );

  return preparedSpells.length > 0 ? (
    <div>
      <SectionHeader>Prepared Spells</SectionHeader>
      <div>
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
