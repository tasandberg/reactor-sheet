import { describe, expect, it } from "vitest";
import { adaptAdvancedClass } from "@src/util/adaptAdvancedClasses";

// Trimmed real data from OSE.data.classes.advanced (maxLvl shortened to 5 so
// breakpoint expansion crosses exactly one boundary at level 5).
const acrobat = {
  name: "acrobat",
  menu: "Acrobat",
  pack: "ose-advancedfantasytome.abilities",
  hdArr: ["1d4", "2d4", "3d4", "4d4", "5d4"],
  saves: { "1": [13, 14, 13, 16, 15], "5": [12, 13, 11, 14, 13] },
  thac0: { "1": [19, 0], "5": [17, 2] },
  xp: [1200, 2400, 4800, 9600],
  req: "None",
  spellCaster: false,
  maxLvl: 5,
};

const bard = {
  name: "bard",
  menu: "Bard",
  pack: "ose-advancedfantasytome.abilities",
  hdArr: ["1d6", "2d6", "3d6"],
  saves: { "1": [13, 14, 13, 16, 15] },
  thac0: { "1": [19, 0] },
  xp: [2000, 4000],
  req: "Minimum DEX 9, minimum INT 9",
  spellCaster: true,
  spellPackName: "old-school-essentials.ose spells",
  // slot levels 4-6 never exceed 0 → trimmed to a length-3 spells array.
  spellSlot: {
    "1": { "1": { max: 0 }, "2": { max: 0 }, "3": { max: 0 }, "4": { max: 0 } },
    "2": { "1": { max: 1 }, "2": { max: 0 }, "3": { max: 0 }, "4": { max: 0 } },
    "3": { "1": { max: 2 }, "2": { max: 1 }, "3": { max: 1 }, "4": { max: 0 } },
  },
  maxLvl: 3,
};

describe("adaptAdvancedClass", () => {
  it("maps a non-caster, expanding breakpoint tables to per-level", () => {
    const def = adaptAdvancedClass(acrobat);

    expect(def.name).toBe("Acrobat");
    expect(def.source).toBe("Advanced Fantasy");
    expect(def.abilitiesPack).toBe("ose-advancedfantasytome.abilities");
    expect(def.requirements).toEqual({});
    expect(def.spellsPack).toBeUndefined();
    expect(def.levels).toHaveLength(5);

    // level 1: xp 0, first breakpoint (thac0 single value, not the pair).
    expect(def.levels[0]).toEqual({
      xp: 0,
      hd: "1d4",
      thac0: 19,
      saves: [13, 14, 13, 16, 15],
    });
    // level 4 still on the "1" breakpoint; xp from raw.xp[2].
    expect(def.levels[3].thac0).toBe(19);
    expect(def.levels[3].xp).toBe(4800);
    // level 5 crosses to the "5" breakpoint.
    expect(def.levels[4].thac0).toBe(17);
    expect(def.levels[4].saves).toEqual([12, 13, 11, 14, 13]);
    expect(def.levels[4].xp).toBe(9600);
    // non-casters carry no spells array.
    expect(def.levels[0].spells).toBeUndefined();
  });

  it("maps a caster: parses multi requirements, trims trailing empty spell levels", () => {
    const def = adaptAdvancedClass(bard);

    expect(def.requirements).toEqual({ dex: 9, int: 9 });
    expect(def.spellsPack).toBe("old-school-essentials.ose spells");
    // highest non-zero slot is spell level 3 → length-3 arrays.
    expect(def.levels[0].spells).toEqual([0, 0, 0]);
    expect(def.levels[1].spells).toEqual([1, 0, 0]);
    expect(def.levels[2].spells).toEqual([2, 1, 1]);
  });
});
