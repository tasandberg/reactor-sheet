import { OSE_ADVANCED_CLASSES } from "./ose-advanced-classes";
import { OSE_CLASSIC_CLASSES } from "./ose-classic-classes";

const ALL_CLASSES = {
  ...OSE_CLASSIC_CLASSES,
  ...OSE_ADVANCED_CLASSES,
};

type OSE_CLASS_NAMES = keyof typeof ALL_CLASSES;

export class OseClassData {
  name: string;
  abilitiesPack?: string;
  levels?: {
    xp: number;
    hd: string;
    thaco: number;
    saves: number[];
  }[];

  constructor(className: OSE_CLASS_NAMES) {
    const data = ALL_CLASSES[className];
    if (!data) return null;
    Object.assign(this, data);
  }

  getSavingThrow(type: "d" | "w" | "p" | "b" | "s", level: number): number | undefined {
    if (!this.levels) return undefined;
    const levelData = this.levels[level - 1];
    if (!levelData) return undefined;
    const typeIndex = ["d", "w", "p", "b", "s"].indexOf(type);
    return levelData.saves[typeIndex];
  }
}
