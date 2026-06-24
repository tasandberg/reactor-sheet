// src/ReactorSheet/viewModels/classRules.ts
import type { ClassicClassName } from "@ose-foundry-core/types";
import type { OSEActor, OSESave } from "../types/types";

const SAVE_ORDER: OSESave[] = ["death", "wand", "paralysis", "breath", "spell"];

export type ClassDefaults = {
  matched: boolean;
  maxLevel: number;
  hd: string | null;
  /** XP floor for the current level (start of this level's band). */
  levelXp: number | null;
  /** XP needed to reach the next level; null at max level. */
  nextXp: number | null;
  saves: Record<OSESave, number> | null;
};

function classicClasses(): Record<string, { levels: { xp: number; hd: string; saves: number[] }[] }> {
  return (CONFIG.OSE?.classes?.classic ?? {}) as never;
}

export function normalizeClassName(raw: string): ClassicClassName | null {
  const canon = (s: string) => (s ?? "").trim().toLowerCase().replace(/[-\s]+/g, " ");
  const want = canon(raw);
  if (!want) return null;
  const hit = Object.keys(classicClasses()).find((k) => canon(k) === want);
  return (hit as ClassicClassName) ?? null;
}

export function selectClassDefaults(actor: OSEActor): ClassDefaults {
  const { class: cls, level } = actor.system.details;
  const key = normalizeClassName(cls);
  const def = key ? classicClasses()[key] : undefined;
  if (!def) return { matched: false, maxLevel: 14, hd: null, levelXp: null, nextXp: null, saves: null };

  const row = def.levels[level - 1];
  const nextRow = def.levels[level]; // 0-indexed: index `level` is the next level
  const saves = row
    ? (Object.fromEntries(SAVE_ORDER.map((k, i) => [k, row.saves[i]])) as Record<OSESave, number>)
    : null;
  return {
    matched: true,
    maxLevel: def.levels.length,
    hd: row?.hd ?? null,
    levelXp: row?.xp ?? null,
    nextXp: nextRow?.xp ?? null,
    saves,
  };
}
