import type ContextConnector from "@src/applications/context-connector";
import type OseDataModelCharacterAC from "./data-model-character-ac";
import type OseDataModelCharacterScores from "./data-model-character-scores";
import type { TabIds } from "../components/shared/tabs";

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
  actorData: OSEActor["_source"]["system"];
  currentTab: TabIds;
  setCurrentTab: (tabId: TabIds) => void;
  updateActor: (updateData: {
    [key: string]: string | number;
  }) => Promise<OSEActor | void>;
}

export type OSESave = "breath" | "death" | "paralysis" | "spell" | "wand";

export type OseSpellList = Record<number, OseSpell[]>;

export type OSEActor = Actor & {
  img: string;
  name: string;
  items: Actor["items"] | OseItem[] | { contents: OseItem[] };
  updatedAt?: string;
  system: {
    aac: OseDataModelCharacterAC;
    ac: OseDataModelCharacterAC;
    details: {
      alignment: string;
      class: string;
      biography: string;
      level: number;
      notes: string;
      title: string;
      xp: {
        bonus: number;
        value: number;
        next: number;
        share: number;
      };
    };
    encumbrance: {
      variant: string;
      value: number;
      max: number;
      enabled: boolean;
    };
    exploration: {
      ft: number;
      ld: number;
      od: number;
      sd: number;
    };
    movement: {
      base: number;
      encounter: number;
      overland: number;
    };
    spells: {
      spellList: OseSpellList;
      slots: { [n: number]: { used: number; max: number } };
      enabled: boolean;
    };
    scores: OseDataModelCharacterScores;
    abilities: Record<string, OseItem>;
    treasures: Record<string, OseItem>;
    hp: {
      value: number;
      max: number;
      hd: string;
    };
    saves: Record<OSESave, number>;
    updatedAt?: string;
    weapons: OseWeapon[];
  };
  _source: OSEActor;
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
    {
      event,
    }: {
      event?: Event | React.MouseEvent<HTMLElement | SVGTextElement>;
      fastForward?: boolean;
    }
  ) => void;
  rollExploration: (
    action: string,
    options: { event?: Event; fastForward?: boolean; chatMessage?: string }
  ) => void;
  rollSave: (
    save: OSESave,
    options: { event?: Event; fastForward?: boolean; chatMessage?: string }
  ) => void;
  update: (updateData: { [key: string]: string | number }) => Promise<OSEActor>;
};

export type OseItem = Omit<Item, "type"> & {
  type: string;
  system: {
    quantity: {
      value: number;
      max: number;
    };
    cost: number;
    cumulativeCost: number;
    cumulativeWeight: number;
    equipped?: boolean;
    tags?: { label: string; value: string; icon: string }[];
  };
  update: (updateData: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: string | number | Record<any, any>;
  }) => Promise<OSEActor>;
};

export type OseWeapon = OseItem & {
  system: {
    damage: string;
    qualities: { label: string; value: string; icon: string }[];
    description: string;
    melee: boolean;
    missile: boolean;
    equipped: boolean;
  };
  bonus: number;
};

export type OseAbility = OseItem & {
  system: {
    requirements?: string;
  };
};

export type OseSpell = OseItem & {
  system: {
    lvl: number;
    range: string;
    duration: string;
    save: string;
    memorized: number;
    cast: number;
  };
};
