import type { OseSpell } from "@src/ReactorSheet/types/types";
import type { GridTableColumn } from "../../shared/constants";
import styled from "styled-components";
import getLabel from "@src/util/getLabel";
import { useReactorSheetContext } from "../../context";

const SpellDetail = styled.div`
  font-size: 0.75rem;
  opacity: 0.75;
`;

export function useSpellColumns({
  showMemorize,
  detail,
}: {
  showMemorize?: boolean;
  detail?: boolean;
}) {
  const { actor } = useReactorSheetContext();
  const canMemorize = (item: OseSpell) => {
    const slot = actor.system.spells.slots[item.system.lvl];
    if (!slot) return false;
    return slot?.max > 0 && slot.used < slot.max;
  };

  const memorizeSpell = async (spell: OseSpell) => {
    const level = spell.system.lvl;
    if (!canMemorize(spell))
      throw new Error(`Cannot memorize any more level ${level} spells`);
    await spell.update({ "system.cast": spell.system.cast + 1 });
  };

  const baseColumns: GridTableColumn<OseSpell>[] = [
    {
      name: "Image",
      header: "",
      align: "center",
      justify: "start",
      width: "max-content",
      renderCell: (item) => (
        <img
          src={item.img}
          alt={item.name}
          style={{ width: "25px", height: "25px", objectFit: "cover" }}
        />
      ),
    },
    {
      name: "Name",
      header: "Name",
      align: "center",
      justify: "start",
      width: "max-content",
      renderCell: (item) => (
        <div className="flex-col gap-0">
          <a onClick={() => item.sheet.render(true)}>{item.name as string}</a>
          {detail && <SpellDetail>Level {item.system.lvl}</SpellDetail>}
        </div>
      ),
    },
  ];
  if (detail) {
    baseColumns.push({
      name: "Cast",
      header: "cast",
      align: "center",
      justify: "center",
      width: "max-content",
      renderCell: (item) => (
        <button
          onClick={async () =>
            await item.update({ "system.cast": 0, "system.memorized": 0 })
          }
        >
          {getLabel("OSE.spells.Cast")}
        </button>
      ),
    });
    baseColumns.push({
      name: "Memorized",
      header: "Memorized",
      align: "center",
      justify: "center",
      width: "max-content",
      renderCell: (item) => `Uses: ${item.system.cast}`,
    });
  }
  if (showMemorize) {
    baseColumns.push({
      name: "Memorize",
      header: "Memorize",
      align: "center",
      justify: "center",
      width: "max-content",
      renderCell: (item) =>
        canMemorize(item) ? (
          <a onClick={() => memorizeSpell(item)}>
            <i className="fas fa-plus" title="Memorize Spell"></i>
          </a>
        ) : null,
    });
  }
  baseColumns.push({
    name: "Delete",
    header: "delete",
    align: "center",
    justify: "end",
    width: "1fr",
    renderCell: (item) => (
      <a role="button" onClick={() => item.delete()}>
        <i className="fa fa-trash" />
      </a>
    ),
  });

  return baseColumns;
}
