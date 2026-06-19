import { describe, it, expect, beforeAll, vi } from "vitest";
import { groupFeaturesByClass, selectFeatures } from "./features";
import type { FeatureVM } from "./features";
import type { OSEActor, OseAbility } from "../types/types";

// selectFeatures composes the roll tag from CONFIG.OSE.roll_type (a Foundry global).
beforeAll(() => {
  (globalThis as { CONFIG?: unknown }).CONFIG = {
    OSE: { roll_type: { result: "=", above: "≥", below: "≤" } },
  };
});

type AbilityMock = {
  _id: string;
  name: string;
  img?: string;
  roll?: () => void;
  // partial ability system — full OseItem system has many required fields the VM ignores
  system?: Partial<OseAbility["system"]>;
};

function ability(partial: AbilityMock): OseAbility {
  return {
    img: "icons/x.svg",
    roll: vi.fn(),
    ...partial,
    system: { description: "", ...(partial.system ?? {}) },
  } as unknown as OseAbility;
}

function actorWith(abilities: OseAbility[]): OSEActor {
  return {
    system: { abilities: Object.fromEntries(abilities.map((a) => [a._id, a])) },
  } as unknown as OSEActor;
}

describe("selectFeatures", () => {
  it("marks a feature with a roll formula rollable and composes the tag with the target", () => {
    const actor = actorWith([
      ability({ _id: "a1", name: "Hide", system: { roll: "1d6", rollType: "below", rollTarget: 2 } }),
    ]);
    const [vm] = selectFeatures(actor);
    expect(vm.rollable).toBe(true);
    expect(vm.rollTag).toBe("1d6 ≤ 2");
    expect(vm.onRoll).toBeTypeOf("function");
  });

  it("omits the target half when rollTarget is 0/unset", () => {
    const actor = actorWith([
      ability({ _id: "a1", name: "Listen", system: { roll: "1d6", rollType: "result", rollTarget: 0 } }),
    ]);
    expect(selectFeatures(actor)[0].rollTag).toBe("1d6");
  });

  it("treats a passive feature (no formula) as non-rollable", () => {
    const actor = actorWith([
      ability({ _id: "a1", name: "Read Magic", system: { roll: "" } }),
    ]);
    const [vm] = selectFeatures(actor);
    expect(vm.rollable).toBe(false);
    expect(vm.rollTag).toBeUndefined();
    expect(vm.onRoll).toBeUndefined();
  });

  it("onRoll calls the item's own roll method", () => {
    const item = ability({ _id: "a1", name: "Hear Noise", system: { roll: "1d6", rollTarget: 1 } });
    selectFeatures(actorWith([item]))[0].onRoll!();
    expect(item.roll).toHaveBeenCalledOnce();
  });
});

describe("groupFeaturesByClass", () => {
  const feat = (id: string, requirements?: string): FeatureVM => ({
    id,
    name: id,
    img: "",
    description: "",
    requirements,
    rollable: false,
    onDelete: () => {},
  });

  it("groups by the requirements slug and sorts the actor's own class first", () => {
    const groups = groupFeaturesByClass(
      [feat("a", "thief"), feat("b", "magic-user"), feat("c", "magic-user")],
      "Magic User" // free-text class normalizes to the "magic-user" slug
    );
    expect(groups.map((g) => g.slug)).toEqual(["magic-user", "thief"]);
    expect(groups[0].isOwnClass).toBe(true);
    expect(groups[0].label).toBe("Magic User"); // keeps the actor's own casing
    expect(groups[0].features.map((f) => f.id)).toEqual(["b", "c"]);
    expect(groups[1].isOwnClass).toBe(false);
    expect(groups[1].label).toBe("Thief"); // title-cased from the slug
  });

  it("buckets features with no requirements into an 'Other' group", () => {
    const groups = groupFeaturesByClass([feat("a")], "Fighter");
    expect(groups).toHaveLength(1);
    expect(groups[0].slug).toBe("");
    expect(groups[0].label).toBe("Other");
    expect(groups[0].isOwnClass).toBe(false);
  });

  it("returns no groups when there are no features", () => {
    expect(groupFeaturesByClass([], "Cleric")).toEqual([]);
  });
});
