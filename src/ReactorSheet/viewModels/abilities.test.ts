import { describe, it, expect } from "vitest";
import { selectAbilities } from "./abilities";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectAbilities", () => {
  const vm = selectAbilities(raistlin);

  it("returns the six scores in canonical order", () => {
    expect(vm.map((a) => a.key)).toEqual(["str", "dex", "con", "int", "wis", "cha"]);
  });

  it("reads value + derived mod with a formatted label", () => {
    const int = vm.find((a) => a.key === "int")!;
    expect(int.value).toBe(17);
    expect(int.mod).toBe(2);
    expect(int.modLabel).toBe("+2");
    const str = vm.find((a) => a.key === "str")!;
    expect(str.modLabel).toBe("+0");
  });
});
