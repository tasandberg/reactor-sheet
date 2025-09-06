import getLabel from "@src/util/getLabel";
import { SheetTabs } from "./SheetTabs";
import ActionsPage from "./ActionsPage";
import InventoryPage from "./InventoryPage";
import Abilities from "./Abilities";
import Spells from "./Spells";

export default function SheetPages() {
  const tabs = [
    {
      label: getLabel("OSE.category.actions"),
      id: "page-actions",
      content: <ActionsPage />,
    },
    {
      label: getLabel("OSE.category.spells"),
      id: "page-spells",
      // disabled: actor.system.spells.enabled || false, TODO: re-enable when classes are added
      content: <Spells />,
    },
    {
      label: getLabel("OSE.category.inventory"),
      id: "page-inventory",
      content: <InventoryPage />,
    },
    {
      label: getLabel("OSE.category.abilities"),
      id: "page-abilities",
      content: <Abilities />,
    },
  ];
  return <SheetTabs tabs={tabs} />;
}
