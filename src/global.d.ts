declare global {
  interface LenientGlobalVariableTypes {
    game: never;
    canvas: never;
  }

  class Hooks extends foundry.helpers.Hooks {}
  const fromUuid = foundry.utils.fromUuid;
  const fromUuidSync = foundry.utils.fromUuidSync;
}

declare interface CONFIG extends foundry.config {
  OSE: {
    classes: {
      classic: Record<string, OseClass>;
    };
  };
}
