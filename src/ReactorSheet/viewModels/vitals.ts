import type { OSEActor } from "../types/types";
import type { VitalsVM } from "./types";

export function selectVitals(actor: OSEActor): VitalsVM {
  const { hp, aac, ac, scores, movement } = actor.system;
  return {
    hp: { value: hp.value, max: hp.max },
    ac: { ascending: aac.value, descending: ac.value },
    initMod: scores.dex.init,
    hd: hp.hd,
    move: movement.base,
  };
}
