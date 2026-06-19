import { InventoryView } from "./InventoryView";
import type { InventoryVM, EncumbranceVM } from "../../viewModels/types";

export default { title: "Inventory / InventoryView" };

const inventory: InventoryVM = {
  count: 7,
  items: [
    { id: "1", name: "Dagger", img: "", category: "Weapon", categoryRank: 0, damage: "1d4", tags: [{ label: "Melee", icon: "" }, { label: "Missile", icon: "" }], monogram: "DA", weight: 20, sort: 100, equippedSort: 100, equipped: true, quantity: null, isContainer: false, children: [] },
    { id: "2", name: "Quarterstaff", img: "", category: "Weapon", categoryRank: 0, damage: "1d6", tags: [{ label: "Melee", icon: "" }, { label: "Blunt", icon: "" }], monogram: "QU", weight: 40, sort: 200, equippedSort: 200, equipped: false, quantity: null, isContainer: false, children: [] },
    { id: "3", name: "Ring of Protection +1", img: "", category: "Armour", categoryRank: 1, damage: "", tags: [], monogram: "RP", weight: 0, sort: 300, equippedSort: 300, equipped: true, quantity: null, isContainer: false, children: [] },
    {
      id: "c1",
      name: "Backpack",
      img: "",
      category: "Container",
      categoryRank: 3,
      damage: "",
      tags: [],
      monogram: "BP",
      weight: 80,
      sort: 400,
      equippedSort: 400,
      equipped: null,
      quantity: null,
      isContainer: true,
      children: [
        { id: "4", name: "Iron Rations (7 days)", img: "", category: "Gear", categoryRank: 2, damage: "", tags: [], monogram: "IR", weight: 80, sort: 100, equippedSort: 100, equipped: null, quantity: { value: 7, max: 7 }, isContainer: false, children: [] },
        { id: "5", name: "Torches", img: "", category: "Gear", categoryRank: 2, damage: "", tags: [], monogram: "TO", weight: 0, sort: 200, equippedSort: 200, equipped: null, quantity: { value: 6, max: 6 }, isContainer: false, children: [] },
      ],
    },
    { id: "6", name: "Rope, 50'", img: "", category: "Gear", categoryRank: 2, damage: "", tags: [], monogram: "RO", weight: 50, sort: 500, equippedSort: 500, equipped: null, quantity: null, isContainer: false, children: [] },
  ],
  equipped: [],
  // legacy compat
  groups: [],
};

const encumbrance: EncumbranceVM = { enabled: true, value: 380, max: 1600, pct: 0.2375, status: "Unencumbered", move: 120 };

const coins = [
  { denom: "PP", id: "pp", value: 0 },
  { denom: "GP", id: "gp", value: 152 },
  { denom: "EP", id: "ep", value: 0 },
  { denom: "SP", id: "sp", value: 8 },
  { denom: "CP", id: "cp", value: 0 },
];

export const Default = () => (
  <InventoryView
    inventory={inventory}
    encumbrance={encumbrance}
    coins={coins}
    onSetCoin={() => {}}
    onEquip={() => {}}
    onOpen={() => {}}
    onReorder={() => {}}
    onNest={() => {}}
  />
);
