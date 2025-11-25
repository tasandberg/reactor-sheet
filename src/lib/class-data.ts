import { CLASSIC_FANTASY_CLASSES } from "./ose-classic-classes";

const ALL_CLASSES = {
  ...CLASSIC_FANTASY_CLASSES,
};

type OSE_CLASS_NAMES = keyof typeof ALL_CLASSES;

export class OseClassData {
  name: string;
  abilitiesPack?: string;
  levels?: {
    xp: number;
    hd: string;
    thac0: number;
    saves: number[];
  }[];

  constructor(className: OSE_CLASS_NAMES) {
    const data = ALL_CLASSES[className];
    if (!data) return null;
    Object.assign(this, data);
  }

  getSavingThrow(
    type: "d" | "w" | "p" | "b" | "s",
    level: number
  ): number | undefined {
    if (!this.levels) return undefined;
    const levelData = this.levels[level - 1];
    if (!levelData) return undefined;
    const typeIndex = ["d", "w", "p", "b", "s"].indexOf(type);
    return levelData.saves[typeIndex];
  }

  getNextLevelXp(currentLevel: number): number | undefined {
    if (!this.levels) return undefined;
    const nextLevelData = this.levels[currentLevel];
    return nextLevelData ? nextLevelData.xp : undefined;
  }
}

export function getNextLevelXp(
  className: OSE_CLASS_NAMES,
  currentLevel: number
): number | undefined {
  const oseClass = new OseClassData(className);
  return oseClass?.getNextLevelXp(currentLevel);
}

export function getPreviousLevelXp(
  className: OSE_CLASS_NAMES,
  currentLevel: number
): number | undefined {
  const oseClass = new OseClassData(className);
  if (!oseClass?.levels) return undefined;
  const previousLevelData = oseClass.levels[currentLevel - 1];
  return previousLevelData ? previousLevelData.xp : 0;
}

export function getSavingThrow(
  className: OSE_CLASS_NAMES,
  type: "d" | "w" | "p" | "b" | "s",
  level: number
): number | undefined {
  const oseClass = new OseClassData(className);
  return oseClass?.getSavingThrow(type, level);
}

export function getHitDice(
  className: OSE_CLASS_NAMES,
  level: number
): string | undefined {
  const oseClass = new OseClassData(className);
  if (!oseClass?.levels) return "1d6";
  const levelData = oseClass.levels[level - 1];
  return levelData ? levelData.hd : undefined;
}
