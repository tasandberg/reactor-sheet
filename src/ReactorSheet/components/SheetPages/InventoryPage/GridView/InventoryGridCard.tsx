import { Column } from "@src/ReactorSheet/components/shared/elements";
import type { OseItem } from "@src/ReactorSheet/types/types";
import { OSEConfig } from "@src/ReactorSheet/components/shared/ose-config";
import InventorySectionHeader from "../InventorySectionHeader";
import { sumItemWeight } from "@src/util/sumItemWeight";
import InventoryItem from "./InventoryItem";
import DraggableGridContainer from "@src/ReactorSheet/components/shared/DraggableGrid/DraggableGridContainer";

export default function InventoryGridCard({
  sectionName,
  items,
  container,
  id,
}: {
  sectionName?: string;
  id: string;
  imgSrc?: string;
  items: OseItem[];
  container?: OseItem;
}) {
  const label = container?.name || sectionName || "Container";
  const showWeights = OSEConfig().encumbrance !== "basic";
  const totalWeight = container?.system?.totalWeight || sumItemWeight(items);

  return (
    <Column>
      <InventorySectionHeader
        label={`${label}`}
        helperText={
          showWeights
            ? `Items: ${items.length} | Total Weight: ${totalWeight}`
            : null
        }
        item={container}
        img={container && container.img}
      />
      <DraggableGridContainer
        id={id}
        items={items}
        ItemComponent={InventoryItem}
      />
    </Column>
  );
}
