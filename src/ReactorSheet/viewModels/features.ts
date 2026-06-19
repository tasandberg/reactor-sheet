import type { OSEActor, OseAbility, OseRollType } from "../types/types";
import { showDeleteDialog } from "../components/shared/foundryDialogs";

export interface FeatureVM {
  id: string;
  name: string;
  img: string;
  /** Raw HTML description; enriched at render via Foundry's TextEditor. */
  description: string;
  requirements?: string;
  /** True when the feature has a roll formula (passive features are false). */
  rollable: boolean;
  /** Composed tag, e.g. "1d6 ≤ 2" or "1d6" when there's no target. undefined when passive. */
  rollTag?: string;
  /** Calls the OSE ability item's own roll method (chat, success/fail, blind). */
  onRoll?: () => void;
  /** Opens the confirm-delete dialog for the backing item. */
  onDelete: () => void;
}

/** Symbol for the roll comparison (= / ≥ / ≤) from CONFIG.OSE. Falls back to "=". */
function rollSymbol(rollType?: OseRollType): string {
  const map = (CONFIG as { OSE?: { roll_type?: Record<string, string> } }).OSE?.roll_type;
  return (rollType && map?.[rollType]) || "=";
}

function composeTag(roll: string, rollType?: OseRollType, rollTarget?: number): string {
  // OSE only shows the target half when rollTarget is set (0/undefined ⇒ formula only).
  if (!rollTarget) return roll;
  return `${roll} ${rollSymbol(rollType)} ${rollTarget}`;
}

/**
 * Class/race features — real `ability` Items on `actor.system.abilities`.
 * (Distinct from `abilities.ts`, which is the six ability *scores*.)
 */
export function selectFeatures(actor: OSEActor): FeatureVM[] {
  const abilities = Object.values(actor.system.abilities ?? {}) as OseAbility[];
  return abilities.map((item) => {
    const s = item.system;
    const rollable = !!s.roll;
    return {
      id: item._id as string,
      name: item.name,
      img: item.img,
      description: s.description ?? "",
      requirements: s.requirements || undefined,
      rollable,
      rollTag: rollable ? composeTag(s.roll!, s.rollType, s.rollTarget) : undefined,
      onRoll: rollable ? () => item.roll() : undefined,
      onDelete: () => showDeleteDialog(item),
    };
  });
}
