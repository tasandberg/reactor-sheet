import getLabel from "@src/util/getLabel";
import { SheetTabs } from "./SheetTabs";
import ActionsPage from "./ActionsPage";

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
          content: <div>Content for Inventory</div>,
        },
        {
          label: getLabel("OSE.category.abilities"),
          id: "tab3",
          content: <div>Content for Abilities</div>,
        },
      ]}
    />
  );
}
