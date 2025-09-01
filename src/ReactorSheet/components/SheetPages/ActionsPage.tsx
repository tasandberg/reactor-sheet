import { useReactorSheetContext } from "../context";
import { actionColumns } from "../shared/constants";
import type { OseWeapon } from "../../types/types";
import GridTable from "../shared/GridTable";
/**
 * TODO:
 * - reference: https://www.dndbeyond.com/characters/91477249
 * - Implement table headers and rows using a grid layout
 *
 */

export default function ActionsPage() {
  const { items, actor } = useReactorSheetContext();
  const weapons = items.filter(({ type }) => type == "weapon");

  return (
    <div>
      <GridTable<OseWeapon>
        columns={actionColumns(actor)}
        data={weapons as OseWeapon[]}
      />
    </div>
  );
}
