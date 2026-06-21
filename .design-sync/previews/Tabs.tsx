import * as React from "react";
import { Tabs } from "reactor-sheet";

export const SheetTabs = () => {
  const [active, setActive] = React.useState("actions");
  return (
    <Tabs
      active={active}
      onSelect={setActive}
      tabs={[
        { id: "actions", label: "Actions" },
        { id: "inventory", label: "Inventory", count: 15 },
        { id: "spells", label: "Spells", count: 3 },
        { id: "abilities", label: "Abilities" },
        { id: "notes", label: "Notes" },
      ]}
    />
  );
};
