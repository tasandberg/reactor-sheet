import { describe, it, expect } from "vitest";
import { selectExploration } from "./exploration";
import { raistlin } from "./__fixtures__/raistlin";

describe("selectExploration", () => {
  const vm = selectExploration(raistlin);

  it("returns the four exploration skills with in-six targets", () => {
    expect(vm.map((e) => e.key)).toEqual(["ld", "od", "sd", "ft"]);
    const od = vm.find((e) => e.key === "od")!;
    expect(od.label).toBe("Open Door");
    expect(od.inSix).toBe(2);
  });
});
