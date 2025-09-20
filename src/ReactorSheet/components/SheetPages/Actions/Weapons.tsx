import type { OseWeapon } from "@src/ReactorSheet/types/types";
import { useReactorSheetContext } from "../../context";
import { actionColumns } from "../../shared/constants";
import ActionTable from "./ActionTable";

export default function Weapons() {
  const { actor } = useReactorSheetContext();
  const weapons = actor.system.weapons.filter(
    ({ system }: OseWeapon) => system.equipped
  );
  return (
    <ActionTable<OseWeapon>
      data={weapons}
      title="WEAPONS"
      columns={actionColumns(actor)}
      getRowId={(row) => row._id}
    />
  );
}
