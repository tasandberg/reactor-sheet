import { describe, it, expect } from "vitest";
import { selectVitals } from "./vitals";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectVitals", () => {
  it("maps HP, both AC systems, and sub-stats", () => {
    const vm = selectVitals(raistlin);
    expect(vm).toEqual({
      hp: { value: 8, max: 9 },
      ac: { ascending: 12, descending: 7 },
      initMod: 1,
      hd: "3d4",
      move: 120,
      moveBands: { encounter: 40, explore: 120, travel: 24 },
    });
  });

  it("adds the manual initiative mod to dex init", () => {
    const actor = {
      ...raistlin,
      system: { ...raistlin.system, initiative: { value: 0, mod: 2 } },
    } as typeof raistlin;
    expect(selectVitals(actor).initMod).toBe(3); // dex.init 1 + mod 2
  });
});
