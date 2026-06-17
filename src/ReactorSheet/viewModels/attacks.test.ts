import { describe, it, expect } from "vitest";
import { selectAttacks } from "./attacks";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectAttacks", () => {
  const vm = selectAttacks(raistlin);

  it("expands a melee+missile weapon into two rows", () => {
    const dagger = vm.filter((a) => a.name === "Dagger");
    expect(dagger.map((a) => a.kind)).toEqual(["melee", "missile"]);
  });

  it("uses STR mod for melee hit, DEX mod for missile hit", () => {
    const melee = vm.find((a) => a.name === "Dagger" && a.kind === "melee")!;
    const missile = vm.find((a) => a.name === "Dagger" && a.kind === "missile")!;
    expect(melee.hitLabel).toBe("+0"); // STR 9 → +0
    expect(missile.hitLabel).toBe("+1"); // DEX 13 → +1
    expect(melee.damage).toBe("1d4");
  });

  it("carries quality labels and skips non-equipped weapons", () => {
    const staff = vm.find((a) => a.name === "Quarterstaff")!;
    expect(staff.qualities).toEqual([
      { label: "Two-handed", icon: "fa-hand-fist" },
      { label: "Slow", icon: "fa-hourglass" },
    ]);
    expect(vm.every((a) => a.name !== "Quarterstaff" || a.kind === "melee")).toBe(true);
  });
});
