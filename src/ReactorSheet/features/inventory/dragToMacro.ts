// Build the Foundry drag payload for an owned item so dropping a row onto the
// macro hotbar creates an item macro — exactly like the stock OSE actor sheet.
//
// Flow once dropped: OSE's `hotbarDrop` hook (already registered by the system) →
// `createOseMacro` → a script macro running `game.ose.rollItemMacro(name)` →
// `item.roll()` → the weapon-attack dialog. We just need to write OSE's drag-data
// shape to `text/plain`; we register no hook of our own.
import type { OSEActor, OseItem } from "@domain/types";

/** Serialized `text/plain` payload mirroring OSE's actor-sheet `_onDragStart`, so
 *  the hotbar (and any other drop target — another sheet, the canvas) treats a
 *  dragged reactor-sheet item identically to one from the stock sheet. */
export function buildItemMacroDragData(actor: OSEActor, item: OseItem): string {
  // toDragData() → { type:"Item", uuid:"Actor.<id>.Item.<id>" } for owned items.
  // createOseMacro keys off `uuid` (must contain "Item.") and reads name/img off `item`.
  const dragData = item.toDragData() as Record<string, unknown>;
  dragData.item = item;
  dragData.type = "Item";
  dragData.actorId = actor.id;
  // Token actor: carry its scene/token for parity. rollItemMacro re-resolves the
  // actor from the chat speaker at roll time, so these are non-critical extras.
  dragData.sceneId = actor.isToken ? (actor.token?.parent?.id ?? null) : null;
  dragData.tokenId = actor.isToken ? (actor.token?.id ?? null) : null;
  dragData.pack = actor.pack ?? null;
  return JSON.stringify(dragData);
}
