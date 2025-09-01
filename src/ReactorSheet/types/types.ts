import type ContextConnector from "@src/applications/context-connector";
import type OseDataModelCharacterAC from "./data-model-character-ac";
import type OseDataModelCharacterScores from "./data-model-character-scores";

// Add props as needed
export type ReactorContext = {
  document: OSEActor;
};

export type ReactorSheetAppProps = {
  actor?: OSEActor;
  source?: OSEActor;
  contextConnector: ContextConnector<ReactorContext>;
};

// Define the shape of your context value here
export interface ReactorSheetContextValue {
  actor: OSEActor;
  source: OSEActor;
  items: OseItem[];
}

export type OSESave = "breath" | "death" | "paralysis" | "spell" | "wand";

export type OSEActor = Actor & {
  img: string;
  name: string;
  items: Actor["items"] | OseItem[];
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
    saves: Record<OSESave, number>;
  };
  targetAttack: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    roll: { [key: string]: any },
    type: "melee" | "missile",
    options: {
      type: "melee" | "missile";
      skipDialog?: boolean;
    }
  ) => void;
  rollCheck: (
    score: string,
    { event }: { event?: Event; fastForward?: boolean }
  ) => void;
  rollSave: (
    save: OSESave,
    options: { event?: Event; fastForward?: boolean; chatMessage?: string }
  ) => void;
};

export type OseItem = Omit<Item, "type"> & {
  type: string;
};

export type OseWeapon = OseItem & {
  system: {
    damage: string;
    qualities: { label: string; value: string; icon: string }[];
    description: string;
    melee: boolean;
    missile: boolean;
  };
  bonus: number;
};
