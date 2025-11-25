import type { OseClass } from "@src/lib/class-types";

export function getLevelXp(
  className: string,
  level: number
): number | undefined {
  const levelData = CONFIG.OSE.classes.classic[className]?.levels;
  if (!levelData) return;

  return levelData[level - 1]?.xp;
}

export function getHitDice(
  className: string,
  level: number
): string | undefined {
  const classData = CONFIG.OSE.classes.classic[className] as
    | OseClass
    | undefined;
  if (!classData) return;

  return classData.levels[level - 1]?.hd;
}
