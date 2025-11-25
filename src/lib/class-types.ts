export const ATTRIBUTES = ["str", "dex", "con", "int", "wis", "cha"] as const;

export type Attribute = (typeof ATTRIBUTES)[number];

export type OseClass = {
  name: string;
  abilitiesPack: string;
  spellsPack?: string;
  requirements: Partial<Record<Attribute, number>>;
  levels: {
    xp: number;
    hd: string;
    thac0: number;
    saves: number[];
    spells?: number[];
  }[];
  skillChecks?: Record<string, number>[];
  source: string;
};

export type ClassicClassName =
  | "Cleric"
  | "Dwarf"
  | "Elf"
  | "Fighter"
  | "Halfling"
  | "Magic-User"
  | "Thief";

/**
 * Represents a playable race in OSE Advanced Fantasy.
 *
 * @remarks
 * Each race has unique ability modifiers, class restrictions, ability requirements,
 * and available languages. These properties define the mechanical characteristics
 * and limitations of each race in the game system.
 *
 * @property abilityModifiers - Bonuses or penalties applied to specific character attributes.
 *                               Positive values represent bonuses, negative values represent penalties.
 * @property classes - Available character classes for this race mapped to their maximum achievable level.
 *                     An empty object indicates no class restrictions (can advance in any class without limit).
 * @property requirements - Minimum ability score requirements needed to play this race.
 *                          An empty object indicates no minimum requirements.
 * @property languages - List of languages the race can speak, typically including alignment language,
 *                       common tongue, and racial/cultural languages.
 */
export type OseAdvancedRace = {
  abilityModifiers: Partial<Record<Attribute, number>>;
  classes: Record<string, number>;
  requirements: Partial<Record<Attribute, number>>;
  languages: string[];
};
