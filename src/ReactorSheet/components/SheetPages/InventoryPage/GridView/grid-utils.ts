import type { UniqueIdentifier } from "@dnd-kit/core";
import type { OSEActor, OseItem } from "@src/ReactorSheet/types/types";

export async function updateActorItems(actor: OSEActor, items: GridState) {
  const itemUpdates = [];
  const sideEffects = {
    equipped: {
      "system.equipped": true,
      "system.containerId": "",
    },
    carried: {
      "system.equipped": false,
      "system.containerId": "",
    },
  };
  Object.entries(items).forEach(([container, items]) => {
    items.forEach((item, index) => {
      const additionalProps = sideEffects[container] || {
        "system.containerId": container,
        "system.equipped": false,
      };
      itemUpdates.push({
        _id: item.id,
        sort: index,
        ...additionalProps,
      });
    });
  });

  return await actor.updateEmbeddedDocuments("Item", itemUpdates);
}

export type GridState = {
  [key: string]: OseItem[];
};

export function hydrateItem(
  items: OseItem[],
  id: UniqueIdentifier
): OseItem | null {
  return items.find((i) => i.id === id) || null;
}

export function buildGridState(actorItems: OseItem[]): GridState {
  const sortedItems = actorItems.filter((i) => {
    return (
      ["weapon", "armor", "item", "treasure", "container"].includes(i.type) &&
      !i.system.tags.find((t) => t.value === "Currency") &&
      i.system.containerId == ""
    );
  });

  const state: Record<string, OseItem[]> = {
    equipped: sortedItems
      .filter((item) => item.system?.equipped && item.type !== "container")
      .sort((a, b) => a.sort - b.sort),
    carried: sortedItems
      .filter(
        (item) =>
          !item.system?.equipped &&
          item.type !== "container" &&
          item.system.containerId == ""
      )
      .sort((a, b) => a.sort - b.sort),
  };

  sortedItems.forEach((item) => {
    if (item.type === "container") {
      state[item.id] = (item.system.contents || []).sort(
        (a, b) => a.sort - b.sort
      );
    }
  });

  return state;
}
