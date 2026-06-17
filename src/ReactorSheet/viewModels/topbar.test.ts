import { describe, it, expect } from "vitest";
import { selectTopbar } from "./topbar";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectTopbar", () => {
  it("exposes level, next level, and xp progress", () => {
    const vm = selectTopbar(raistlin);
    expect(vm.level).toBe(3);
    expect(vm.nextLevel).toBe(4);
    expect(vm.xp).toEqual({ value: 6420, next: 10000 });
  });
});
