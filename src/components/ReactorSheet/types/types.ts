import type OseDataModelCharacterScores from "./data-model-character-scores";

export type ReactorSheetAppProps = {
  actor?: OSEActor;
  source?: OSEActor;
};

export type OSEActor = Actor & {
  img: string;
  system: {
    details: {
      biography: string;
      notes: string;
    };
    scores: OseDataModelCharacterScores;
    hp: {
      value: number;
      max: number;
      hd: string;
    };
  };
};
