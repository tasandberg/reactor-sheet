import { InventoryView } from "./InventoryView";
import type { InventoryVM, EncumbranceVM } from "../../viewModels/types";

export default { title: "Inventory / InventoryView" };

const inventory: InventoryVM = {
  count: 5,
  groups: [
    {
      key: "weapons",
      label: "Weapons",
      items: [
        { id: "1", name: "Dagger", img: "", meta: "1d4 · melee, missile", monogram: "DA", weight: 20, equipped: true, quantity: null },
        { id: "2", name: "Quarterstaff", img: "", meta: "1d6 · melee", monogram: "QU", weight: 40, equipped: false, quantity: null },
      ],
    },
    {
      key: "armour",
      label: "Armour & Wards",
      items: [{ id: "3", name: "Ring of protection +1", img: "", meta: "", monogram: "RP", weight: 0, equipped: true, quantity: null }],
    },
    {
      key: "gear",
      label: "Gear",
      items: [
        { id: "4", name: "Iron rations (7 days)", img: "", meta: "", monogram: "IR", weight: 80, equipped: null, quantity: { value: 7, max: 7 } },
        { id: "5", name: "Torches", img: "", meta: "", monogram: "TO", weight: 0, equipped: null, quantity: { value: 6, max: 6 } },
        { id: "6", name: "Rope, 50'", img: "", meta: "", monogram: "RO", weight: 50, equipped: null, quantity: null },
      ],
    },
  ],
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
  />
);
