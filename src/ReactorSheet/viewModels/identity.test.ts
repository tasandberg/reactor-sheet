import { describe, it, expect } from "vitest";
import { selectIdentity } from "./identity";
import { raistlin } from "./__fixtures__/raistlin";

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
