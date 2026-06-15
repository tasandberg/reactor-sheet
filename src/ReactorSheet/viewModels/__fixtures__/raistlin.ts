import type { OSEActor } from "../../types/types";
import OseDataModelCharacterScores from "../../types/data-model-character-scores";
import OseDataModelCharacterAC from "../../types/data-model-character-ac";

// DEX 13 → standard mod +1; mod=1 (e.g. a ring) yields AAC 12 / DAC 7 per the design demo.
const dexMod = 1;

// The constructor's param type wants full BaseScore (incl. derived `mod`), but it only
// reads value/bonus; pass the raw scores and cast to satisfy the declared signature.
const scores = new OseDataModelCharacterScores({
  str: { value: 9, bonus: 0 },
  int: { value: 17, bonus: 0 },
  wis: { value: 12, bonus: 0 },
  dex: { value: 13, bonus: 0 },
  con: { value: 10, bonus: 0 },
  cha: { value: 11, bonus: 0 },
} as unknown as ConstructorParameters<typeof OseDataModelCharacterScores>[0]);

const aac = new OseDataModelCharacterAC(true, [], dexMod, 1);
const ac = new OseDataModelCharacterAC(false, [], dexMod, 1);

// Partial actor: only the fields view-models read. Cast through unknown because the
// real OSEActor is a full Foundry document with methods we don't exercise in unit tests.
export const raistlin = {
  name: "Raistlin Majere",
  img: "",
  system: {
    aac,
    ac,
    scores,
    details: {
      alignment: "Neutral",
      class: "Magic-User",
      biography: "",
      level: 3,
      notes: "",
      title: "Conjurer",
      xp: { bonus: 0, value: 6420, next: 10000, share: 100 },
    },
    movement: { base: 120, encounter: 40, overland: 24 },
    hp: { value: 8, max: 9, hd: "3d4" },
  },
} as unknown as OSEActor;
