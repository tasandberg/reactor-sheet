import type { OSEActor } from "@domain/types";
import type { VitalsVM } from "@domain/vm-types";

export function selectVitals(actor: OSEActor): VitalsVM {
  const { hp, aac, ac, scores, movement, initiative } = actor.system;
  return {
    hp: { value: hp.value, max: hp.max },
    ac: { ascending: aac.value, descending: ac.value },
    initMod: scores.dex.init + (initiative?.mod ?? 0),
    hd: hp.hd,
    move: movement.base,
    moveBands: {
      encounter: movement.encounter,
      explore: movement.base,
      travel: movement.overland,
    },
  };
}
