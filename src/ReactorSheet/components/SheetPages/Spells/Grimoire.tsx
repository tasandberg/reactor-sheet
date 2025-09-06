import type { OseItem, OseSpellList } from "@src/ReactorSheet/types/types";
import GridTable from "../../shared/GridTable";
import { SectionHeader } from "../../shared/elements";
import { useReactorSheetContext } from "../../context";
import spellColumns from "./spell-columns";

// Lists all user's known spells

// TODO Make reusable
export default function Grimoire({ spellList }: { spellList: OseSpellList }) {
  const { actor } = useReactorSheetContext();

  return (
    <>
      <SectionHeader>Known spells</SectionHeader>
      <div className="flex-row gap-3">
        {Object.entries(spellList).map(([level, spells]) => (
          <div key={`spells-${level}`}>
            <SectionHeader>Level {level}</SectionHeader>
            <GridTable<OseItem>
              columns={spellColumns({ spellSlots: actor.system.spells.slots })}
              showHeader={false}
              getRowId={(item) => item._id as string}
              data={spells}
            />
          </div>
        ))}
      </div>
    </>
  );
}
