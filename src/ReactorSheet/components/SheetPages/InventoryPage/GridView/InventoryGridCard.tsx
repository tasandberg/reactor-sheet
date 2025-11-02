import { useReactorSheetContext } from "@src/ReactorSheet/components/context";
import { Column, Row } from "@src/ReactorSheet/components/shared/elements";
import type { OseItem } from "@src/ReactorSheet/types/types";
import InventoryGrid from "./InventoryGrid";
import { OSEConfig } from "@src/ReactorSheet/components/shared/ose-config";
import InventorySectionHeader from "../InventorySectionHeader";
import { sumItemWeight } from "@src/util/sumItemWeight";

type UpdateAttributes = {
  "system.containerId"?: string;
  "system.equipped"?: boolean;
};
export default function InventoryGridCard({
  sectionName,
  items,
  container,
  updateAttributes = {},
}: {
  sectionName?: string;
  imgSrc?: string;
  items: OseItem[];
  container?: OseItem;
  updateAttributes?: UpdateAttributes;
}) {
  const label = container?.name || sectionName || "Container";
  const { actor } = useReactorSheetContext();
  const showWeights = OSEConfig().encumbrance !== "basic";

  function updateItems(items: OseItem[]) {
    const sortUpdates = items.map((i, idx) => ({
      _id: i.id,
      sort: idx,
      "system.containerId": container ? container.id : "",
      ...updateAttributes,
    }));

    actor?.updateEmbeddedDocuments(
      "Item",
      // @ts-expect-error stupid
      sortUpdates
    );
  }

  const totalWeight = container?.system?.totalWeight || sumItemWeight(items);

  return (
    <Column>
      <Row>
        <InventorySectionHeader
          label={`${label}`}
          helperText={
            showWeights
              ? `Items: ${items.length} | Total Weight: ${totalWeight}`
              : null
          }
          img={container && container.img}
        />
      </Row>
      <InventoryGrid
        id={`${label}-grid-card`}
        updateActorItems={updateItems}
        items={items}
      />
    </Column>
  );
}
