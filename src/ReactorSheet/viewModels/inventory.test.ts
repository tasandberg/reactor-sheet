import { describe, it, expect } from "vitest";
import { selectInventory, selectEncumbrance } from "./inventory";
import type { OseItem, OSEActor } from "../types/types";

const mk = (type: string, name: string, system: Record<string, unknown>): OseItem =>
  ({ _id: name, name, img: "", type, system }) as unknown as OseItem;

const items: OseItem[] = [
  mk("weapon", "Dagger", { damage: "1d4", melee: true, missile: true, equipped: true, weight: 20, quantity: { value: 1, max: 0 } }),
  mk("armor", "Ring of protection", { equipped: false, weight: 0, quantity: { value: 1, max: 0 } }),
  mk("item", "Iron rations", { weight: 80, quantity: { value: 7, max: 7 } }),
  mk("item", "Gold piece", { tags: [{ value: "Currency" }], quantity: { value: 50, max: 0 } }),
];

describe("selectInventory", () => {
  const vm = selectInventory(items);

  it("groups by category and skips currency", () => {
    expect(vm.groups.map((g) => g.key)).toEqual(["weapons", "armour", "gear"]);
    expect(vm.count).toBe(3); // currency excluded
    expect(vm.groups.find((g) => g.key === "gear")!.items.map((i) => i.name)).toEqual(["Iron rations"]);
  });

  it("maps weapon meta, equip state, quantity, monogram", () => {
    const dagger = vm.groups[0].items[0];
    expect(dagger.meta).toBe("1d4 · melee, missile");
    expect(dagger.equipped).toBe(true);
    expect(dagger.quantity).toBeNull(); // single item
    const rations = vm.groups.find((g) => g.key === "gear")!.items[0];
    expect(rations.quantity).toEqual({ value: 7, max: 7 });
    expect(rations.monogram).toBe("IR");
  });
});

describe("selectEncumbrance", () => {
  it("computes pct + status + movement", () => {
    const actor = {
      system: { encumbrance: { value: 380, max: 1600, enabled: true }, movement: { base: 120 } },
    } as unknown as OSEActor;
    const e = selectEncumbrance(actor);
    expect(e.pct).toBeCloseTo(0.2375);
    expect(e.status).toBe("Unencumbered");
    expect(e.move).toBe(120);
  });
});
