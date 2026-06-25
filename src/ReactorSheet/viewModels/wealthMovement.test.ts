import { describe, it, expect } from "vitest";
import { selectWealthMovement } from "./wealthMovement";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectWealthMovement", () => {
  const vm = selectWealthMovement(raistlin);

  it("lists present coins in GP/SP/CP/PP/EP order, skipping absent", () => {
    expect(vm.coins.map((c) => `${c.name}:${c.qty}`)).toEqual(["GP:42", "SP:17"]);
  });

  it("maps movement to encounter/explore/travel", () => {
    expect(vm.move).toEqual({ encounter: 40, explore: 120, travel: 24 });
  });
});
