import { useReactorSheetContext } from "../context";
import { actionColumns } from "../shared/constants";
import type { OseWeapon } from "../../types/types";
import GridTable from "../shared/GridTable";
import SavingThrows from "./SavingThrows";
import { SectionHeader } from "../shared/elements";
/**
 * TODO:
 * - reference: https://www.dndbeyond.com/characters/91477249
 * - Implement table headers and rows using a grid layout
 *
 */

export default function ActionsPage() {
  const { items, actor } = useReactorSheetContext();
  const weapons = items.filter(
    ({ type, system }: OseWeapon) => type == "weapon" && system.equipped
  );

  return (
    <div className="flex-row gap-4">
      <div className="flex-col">
        <SectionHeader>Attack!</SectionHeader>
        <GridTable<OseWeapon>
          columns={actionColumns(actor)}
          data={weapons as OseWeapon[]}
          getRowId={(row) => row._id}
          showHeader={false}
        />
        <SectionHeader>Special Actions</SectionHeader>
        <div>
          Special actions are not yet implemented. Please use the chat commands
          to perform special actions.
        </div>
      </div>
      <SavingThrows />
    </div>
  );
}
