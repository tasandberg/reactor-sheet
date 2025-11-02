export const OSEConfig = () => ({
  ...CONFIG.OSE,
  ascendingAC: game.settings.get(game.system.id, "ascendingAC"),
  initiative: game.settings.get(game.system.id, "initiative") !== "group",
  encumbrance: game.settings.get(game.system.id, "encumbranceOption"),
  encumbranceStrengthMod:
    game.settings.get(game.system.id, "encumbranceItemStrengthMod") &&
    game.settings.get(game.system.id, "encumbranceOption") === "itembased",
});
