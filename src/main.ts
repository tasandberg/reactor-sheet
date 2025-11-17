import ReactorSheet from "./applications/reactor-sheet";
import logger from "./util/logger";

export function initialize() {
  Hooks.once("init", () => {
    logger("Foundry React Module | Initializing module");
  });

  Hooks.once("ready", async () => {
    logger("Foundry React Module | Initializing React application");
    foundry.documents.collections.Actors.registerSheet(game.system?.id, ReactorSheet, {
      types: ["character", "npc"],
      makeDefault: true,
      label: "Re-Actor Character Sheet",
    });
  });
}

initialize();
