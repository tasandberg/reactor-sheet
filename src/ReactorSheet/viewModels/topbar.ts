import type { OSEActor } from "../types/types";
import type { TopbarVM } from "./types";

export function selectTopbar(actor: OSEActor): TopbarVM {
  const { level, xp } = actor.system.details;
  return { level, nextLevel: level + 1, xp: { value: xp.value, next: xp.next } };
}
