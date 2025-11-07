import clsx from "clsx";
import { useReactorSheetContext } from "../../context";
import {
  Row,
  SectionHeader,
  TextLarge,
  TextSmall,
} from "../../shared/elements";
import { toggleExpand } from "../../shared/expandable";
import ItemTable, { type ItemTableColumn } from "./ItemTable";
import Money from "./Money";
import UsageBar from "./UsageBar";
import type { OseItem } from "@src/ReactorSheet/types/types";
import { useState } from "react";
import GridView from "./GridView";
import { showDeleteDialog } from "../../shared/foundryDialogs";

export default function InventoryPage() {
  const [gridView, setGridView] = useState(true);
  const { items } = useReactorSheetContext();

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
        <a
          className="item-control item-show"
          onClick={() => showDeleteDialog(item)}
        >
          <i className="fas fa-trash"></i>
        </a>
      ),
    },
  ];
  return (
    <div className="flex-col" style={{ overflow: "hidden" }}>
      <Row $justify="space-between" className="mb-2">
        <div>
          <TextLarge>Inventory</TextLarge>
        </div>
        <div className="flex-row gap-2" style={{ alignItems: "center" }}>
          <TextSmall>View:</TextSmall>
          <button onClick={() => setGridView(true)}>
            <i className="fa fa-grid" />
          </button>
          <button onClick={() => setGridView(false)}>
            <i className="fa fa-list" />
          </button>
        </div>
      </Row>
      {gridView ? (
        <GridView />
      ) : (
        Object.entries(categorizedItems).map(([category, items]) => (
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
        ))
      )}
      <Money />
    </div>
  );
}
