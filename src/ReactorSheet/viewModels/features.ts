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

/** A class/race group of features, keyed by the shared `requirements` slug. */
export interface FeatureGroupVM {
  /** Normalized slug from `requirements`, e.g. "magic-user" / "dwarf". "" when unset. */
  slug: string;
  /** Display name, e.g. "Magic-User" / "Dwarf" / "Other". */
  label: string;
  /** True for the group matching the actor's own `details.class`. */
  isOwnClass: boolean;
  features: FeatureVM[];
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

/**
 * Normalize a class/requirements string to a comparison slug.
 * OSE stores `requirements` lowercased ("magic-user", "dwarf"); `details.class`
 * is free text ("Magic User", "Magic-User"). Lowercase + collapse spaces/dashes
 * so they compare equal.
 */
function classSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "-");
}

/** Title-case a slug for display when the feature carries no nicer name. */
function slugLabel(slug: string): string {
  if (!slug) return "Other";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

/**
 * Group features into sections by their `requirements` slug.
 *
 * OSE has no separate "race" concept — demi-human races (Dwarf/Elf/Halfling)
 * ARE classes, and every ability's `requirements` names its owning class/race.
 * So we group by that slug rather than a fixed class/race split. The group
 * matching the actor's own `details.class` sorts first and is flagged
 * `isOwnClass` (the UI titles it "Class Features"); other groups title after
 * their own name. Empty groups are never produced.
 */
export function groupFeaturesByClass(
  features: FeatureVM[],
  actorClass: string
): FeatureGroupVM[] {
  const ownSlug = classSlug(actorClass ?? "");
  const order: string[] = [];
  const groups = new Map<string, FeatureVM[]>();

  for (const f of features) {
    const slug = classSlug(f.requirements ?? "");
    if (!groups.has(slug)) {
      groups.set(slug, []);
      order.push(slug);
    }
    groups.get(slug)!.push(f);
  }

  return order
    .map((slug) => ({
      slug,
      // Prefer the actor's own class text for its label so casing matches the sheet.
      label: slug && slug === ownSlug ? actorClass : slugLabel(slug),
      isOwnClass: !!slug && slug === ownSlug,
      features: groups.get(slug)!,
    }))
    .sort((a, b) => Number(b.isOwnClass) - Number(a.isOwnClass));
}
