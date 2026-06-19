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
  mk("weapon", "Dagger",          { damage: "1d4", melee: true, missile: true, equipped: false, weight: 20, quantity: { value: 1, max: 0 }, tags: [{ label: "Light", icon: "" }, { label: "Thrown", icon: "" }] }),
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

  it("maps weapon damage, tags, equip state, quantity, monogram", () => {
    const dagger = vm.items[0];
    expect(dagger.damage).toBe("1d4");
    expect(dagger.tags).toEqual([
      { label: "Light", icon: "" },
      { label: "Thrown", icon: "" },
    ]);
    expect(dagger.equipped).toBe(false);
    expect(dagger.quantity).toBeNull(); // qty.value = 1 — not a stack
    const rations = vm.items[2];
    expect(rations.quantity).toEqual({ value: 7, max: 7 });
    expect(rations.monogram).toBe("IR");
  });

  it("non-weapon has empty damage", () => {
    const ring = vm.items[1];
    expect(ring.damage).toBe("");
  });

  it("dedupes tags by label", () => {
    const dup = mk("weapon", "Sword", {
      damage: "1d8",
      melee: true,
      weight: 30,
      tags: [{ label: "Melee", icon: "" }, { label: "Melee", icon: "" }, { label: "Heavy", icon: "" }],
    });
    const vm2 = selectInventory([dup]);
    expect(vm2.items[0].tags.map((t) => t.label)).toEqual(["Melee", "Heavy"]);
  });

  it("excludes Currency label from tags list", () => {
    const item = mk("item", "Gem", { weight: 5, tags: [{ label: "Currency", icon: "" }, { label: "Precious", icon: "" }] });
    const vm2 = selectInventory([item]);
    expect(vm2.items[0].tags.map((t) => t.label)).toEqual(["Precious"]);
  });

  it("legacy groups still present for grid view", () => {
    expect(vm.groups.map((g) => g.key)).toContain("weapons");
  });

  it("equipped items appear in both the main list and the equipped subset", () => {
    const vm2 = selectInventory([
      mk("weapon", "Sword", { equipped: true, weight: 30 }),
      mk("armor", "Shield", { equipped: false, weight: 10 }),
    ]);
    expect(vm2.equipped.map((i) => i.name)).toEqual(["Sword"]);
    expect(vm2.items.map((i) => i.name)).toEqual(["Sword", "Shield"]);
    expect(vm2.count).toBe(2);
  });

  it("equipped subset includes an equipped nested item still listed under its container", () => {
    const vm2 = selectInventory([
      mk("container", "Bag", { weight: 5 }, { id: "bag" }),
      mk("weapon", "Sword", { equipped: true, weight: 30, containerId: "bag" }, { id: "sword" }),
    ]);
    expect(vm2.items.map((i) => i.id)).toEqual(["bag"]);
    expect(vm2.items[0].children.map((c) => c.id)).toEqual(["sword"]);
    expect(vm2.equipped.map((i) => i.id)).toEqual(["sword"]);
  });

  it("excludes non-physical types (spells, abilities)", () => {
    const vm2 = selectInventory([
      mk("weapon", "Sword", { weight: 30 }),
      mk("spell", "Magic Missile", {}),
      mk("ability", "Listening at Doors", {}),
    ]);
    expect(vm2.items.map((i) => i.name)).toEqual(["Sword"]);
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
    damage: "", tags: [], monogram: "XX", weight: 0, sort: 0,
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

  it("dir reverses the column: name desc → Z→A", () => {
    const result = sortInventory([rope, box, sword, shield], "name", "desc");
    expect(result.map((i) => i.name)).toEqual(["Sword", "Shield", "Rope", "Box"]);
  });

  it("weight asc: lightest first", () => {
    const result = sortInventory([rope, box, sword, shield], "weight", "asc");
    expect(result.map((i) => i.id)).toEqual(["ro", "sh", "sw", "bx"]);
  });

  it("equipped state does not affect order (no hoisting)", () => {
    const a = mkVM({ id: "a", name: "Aaa", categoryRank: 2, equipped: false });
    const b = mkVM({ id: "b", name: "Zzz", categoryRank: 2, equipped: true });
    // pure name order — equipped Zzz stays after Aaa
    expect(sortInventory([a, b], "name").map((i) => i.id)).toEqual(["a", "b"]);
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
