import { describe, it, expect } from "vitest";
import { selectInventory, selectEncumbrance, sortInventory } from "./inventory";
import type { OseItem, OSEActor } from "../types/types";

const mk = (
  type: string,
  name: string,
  system: Record<string, unknown>,
  opts: { id?: string; sort?: number } = {},
): OseItem =>
  ({ _id: opts.id ?? name, name, img: "", type, sort: opts.sort ?? 0, system }) as unknown as OseItem;

const items: OseItem[] = [
  mk("weapon", "Dagger",          { damage: "1d4", melee: true, missile: true, equipped: true, weight: 20, quantity: { value: 1, max: 0 } }),
  mk("armor",  "Ring of protection", { equipped: false, weight: 0, quantity: { value: 1, max: 0 } }),
  mk("item",   "Iron rations",    { weight: 80, quantity: { value: 7, max: 7 } }),
  mk("item",   "Gold piece",      { tags: [{ value: "Currency" }], quantity: { value: 50, max: 0 } }),
];

describe("selectInventory", () => {
  const vm = selectInventory(items);

  it("flat list excludes currency, count = 3", () => {
    expect(vm.count).toBe(3);
    expect(vm.items.map((i) => i.name)).toEqual(["Dagger", "Ring of protection", "Iron rations"]);
  });

  it("assigns category + categoryRank", () => {
    const [dagger, ring, rations] = vm.items;
    expect(dagger.category).toBe("Weapon");
    expect(dagger.categoryRank).toBe(0);
    expect(ring.category).toBe("Armour");
    expect(ring.categoryRank).toBe(1);
    expect(rations.category).toBe("Gear");
    expect(rations.categoryRank).toBe(2);
  });

  it("maps weapon meta, equip state, quantity, monogram", () => {
    const dagger = vm.items[0];
    expect(dagger.meta).toBe("1d4 · melee, missile");
    expect(dagger.equipped).toBe(true);
    expect(dagger.quantity).toBeNull(); // qty.value = 1 — not a stack
    const rations = vm.items[2];
    expect(rations.quantity).toEqual({ value: 7, max: 7 });
    expect(rations.monogram).toBe("IR");
  });

  it("legacy groups still present for grid view", () => {
    expect(vm.groups.map((g) => g.key)).toContain("weapons");
  });
});

describe("selectInventory — container tree", () => {
  const bag   = mk("container", "Bag",    { weight: 10 },  { id: "bag" });
  const sword = mk("weapon",    "Sword",  { damage: "1d8", melee: true, weight: 30, containerId: "bag" }, { id: "sword", sort: 2 });
  const torch = mk("item",      "Torch",  { weight: 5,  containerId: "bag" }, { id: "torch", sort: 1 });
  const rope  = mk("item",      "Rope",   { weight: 15 }, { id: "rope" });

  const vm = selectInventory([bag, sword, torch, rope]);

  it("top-level contains bag + rope, not nested items", () => {
    expect(vm.items.map((i) => i.id)).toEqual(["bag", "rope"]);
  });

  it("container carries children sorted by sort asc", () => {
    const bagVM = vm.items[0];
    expect(bagVM.isContainer).toBe(true);
    expect(bagVM.children.map((c) => c.id)).toEqual(["torch", "sword"]);
  });

  it("count includes all items in tree", () => {
    expect(vm.count).toBe(4);
  });

  it("orphan containerId (container not in list) → top-level", () => {
    const orphan = mk("item", "Orphan", { weight: 1, containerId: "nonexistent" }, { id: "orphan" });
    const vm2 = selectInventory([orphan]);
    expect(vm2.items[0].id).toBe("orphan");
    expect(vm2.items[0].children).toEqual([]);
  });
});

describe("sortInventory", () => {
  const mkVM = (overrides: Partial<import("./types").InventoryItemVM>): import("./types").InventoryItemVM => ({
    id: "x", name: "X", img: "", category: "Gear", categoryRank: 2,
    meta: "", monogram: "XX", weight: 0, sort: 0,
    equipped: null, quantity: null, isContainer: false, children: [],
    ...overrides,
  });

  const sword  = mkVM({ id: "sw", name: "Sword",  category: "Weapon",    categoryRank: 0, weight: 30, sort: 1 });
  const shield = mkVM({ id: "sh", name: "Shield",  category: "Armour",    categoryRank: 1, weight: 15, sort: 0 });
  const rope   = mkVM({ id: "ro", name: "Rope",    category: "Gear",      categoryRank: 2, weight: 5,  sort: 0 });
  const box    = mkVM({ id: "bx", name: "Box",     category: "Container", categoryRank: 3, weight: 50, sort: 0 });

  it("category sort: by rank, then sort, then name", () => {
    const result = sortInventory([rope, box, sword, shield], "category");
    expect(result.map((i) => i.id)).toEqual(["sw", "sh", "ro", "bx"]);
  });

  it("name sort: localeCompare", () => {
    const result = sortInventory([rope, box, sword, shield], "name");
    expect(result.map((i) => i.name)).toEqual(["Box", "Rope", "Shield", "Sword"]);
  });

  it("weight sort: descending", () => {
    const result = sortInventory([rope, box, sword, shield], "weight");
    expect(result.map((i) => i.id)).toEqual(["bx", "sw", "sh", "ro"]);
  });

  it("recurses into children", () => {
    const parent = mkVM({
      id: "p", name: "Parent", isContainer: true,
      children: [
        mkVM({ id: "c1", name: "Zap", weight: 1 }),
        mkVM({ id: "c2", name: "Ant", weight: 2 }),
      ],
    });
    const result = sortInventory([parent], "name");
    expect(result[0].children.map((c) => c.name)).toEqual(["Ant", "Zap"]);
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
