import type { OseSpell } from "@src/ReactorSheet/types/types";
import { useReactorSheetContext } from "../../context";

import { useSpellColumns } from "./useSpellColumns";
import ActionTable from "../Actions/ActionTable";

export default function PreparedSpells({
  deleteable,
}: {
  deleteable?: boolean;
}) {
  const { actor } = useReactorSheetContext();
  const columns = useSpellColumns({ detail: true, deleteable });

  const preparedSpells: OseSpell[] = Object.values(
    actor.system.spells.spellList
  ).reduce(
    (all, spells) =>
      all.concat(spells).filter((spell) => spell.system.cast > 0),
    []
  );

  return preparedSpells.length > 0 ? (
    <ActionTable<OseSpell>
      title={"PREPARED SPELLS"}
      data={preparedSpells}
      columns={columns}
      getRowId={(item) => item._id as string}
    />
  ) : null;
}
