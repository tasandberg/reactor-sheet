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
  qualities: string[];
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
