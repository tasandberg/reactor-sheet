/**
 * @file Vitals view-model helpers.
 */

/** Constructor shape of OSE's character-AC class. */
type AcConstructor = new (
  isAscending: boolean,
  equippedArmor: Item[],
  dexMod: number,
  mod: number
) => { value: number };

/** The live AC instance read off the actor (`actor.system.ac` / `.aac`). */
type AcInstance = { base: number; naked: number; mod: number };

/**
 * Resolved AC for display, recomputed from the optimistically-overlaid equipped armour
 * (so equip/unequip is instant) via the actor's OWN AC class (`active.constructor`).
 * `dexMod` is recovered from the live instance (`naked = base ± dexMod`); `mod` read off it.
 */
export function selectAc(
  active: AcInstance,
  equippedArmor: Item[],
  isAscending: boolean
): { value: number; ascending: boolean } {
  const dexMod = isAscending
    ? active.naked - active.base
    : active.base - active.naked;
  const Ctor = (active as { constructor: unknown }).constructor as AcConstructor;
  const ac = new Ctor(isAscending, equippedArmor, dexMod, active.mod);
  return { value: ac.value, ascending: isAscending };
}
