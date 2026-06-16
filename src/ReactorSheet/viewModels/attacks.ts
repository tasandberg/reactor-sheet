import type { OSEActor } from "../types/types";
import type { AttackVM } from "./types";
import { formatMod } from "./format";

/** Equipped weapons → one row per attack mode (melee/missile). */
export function selectAttacks(actor: OSEActor): AttackVM[] {
  const { weapons, scores } = actor.system;
  const out: AttackVM[] = [];
  for (const w of weapons) {
    if (!w.system.equipped) continue;
    const qualities = (w.system.qualities ?? []).map((q) => q.label);
    const make = (kind: "melee" | "missile"): AttackVM => ({
      id: `${w.name}-${kind}`,
      name: w.name as string,
      img: w.img,
      kind,
      kindLabel: kind === "melee" ? "Melee" : "Missile",
      hitLabel: formatMod(kind === "melee" ? scores.str.mod : scores.dex.mod),
      damage: w.system.damage,
      qualities,
    });
    if (w.system.melee) out.push(make("melee"));
    if (w.system.missile) out.push(make("missile"));
  }
  return out;
}
