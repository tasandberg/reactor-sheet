import ReactorSheet from "./applications/reactor-sheet";
import { installAdvancedClasses } from "./util/adaptAdvancedClasses";
import logger from "./util/logger";

export function initialize() {
  foundry.helpers.Hooks.once("init", () => {
    logger("Initializing module");
    ReactorSheet.registerSettings();
  });

  foundry.helpers.Hooks.once("ready", async () => {
    logger("Initializing React application");
    installAdvancedClasses();
    foundry.documents.collections.Actors.registerSheet(
      game.system?.id,
      ReactorSheet,
      {
        types: ["character", "npc"],
        makeDefault: true,
        label: "Re-Actor Character Sheet",
      },
    );
  });
}

initialize();
