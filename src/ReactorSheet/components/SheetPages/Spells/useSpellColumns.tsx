import type { OseSpell } from "@src/ReactorSheet/types/types";
import type { GridTableColumn } from "../../shared/constants";
import styled from "styled-components";
import getLabel from "@src/util/getLabel";
import { useReactorSheetContext } from "../../context";
import { TextSmall, TextTiny } from "../../shared/elements";

const SpellDetail = styled(TextTiny)`
  opacity: 0.75;
`;

export function useSpellColumns({
  showMemorize,
  detail,
  deleteable,
}: {
  showMemorize?: boolean;
  detail?: boolean;
  deleteable?: boolean;
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
      name: "LVL",
      header: "",
      align: "center",
      justify: "center",
      width: "25px",
      renderCell: (item) => (
        <img src={item.img} alt={item.name} className="item-image" />
      ),
    },
    {
      name: "Name",
      header: "Name",
      align: "center",
      justify: "start",
      width: "40%",
      renderCell: (item) => (
        <div className="flex-col gap-0">
          <a onClick={() => item.sheet.render(true)}>
            <TextSmall>{item.name as string}</TextSmall>
          </a>
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
      justify: "start",
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
      name: "Range",
      header: "Range",
      align: "center",
      justify: "start",
      getValue: (item) => item.system.range || "-",
    });
    baseColumns.push({
      name: "Duration",
      header: "Duration",
      align: "center",
      justify: "start",
      getValue: (item) => item.system.duration || "-",
    });
    baseColumns.push({
      name: "Memorized",
      header: "Memorized",
      align: "center",
      justify: "start",
      width: "max-content",
      getValue: (item) => `Uses: ${item.system.cast}`,
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

  if (deleteable) {
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
  }

  return baseColumns;
}
