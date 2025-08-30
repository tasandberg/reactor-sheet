import type OseDataModelCharacterAC from "./data-model-character-ac";
import type OseDataModelCharacterScores from "./data-model-character-scores";

export type ReactorSheetAppProps = {
  actor?: OSEActor;
  source?: OSEActor;
};

export type OSEActor = Actor & {
  img: string;
  name: string;
  system: {
    aac: OseDataModelCharacterAC;
    ac: OseDataModelCharacterAC;
    details: {
      biography: string;
      notes: string;
      title: string;
      alignment: string;
      class: string;
      level: number;
      xp: {
        bonus: number;
        value: number;
        next: number;
        share: number;
      };
    };
    scores: OseDataModelCharacterScores;
    hp: {
      value: number;
      max: number;
      hd: string;
    };
  };
};
