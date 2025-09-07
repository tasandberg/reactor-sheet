import type { OseItem, OseSpellList } from "@src/ReactorSheet/types/types";
import GridTable from "../../shared/GridTable";
import { SectionHeader } from "../../shared/elements";
import { useSpellColumns } from "./useSpellColumns";

// Lists all user's known spells

// TODO Make reusable
export default function Grimoire({ spellList }: { spellList: OseSpellList }) {
  const columns = useSpellColumns({ showMemorize: true, deleteable: true });

  return (
    <>
      <SectionHeader>Known spells</SectionHeader>
      <div className="flex-row gap-3">
        {Object.entries(spellList).map(([level, spells]) => (
          <div key={`spells-${level}`}>
            <SectionHeader>Level {level}</SectionHeader>
            <GridTable<OseItem>
              columns={columns}
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
