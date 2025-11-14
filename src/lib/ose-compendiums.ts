import type { OSEActor, OseItem } from "@src/ReactorSheet/types/types";

export const ADVANCED_CLASS_ABILITIES_PACK =
  "ose-advancedfantasytome.abilities";
export const ADVANCED_RACE_ABILITIES_PACK =
  "ose-advancedfantasytome.race-abilities";

function classicClassAbilitiesPack(className: string) {
  return game.packs.get(
    `classicfantasycompendium.abilities-${className.toLowerCase()}`
  );
}

export const OSE_MODES = {
  CLASSIC: "classic",
  ADVANCED: "advanced-fantasy",
};

const mode = OSE_MODES.ADVANCED;

/**
 * getRaceAbilities
 *
 * Retrieve ability items for a given race from the appropriate compendium. Advanced Fantasy only.
 *
 * @param race
 * @returns Item[] - array of ability items
 */
export async function getRaceAbilities(race: string) {
  if (mode === OSE_MODES.ADVANCED) {
    const raceAbilities = game.packs.get(ADVANCED_RACE_ABILITIES_PACK);
    const items = await raceAbilities.getDocuments();
    return items.filter(
      (d) => d?.system?.requirements?.toLowerCase() === race.toLowerCase()
    );
  }
}

export async function getClassAbilities(className: string) {
  if (mode === OSE_MODES.ADVANCED) {
    const classAbilities = game.packs.get(ADVANCED_CLASS_ABILITIES_PACK);
    const items = await classAbilities.getDocuments();

    const filteredItems = items.filter(
      (d) => d?.system?.requirements === className.toLowerCase()
    );

    return filteredItems;
  }

  if (mode === OSE_MODES.CLASSIC) {
    const abilities = classicClassAbilitiesPack(className);
    if (!abilities) {
      console.error(
        `[ose ${mode}]`,
        "No abilities pack found for class:",
        className
      );
      return [];
    }
    const items = await abilities.getDocuments();
    console.log(items);
    const classRegexp = new RegExp(`${className.toLowerCase()}`, "i");
    console.log(classRegexp);
    return items.filter((d) =>
      classRegexp.test(d?.system?.requirements?.toLowerCase())
    );
  }
  return [];
}

export async function resetAbilities(actor: OSEActor) {
  // @ts-expect-error types
  const abilityItems = actor.items.contents.filter((i) => i.type === "ability");
  const abilityIds = abilityItems.map((i) => i.id);
  await actor.deleteEmbeddedDocuments("Item", abilityIds);
}

export async function addAbilitiesToCharacter(actor: Actor, abilities: Item[]) {
  const updateData = abilities.filter((item) => {
    return item !== null && !actor.items.getName(item.name);
  });
  await actor.createEmbeddedDocuments("Item", updateData as Item.CreateData[]);
}

export async function removeClassAbilitiesFromCharacter(
  actor: OSEActor,
  className: string
) {
  const abilityItems = (actor.items.contents as OseItem[]).filter(
    (i) => i.type === "ability"
  );
  const classRegexp = new RegExp(`${className.toLowerCase()}`, "i");
  const abilitiesToRemove = abilityItems.filter((item) => {
    return classRegexp.test(item.system?.requirements?.toLowerCase());
  });
  const abilityIds = abilitiesToRemove.map((i) => i.id);
  await actor.deleteEmbeddedDocuments("Item", abilityIds);
}

export const CLASSES = {
  classic: [
    {
      name: "Cleric",
      abilitiesPack: "classicfantasycompendium.abilities-cleric",
    },
    {
      name: "Dwarf",
      abilitiesPack: "classicfantasycompendium.abilities-dwarf",
    },
    {
      name: "Fighter",
      abilitiesPack: "classicfantasycompendium.abilities-fighter",
    },
    {
      name: "Elf",
      abilitiesPack: "classicfantasycompendium.abilities-elf",
    },
    {
      name: "Magic-User",
      abilitiesPack: "classicfantasycompendium.abilities-magic-user",
    },
    {
      name: "Thief",
      abilitiesPack: "classicfantasycompendium.abilities-thief",
    },
  ],
};

export const ADVANCED_RACES = [
  "Svirfneblin",
  "Half-Orc",
  "Duergar",
  "Drow",
  "Gnome",
  "Dwarf",
  "Halfling",
  "Races",
  "Elf",
  "Half-Elf",
  "Human",
];
