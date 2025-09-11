import clsx from "clsx";
import { useReactorSheetContext } from "../../context";
import Encumbrance from "../../Encumbrance";
import { SectionHeader } from "../../shared/elements";
import { toggleExpand } from "../../shared/expandable";
import ItemTable, { type ItemTableColumn } from "./ItemTable";
import Money from "./Money";
import UsageBar from "./UsageBar";
import type { OseItem } from "@src/ReactorSheet/types/types";

export default function InventoryPage() {
  const { items, actor } = useReactorSheetContext();

  const categorizedItems: Record<string, OseItem[]> = items.reduce(
    (acc, item) => {
      const category = item.type || "uncategorized";
      if (!["weapon", "armor", "item", "treasure"].includes(category)) {
        return acc; // Skip items that are not weapon, armor, or gear
      }
      if (item.system.tags.find((t) => t.value === "Currency")) {
        return acc; // Skip currency items
      }
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {}
  );

  const handleEquip = async (item: OseItem) => {
    await item.update({ system: { equipped: !item.system.equipped } });
  };

  async function updateQuantity(item: OseItem) {
    const { value, max } = item.system.quantity;
    const newValue = Math.clamp(value - 1, 0, max);
    await item.update({ "system.quantity.value": newValue });
  }

  const columns: ItemTableColumn[] = [
    {
      name: "",
      getCell: (item) => (
        <img
          src={item.img}
          alt={item.name}
          width={45}
          style={{ flexGrow: 0, flexShrink: 0 }}
        />
      ),
      showHeader: false,
      classes: "p-0",
      align: "left",
    },
    {
      name: "Name",
      getValue: (item) => item.name,
      getCell: (item) => (
        <div className="flex-col gap-0">
          <a onClick={() => item.sheet.render(true)}>{item.name}</a>
          <UsageBar
            value={item.system.quantity.value}
            max={item.system.quantity.max}
            onClick={() => updateQuantity(item)}
          />
        </div>
      ),
      align: "left",
      sortable: true,
    },
    {
      name: "Weight",
      sortable: true,
      getValue: (item) => item.system.cumulativeWeight,
    },
    {
      name: "Qty",
      sortable: true,
      getValue: (item) => item.system?.quantity?.value || "",
    },
    {
      name: "Equipped",
      sortable: true,
      getValue: (item) =>
        item.system?.equipped && item.system.equipped ? 1 : 0,
      getCell: (item) =>
        Object.prototype.hasOwnProperty.call(item.system, "equipped") ? (
          <i
            className={clsx("fa-hand", {
              fas: item.system.equipped,
              far: !item.system.equipped,
            })}
            role="button"
            style={{ opacity: item.system.equipped ? 1 : 0.5 }}
            onClick={() => handleEquip(item)}
          />
        ) : (
          ""
        ),
    },
    {
      name: "Delete",
      showHeader: false,
      sortable: false,
      getCell: (item) => (
        <a className="item-control item-show" onClick={() => item.delete()}>
          <i className="fas fa-trash"></i>
        </a>
      ),
    },
  ];
  return (
    <div className="flex-col gap-1" style={{ overflow: "hidden" }}>
      {Object.entries(categorizedItems).map(([category, items]) => (
        <div key={category}>
          <SectionHeader
            className="expandable expanded mb-0"
            onClick={toggleExpand}
          >
            {category}
          </SectionHeader>
          <div>
            <ItemTable columns={columns} items={items} />
          </div>
        </div>
      ))}
      <Money actor={actor} />
      <Encumbrance />
    </div>
  );
}
