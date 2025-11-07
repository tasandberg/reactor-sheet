import { showDeleteDialog } from "@src/ReactorSheet/components/shared/foundryDialogs";
import type { OseItem } from "@src/ReactorSheet/types/types";

export default function itemMenuItems(item: OseItem) {
  async function deleteContainerItems(item: OseItem) {
    if (item.type !== "container") return;
    const containedItems = item.system?.contents || [];
    const updateData = containedItems.map((i: OseItem) => ({
      _id: i.id,
      "system.containerId": "",
    }));
    await item.parent?.updateEmbeddedDocuments(
      "Item",
      updateData as Item.UpdateData[]
    );
    item.delete();
  }
  return [
    {
      name: "View Item",
      icon: "fas fa-eye",
      callback: () => {
        item.sheet.render(true);
      },
    },
    {
      name: "Send Item",
      icon: "fas fa-gift",
      callback: () => {
        alert("Send Item not implemented yet");
      },
    },
    {
      name: "Delete Item",
      icon: "fas fa-trash",
      callback: () => {
        const callBack =
          item.type === "container"
            ? () => deleteContainerItems(item)
            : undefined;
        showDeleteDialog(item, callBack);
      },
    },
  ];
}
