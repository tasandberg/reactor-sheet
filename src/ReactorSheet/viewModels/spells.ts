import type { OSEActor, OseSpell } from "../types/types";
import type { SpellLevelVM } from "./types";

/** One part of the prepared-row meta line, e.g. { kind: "damage", text: "1d6+1" }. */
export interface SpellMetaPart {
  kind: "range" | "duration" | "save" | "damage";
  text: string;
}

/**
 * The `R 150' · D 1 turn · no save · 1d6+1` meta line for a prepared spell.
 * Pure: range / duration / save / damage, in that order, dropping empty fields.
 * "no save" renders for spells with no save; the consumer tints `damage` crimson.
 */
export function spellMeta(spell: OseSpell): SpellMetaPart[] {
  const { range, duration, save, damage } = spell.system;
  const parts: SpellMetaPart[] = [];
  if (range) parts.push({ kind: "range", text: `R ${range}` });
  if (duration) parts.push({ kind: "duration", text: `D ${duration}` });
  parts.push({ kind: "save", text: save ? `save ${save}` : "no save" });
  if (damage) parts.push({ kind: "damage", text: damage });
  return parts;
}

/**
 * Per-level spell panels. OSE keys: `slots[lvl] = {used, max}` (used = memorised
 * casts available, max = capacity); each spell's `system.cast` = times prepared.
 * A level shows when it has capacity OR any known spell. Sorted ascending.
 */
export function selectSpellLevels(actor: OSEActor): SpellLevelVM[] {
  const { slots, spellList } = actor.system.spells;
  const levels = new Set<number>();
  for (const lvl of Object.keys(slots)) levels.add(Number(lvl));
  for (const lvl of Object.keys(spellList)) levels.add(Number(lvl));

  return [...levels]
    .sort((a, b) => a - b)
    .map((level) => {
      const slot = slots[level] ?? { used: 0, max: 0 };
      const spellbook = spellList[level] ?? [];
      const prepared = spellbook.filter((s) => s.system.cast > 0);
      return { level, slots: slot, prepared, spellbook };
    })
    .filter((vm) => vm.slots.max > 0 || vm.spellbook.length > 0);
}
