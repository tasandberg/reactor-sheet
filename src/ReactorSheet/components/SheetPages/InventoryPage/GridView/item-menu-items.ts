import { showDeleteDialog } from "@src/ReactorSheet/components/shared/foundryDialogs";
import type { OseItem } from "@src/ReactorSheet/types/types";

export default function itemMenuItems(item: OseItem) {
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
        showDeleteDialog(item);
      },
    },
  ];
}
