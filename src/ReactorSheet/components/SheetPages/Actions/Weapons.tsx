import type { OseWeapon } from "@src/ReactorSheet/types/types";
import { SectionHeader } from "../../shared/elements";
import GridTable from "../../shared/GridTable";
import { useReactorSheetContext } from "../../context";
import { actionColumns } from "../../shared/constants";

export default function Weapons() {
  const { items, actor } = useReactorSheetContext();
  const weapons = items.filter(
    ({ type, system }: OseWeapon) => type == "weapon" && system.equipped
  );
  return (
    <div>
      <SectionHeader>Weapons</SectionHeader>
      <GridTable<OseWeapon>
        columns={actionColumns(actor)}
        data={weapons as OseWeapon[]}
        getRowId={(row) => row._id}
        showHeader={false}
      />
    </div>
  );
}
