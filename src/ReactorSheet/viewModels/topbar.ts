import type { OSEActor } from "../types/types";
import type { TopbarVM } from "./types";
import { selectClassDefaults } from "./classRules";

export function selectTopbar(actor: OSEActor): TopbarVM {
  const { level, xp } = actor.system.details;
  // Progress runs across the current level's band [floor, next], not [0, next] —
  // the floor comes from the class XP table; `next` is the actor's stored value
  // (editable in the Edit modal, where the class table is the reset default).
  const floor = selectClassDefaults(actor).levelXp ?? 0;
  const span = xp.next - floor;
  const pct = span > 0 ? Math.min(100, Math.max(0, ((xp.value - floor) / span) * 100)) : 0;
  return { level, nextLevel: level + 1, xp: { value: xp.value, next: xp.next }, pct };
}
