import getLabel from "@src/util/getLabel";
import { SheetTabs } from "./SheetTabs";
import ActionsPage from "./ActionsPage";
import InventoryPage from "./InventoryPage";
import Abilities from "./Abilities";

export default function SheetPages() {
  return (
    <SheetTabs
      tabs={[
        {
          label: getLabel("OSE.category.actions"),
          id: "tab1",
          content: <ActionsPage />,
        },
        {
          label: getLabel("OSE.category.inventory"),
          id: "tab2",
          content: <InventoryPage />,
        },
        {
          label: getLabel("OSE.category.abilities"),
          id: "tab3",
          content: <Abilities />,
        },
      ]}
    />
  );
}
