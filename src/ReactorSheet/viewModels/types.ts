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

export interface AttackVM {
  id: string;
  name: string;
  img: string;
  kind: "melee" | "missile";
  kindLabel: string;
  hitLabel: string;
  damage: string;
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

export interface InventoryItemVM {
  id: string;
  name: string;
  img: string;
  /** Inline meta line, e.g. "1d4 · melee" for weapons. "" when none. */
  meta: string;
  /** Short monogram for the grid card when the item has no real art. */
  monogram: string;
  weight: number;
  /** null when the item type can't be equipped (no `equipped` field). */
  equipped: boolean | null;
  /** null unless the item is a stack (qty > 1) or charged (max set). */
  quantity: { value: number; max: number } | null;
}

export interface InventoryGroup {
  key: string;
  label: string;
  items: InventoryItemVM[];
}

export interface InventoryVM {
  groups: InventoryGroup[];
  count: number;
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
