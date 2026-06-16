import type { OSEActor } from "@src/ReactorSheet/types/types";
import Abilities from "../SheetPages/Abilities";
import Actions from "../SheetPages/Actions";
import InventoryPage from "../SheetPages/InventoryPage";
import Spells from "../SheetPages/Spells";
import Notes from "../SheetPages/Notes";

export enum TabIds {
  ACTIONS = "page-actions",
  SPELLS = "page-spells",
  INVENTORY = "page-inventory",
  ABILITIES = "page-abilities",
  NOTES = "page-notes",
}

export type TabDef = {
  icon: string;
  label: string;
  Content: React.ComponentType;
  id: TabIds;
  disabled?: boolean;
};

export const tabs = (actor: OSEActor) =>
  [
    {
      icon: "◈",
      label: "OSE.category.actions",
      Content: Actions,
      id: TabIds.ACTIONS,
    },
    {
      icon: "▤",
      label: "OSE.category.inventory",
      Content: InventoryPage,
      id: TabIds.INVENTORY,
    },
    {
      icon: "✦",
      label: "OSE.category.spells",
      Content: Spells,
      id: TabIds.SPELLS,
      disabled: !actor.system.spells.enabled,
    },
    {
      icon: "❖",
      label: "OSE.category.abilities",
      Content: Abilities,
      id: TabIds.ABILITIES,
    },
    {
      icon: "✎",
      label: "OSE.category.notes",
      Content: Notes,
      id: TabIds.NOTES,
    },
  ] as TabDef[];
