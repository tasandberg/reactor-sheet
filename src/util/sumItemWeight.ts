import type { OseItem } from "@src/ReactorSheet/types/types";

export function sumItemWeight(items: OseItem[]) {
  return items.reduce((sum, item) => {
    const itemWeight =
      item.system?.cumulativeWeight ||
      item.system?.totalWeight ||
      item.system?.weight ||
      0;
    return sum + itemWeight;
  }, 0);
}
