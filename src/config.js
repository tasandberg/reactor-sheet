import { APP_ID } from "./constants";
import { CLASSIC_FANTASY_CLASSES } from "./lib/ose-classic-classes";
import { OSE_MODES } from "./lib/ose-compendiums";

export function setupConfig() {
  game.settings.register(APP_ID, "oseRuleSet", {
    name: "OSE Rule Set",
    hint: "Use Advanced Fantasy rules for this character sheet.",
    scope: "world",
    config: true,
    default: OSE_MODES.CLASSIC,
    requiresReload: true,
    type: String,
    choices: {
      [OSE_MODES.CLASSIC]: "Classic",
      [OSE_MODES.ADVANCED]: "Advanced Fantasy",
    },
  });

  CONFIG.OSE.classes = {
    classic: CLASSIC_FANTASY_CLASSES,
  };
}
