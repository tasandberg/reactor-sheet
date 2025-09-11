import Abilities from "../SheetPages/Abilities";
import Actions from "../SheetPages/Actions";
import InventoryPage from "../SheetPages/InventoryPage";
import Spells from "../SheetPages/Spells";

export enum TabIds {
  ACTIONS = "page-actions",
  SPELLS = "page-spells",
  INVENTORY = "page-inventory",
  ABILITIES = "page-abilities",
}

export type TabDef = {
  icon: string;
  label: string;
  Content: React.ComponentType;
  id: TabIds;
  disabled?: boolean;
};

export const tabs: TabDef[] = [
  {
    icon: "fas fa-axe-battle",
    label: "OSE.category.actions",
    Content: Actions,
    id: TabIds.ACTIONS,
  },
  {
    icon: "fas fa-list",
    label: "OSE.category.inventory",
    Content: InventoryPage,
    id: TabIds.INVENTORY,
  },
  {
    icon: "fas fa-bolt",
    label: "OSE.category.spells",
    Content: Spells,
    id: TabIds.SPELLS,
  },
  {
    icon: "fas fa-user-gear",
    label: "OSE.category.abilities",
    Content: Abilities,
    id: TabIds.ABILITIES,
  },
];
