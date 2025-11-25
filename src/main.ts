import ReactorSheet from "./applications/reactor-sheet";
import { setupConfig } from "./config";
import logger from "./util/logger";

export function initialize() {
  foundry.helpers.Hooks.once("init", () => {
    logger("Foundry React Module | Initializing module");
    setupConfig();
  });

  foundry.helpers.Hooks.once("ready", async () => {
    logger("Foundry React Module | Initializing React application");
    foundry.documents.collections.Actors.registerSheet(
      game.system?.id,
      ReactorSheet,
      {
        types: ["character", "npc"],
        makeDefault: true,
        label: "Re-Actor Character Sheet",
      }
    );
  });
}

initialize();
