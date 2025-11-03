import type { OseItem } from "@src/ReactorSheet/types/types";

export function showDeleteDialog(item: OseItem) {
  foundry.applications.api.DialogV2.confirm({
    window: {
      title: game.i18n.localize("OSE.dialog.deleteItem"),
    },
    content: game.i18n.format("OSE.dialog.confirmDeleteItem", {
      name: item.name,
    }),
    yes: {
      default: false,
      callback: () => {
        item.delete();
      },
    },
    defaultYes: false,
  });
}

export async function showFormDialog() {
  const guess = await foundry.applications.api.DialogV2.prompt({
    window: {
      title: "Enter your guess",
    },
    content: "Please enter your guess below:",
    label: "Submit Guess",
    cancelLabel: "Cancel",
    input: {
      type: "text",
      placeholder: "Your guess here",
    },
  });

  console.log(guess);
}
