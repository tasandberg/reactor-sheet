import type { OseSpell } from "@src/ReactorSheet/types/types";
import type { GridTableColumn } from "../../shared/constants";
import styled from "styled-components";

const SpellDetail = styled.div`
  font-size: 0.75rem;
  opacity: 0.75;
`;
const spellColumns = (spellSlots = null, detail = false) => {
  const canMemorize = (level: number) => {
    const slot = spellSlots[level];
    if (!slot) return false;

    return slot?.max > 0 && slot.used < slot.max;
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
      name: "Range",
      header: "Range",
      align: "center",
      justify: "start",
      width: "max-content",
      renderCell: (item) => item.system.range,
    });
  }
  if (spellSlots) {
    baseColumns.push({
      name: "Memorize",
      header: "Memorize",
      align: "center",
      justify: "center",
      width: "max-content",
      renderCell: (item) =>
        canMemorize(item.system.lvl) ? (
          <a
            onClick={() =>
              item.update({ "system.memorized": item.system.memorized + 1 })
            }
          >
            <i className="fas fa-plus" title="Memorize Spell"></i>
          </a>
        ) : null,
    });
  }
  return baseColumns;
};

export default spellColumns;
