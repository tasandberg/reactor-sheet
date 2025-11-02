import type { OseSpell } from "@src/ReactorSheet/types/types";
import type { GridTableColumn } from "../../shared/constants";
import getLabel from "@src/util/getLabel";
import { useReactorSheetContext } from "../../context";
import { TextSmall, TextTiny } from "../../shared/elements";
import { showDeleteDialog } from "../../shared/showDeleteDialog";

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

  const isMemorized = (spell: OseSpell) => spell.system.cast > 0;

  const forgetSpell = async (spell: OseSpell) => {
    if (spell.system.cast > 0) {
      await spell.update({ "system.cast": spell.system.cast - 1 });
    }
  };

  const baseColumns: GridTableColumn<OseSpell>[] = [
    {
      name: "img",
      header: "Spell",
      align: "center",
      justify: "center",
      renderCell: (item) => (
        <img src={item.img} alt={item.name} className="item-image" width="30" />
      ),
    },
    {
      name: "Name",
      header: "",
      align: "center",
      justify: "start",
      width: "1fr",
      renderCell: (item) => (
        <div className="flex-col gap-0">
          <a onClick={() => item.sheet.render(true)}>
            <TextSmall>{item.name as string}</TextSmall>
          </a>
          {detail && (
            <TextTiny style={{ opacity: "0.5" }}>
              Level {item.system.lvl}
            </TextTiny>
          )}
        </div>
      ),
    },
  ];
  if (detail) {
    baseColumns.push({
      name: "Range",
      header: "Range",
      align: "center",
      justify: "center",
      getValue: (item) => item.system.range || "-",
    });
    baseColumns.push({
      name: "Memorized",
      header: "Memorized",
      align: "center",
      justify: "center",
      getValue: (item) => `Uses: ${item.system.cast}`,
    });
    baseColumns.push({
      name: "Cast",
      header: "cast",
      align: "center",
      justify: "center",
      width: "60px",
      renderCell: (item) => (
        <button
          onClick={async () => await item.spendSpell({ skipDialog: false })}
        >
          {getLabel("OSE.spells.Cast")}
        </button>
      ),
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
      renderCell: (item) => (
        <a
          role="button"
          onClick={async () => {
            if (isMemorized(item)) {
              await forgetSpell(item);
            } else {
              showDeleteDialog(item);
            }
          }}
        >
          <i className="fa fa-trash" />
        </a>
      ),
    });
  }

  return baseColumns;
}
