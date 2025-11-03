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
      icon: "fas fa-axe-battle",
      label: "OSE.category.actions",
      Content: Actions,
      id: TabIds.ACTIONS,
    },
    {
      icon: "fas fa-treasure-chest",
      label: "OSE.category.inventory",
      Content: InventoryPage,
      id: TabIds.INVENTORY,
    },
    {
      icon: "fas fa-bolt",
      label: "OSE.category.spells",
      Content: Spells,
      id: TabIds.SPELLS,
      disabled: !actor.system.spells.enabled,
    },
    {
      icon: "fas fa-user-gear",
      label: "OSE.category.abilities",
      Content: Abilities,
      id: TabIds.ABILITIES,
    },
    {
      icon: "fa-regular fa-file",
      label: "OSE.category.notes",
      Content: Notes,
      id: TabIds.NOTES,
    },
  ] as TabDef[];
