import type { OseItem } from "@src/ReactorSheet/types/types";
import clsx from "clsx";

export default function EquipButton({ item }: { item: OseItem }) {
  const handleEquip = async (item: OseItem) => {
    await item.update({
      system: { equipped: !item.system.equipped, containerId: "" },
    });
  };

  return Object.prototype.hasOwnProperty.call(item.system, "equipped") ? (
    <i
      className={clsx("fa-hand", {
        fas: item.system.equipped,
        far: !item.system.equipped,
      })}
      role="button"
      style={{ opacity: item.system.equipped ? 1 : 0.5 }}
      onClick={() => handleEquip(item)}
    />
  ) : null;
}
