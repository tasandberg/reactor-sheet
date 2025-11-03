import type { OseItem } from "@src/ReactorSheet/types/types";
import InventoryGridCard from "./InventoryGridCard";

const filterItems = (
  items: OseItem[],
  predicate: (item: OseItem) => boolean
) => {
  return items.filter(predicate);
};

/**
 *
 * TODO
 * - Inventory section cards for containers, carried, equipped, currency
 * - Equipped items (non draggable)
 * - Equip toggle button for carried weapons/armor
 */
export default function GridView({ items }: { items: OseItem[] }) {
  const filteredItems = filterItems(
    items,
    (item) =>
      !item.system.tags.find((t) => t.value == "Currency") &&
      ["weapon", "armor", "item"].includes(item.type)
  );
  const containers = filterItems(items, (item) => item.type === "container");
  const equipped = filterItems(items, (item) => item.system?.equipped);
  const carriedItems = filterItems(
    filteredItems,
    (item) => item.system.containerId === "" && !item.system?.equipped
  );

  return (
    <div className="items">
      <InventoryGridCard
        sectionName="Equipped items"
        items={equipped}
        updateAttributes={{
          "system.equipped": true,
          "system.containerId": "",
        }}
      />
      {containers.map((container) => (
        <InventoryGridCard
          key={`container-${container.id}`}
          container={container}
          items={container.system.contents.filter(
            (item) => !item.system?.equipped
          )}
          updateAttributes={{
            "system.equipped": false,
            "system.containerId": container.id,
          }}
        />
      ))}
      <InventoryGridCard
        sectionName="Carried items"
        items={carriedItems}
        updateAttributes={{
          "system.containerId": "",
          "system.equipped": false,
        }}
      />
    </div>
  );
}
