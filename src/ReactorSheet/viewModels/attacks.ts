import type { OSEActor } from "../types/types";
import type { AttackVM } from "./types";
import { formatMod } from "./format";

/** Equipped weapons → one row per attack mode (melee/missile). */
export function selectAttacks(actor: OSEActor): AttackVM[] {
  const { weapons, scores } = actor.system;
  const out: AttackVM[] = [];
  for (const w of weapons) {
    if (!w.system.equipped) continue;
    // Dedupe by label, drop Melee/Missile (shown as the kind tag), keep the OSE icon.
    const seen = new Set<string>();
    const qualities: { label: string; icon: string }[] = [];
    for (const q of w.system.qualities ?? []) {
      if (q.label === "Melee" || q.label === "Missile" || seen.has(q.label)) continue;
      seen.add(q.label);
      qualities.push({ label: q.label, icon: q.icon ?? "" });
    }
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
