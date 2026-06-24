import type { OSEActor } from "../types/types";
import type { AcBreakdownRow, VitalsVM } from "./types";
import { formatMod } from "./format";

/** Build the itemized AAC (ascending) breakdown shown in the AC HoverCard.
 *  Reads the exposed AC getters so the rows always sum to `aac.value`:
 *  Base (or Armor when worn) + DEX modifier + Shield + Misc modifier. */
function acBreakdown(aac: OSEActor["system"]["aac"]): AcBreakdownRow[] {
  const rows: AcBreakdownRow[] = [];
  const dex = aac.naked - aac.base; // dex contribution to ascending AC
  const shield = aac.shield;
  const misc = aac.mod;
  // Armour overrides the unarmored base (per the data model); the delta from base
  // is whatever the total isn't accounted for by dex/shield/misc.
  const armorDelta = aac.value - (aac.base + dex + shield + misc);

  rows.push({ label: "Base (unarmored)", value: formatMod(aac.base) });
  if (armorDelta !== 0) rows.push({ label: "Armor", value: formatMod(armorDelta) });
  if (dex !== 0) rows.push({ label: "DEX modifier", value: formatMod(dex) });
  if (shield !== 0) rows.push({ label: "Shield", value: formatMod(shield) });
  if (misc !== 0) rows.push({ label: "Misc modifier", value: formatMod(misc) });
  return rows;
}

export function selectVitals(actor: OSEActor): VitalsVM {
  const { hp, aac, ac, scores, movement } = actor.system;
  return {
    hp: { value: hp.value, max: hp.max },
    ac: {
      ascending: aac.value,
      descending: ac.value,
      breakdown: acBreakdown(aac),
    },
    initMod: scores.dex.init,
    hd: hp.hd,
    move: movement.base,
    moveBands: {
      encounter: movement.encounter,
      explore: movement.base,
      travel: movement.overland,
    },
  };
}
