import type { OseItem } from "@src/ReactorSheet/types/types";
import clsx from "clsx";
import { useState } from "react";

export default function EquipButton({ item }: { item: OseItem }) {
  const [loading, setLoading] = useState(false);
  const handleEquip = async (item: OseItem) => {
    setLoading(true);
    await item.update({
      system: { equipped: !item.system.equipped, containerId: "" },
      sort: 1000,
    });
    setLoading(false);
  };

  return Object.prototype.hasOwnProperty.call(item.system, "equipped") ? (
    <i
      className={clsx({
        "fas fa-hand": !loading && item.system.equipped,
        "far fa-hand": !loading && !item.system.equipped,
        "fas fa-spinner fa-spin": loading,
      })}
      role="button"
      style={{ opacity: item.system.equipped ? 1 : 0.5, zIndex: 100 }}
      onClick={() => handleEquip(item)}
    />
  ) : null;
}
