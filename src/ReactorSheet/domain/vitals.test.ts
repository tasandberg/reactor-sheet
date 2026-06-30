import { describe, expect, it } from "vitest";
import { selectAc } from "@domain/vitals";

describe("selectAc", () => {
  it("uses ascending AAC value when the setting is on", () => {
    expect(selectAc(14, 5, true)).toEqual({ value: 14, ascending: true });
  });

  it("uses descending AC value when the setting is off", () => {
    expect(selectAc(14, 5, false)).toEqual({ value: 5, ascending: false });
  });
});
