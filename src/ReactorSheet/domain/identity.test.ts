import { describe, it, expect } from "vitest";
import { selectIdentity } from "@domain/identity";
import { raistlin } from "@src/ReactorSheet/__fixtures__/raistlin";

describe("selectIdentity", () => {
  it("maps actor identity for display", () => {
    const vm = selectIdentity(raistlin);
    expect(vm).toEqual({
      name: "Raistlin Majere",
      img: "",
      classLabel: "Magic-User",
      level: 3,
      alignment: "Neutral",
      title: "Conjurer",
    });
  });
});
