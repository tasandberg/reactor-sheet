import type { OseWeapon } from "@src/ReactorSheet/types/types";
import { useReactorSheetContext } from "../../context";
import ActionTable from "./ActionTable";
import { weaponActionColumns } from "./weaponColumns";

export default function Weapons() {
  const { actor } = useReactorSheetContext();
  const weapons = actor.system.weapons.filter(
    ({ system }: OseWeapon) => system.equipped
  );
  return (
    <ActionTable<OseWeapon>
      data={weapons}
      title="Weapons"
      columns={weaponActionColumns(actor)}
      getRowId={(row) => row._id}
    />
  );
}
