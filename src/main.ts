import Peekaboo from "./applications/my-react-component";
import { ReactApplicationV2 } from "foundry-vtt-react-application";
import ReactorSheet from "./applications/reactor-sheet";
import logger from "./util/logger";

export function initialize() {
  Hooks.once("init", () => {
    logger("Foundry React Module | Initializing module");
    globalThis.testApp = new ReactApplicationV2({
      reactApp: Peekaboo,
      initialProps: { data: "example" },
      window: { title: "My React App" },
      position: { width: 300, height: 200 },
    });
  });

  Hooks.once("ready", async () => {
    logger("Foundry React Module | Initializing React application");
    foundry.documents.collections.Actors.registerSheet(game.system?.id, ReactorSheet, {
      types: ["character", "npc"],
      makeDefault: true,
      label: "Re-Actor Character Sheet",
    });

    globalThis.testApp.render(true);
  });
}

initialize();
