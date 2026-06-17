import type { OSEActor } from "../types/types";
import type { ExplorationVM } from "./types";

const EXPL_META = [
  { key: "ld", label: "Listen Door", icon: "fas fa-ear" },
  { key: "od", label: "Open Door", icon: "fas fa-door-open" },
  { key: "sd", label: "Find Door", icon: "fas fa-magnifying-glass" },
  { key: "ft", label: "Find Trap", icon: "fas fa-radar" },
] as const;

export function selectExploration(actor: OSEActor): ExplorationVM[] {
  const e = actor.system.exploration;
  return EXPL_META.map(({ key, label, icon }) => ({
    key,
    label,
    icon,
    inSix: e[key],
  }));
}
