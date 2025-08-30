declare global {
  interface LenientGlobalVariableTypes {
    game: never;
  }

  class Hooks extends foundry.helpers.Hooks {}
  const fromUuid = foundry.utils.fromUuid;
  const fromUuidSync = foundry.utils.fromUuidSync;
}
