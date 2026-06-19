import type { OSESave } from "../types/types";

export interface IdentityVM {
  name: string;
  img: string;
  classLabel: string;
  level: number;
  alignment: string;
  title: string;
}

export interface VitalsVM {
  hp: { value: number; max: number };
  ac: { ascending: number; descending: number };
  initMod: number;
  hd: string;
  move: number;
  /** Movement bands for the MOVE pill popover (per-round / per-turn / per-day). */
  moveBands: { encounter: number; explore: number; travel: number };
}

export interface AbilityVM {
  key: string;
  label: string;
  value: number;
  mod: number;
  modLabel: string;
}

/** A clickable roll: what to show on the pill, the dice formula, and chat flavour. */
export interface RollSpec {
  /** Display label, e.g. "1d20 +1(str)" or "1d8". */
  label: string;
  /** Foundry roll formula, e.g. "1d20+1". */
  formula: string;
  /** Chat-message flavour. */
  flavor: string;
}

export interface AttackVM {
  id: string;
  itemId: string;
  name: string;
  img: string;
  kind: "melee" | "missile";
  kindLabel: string;
  /** To-hit roll (1d20 + ability mod). */
  hit: RollSpec;
  /** Just the hit modifier term for the button, e.g. "+1" / "-1" / "" (mod 0). */
  hitTerm: string;
  /** Full hit formula with named mods for the popover, e.g. "1d20 + 1 (dex)". */
  hitTip: string;
  /** Damage roll (weapon die + ability mod). */
  dmg: RollSpec;
  /** Full damage formula with named mods for the popover, e.g. "1d6 + 1 (str)". */
  dmgTip: string;
  qualities: { label: string; icon: string }[];
}

export interface SaveVM {
  key: OSESave;
  label: string;
  icon: string;
  target: number;
}

export interface ExplorationVM {
  key: string;
  label: string;
  icon: string;
  inSix: number;
}

export interface TopbarVM {
  level: number;
  nextLevel: number;
  xp: { value: number; next: number };
}

export interface WealthMovementVM {
  coins: { name: string; img: string; qty: number }[];
  move: { encounter: number; explore: number; travel: number };
}

export type InventorySortKey = "manual" | "category" | "name" | "weight";
export type SortDir = "asc" | "desc";

export interface InventoryItemVM {
  id: string;
  name: string;
  img: string;
  category: string;        // "Weapon" | "Armour" | "Gear" | "Container"
  categoryRank: number;    // weapon 0, armour 1, gear 2, container 3
  /** Weapon damage die, e.g. "1d8". "" for non-weapons. */
  damage: string;
  /** Item tags from system.tags (label + icon), deduped. [] if none. */
  tags: { label: string; icon: string }[];
  /** Short monogram for the grid card when the item has no real art. */
  monogram: string;
  weight: number;
  sort: number;            // manual order — reactor-sheet `order` flag (falls back to item.sort)
  equippedSort: number;    // manual order within the equipped tray — `equippedOrder` flag (falls back to `sort`)
  /** null when the item type can't be equipped (no `equipped` field). */
  equipped: boolean | null;
  /** null unless the item is a stack (qty > 1) or charged (max set). */
  quantity: { value: number; max: number } | null;
  isContainer: boolean;
  children: InventoryItemVM[]; // [] unless container; nested by containerId
}

/** @deprecated use InventoryVM.items (flat list with containers carrying children) */
export interface InventoryGroup {
  key: string;
  label: string;
  items: InventoryItemVM[];
}

export interface InventoryVM {
  items: InventoryItemVM[];  // top-level only; containers carry their children. Includes equipped items.
  /** Currently-equipped items, shown in the equipped tray (a subset of `items`). */
  equipped: InventoryItemVM[];
  count: number;
  /** @deprecated kept for grid view compatibility */
  groups: InventoryGroup[];
}

export interface CoinVM {
  /** Uppercase denomination label, e.g. "GP". */
  denom: string;
  /** The backing treasure item's id (for quantity updates). */
  id: string;
  value: number;
}

export interface EncumbranceVM {
  enabled: boolean;
  value: number;
  max: number;
  /** Fraction 0–1 for the progress bar. */
  pct: number;
  /** e.g. "Unencumbered". */
  status: string;
  /** Current movement (ft), e.g. 120. */
  move: number;
}
