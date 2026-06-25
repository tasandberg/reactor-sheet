import type { OSEActor, OseItem } from "../types/types";
import type { WealthMovementVM } from "./types";

const COIN_ORDER = ["GP", "SP", "CP", "PP", "EP"];

export function selectWealthMovement(actor: OSEActor): WealthMovementVM {
  const treasures = Object.values(actor.system.treasures);
  const coins = COIN_ORDER.map((name) => treasures.find((t) => t.name === name))
    .filter((t): t is OseItem => !!t)
    .map((t) => ({ name: t.name as string, img: t.img, qty: t.system.quantity.value }));
  const m = actor.system.movement;
  return { coins, move: { encounter: m.encounter, explore: m.base, travel: m.overland } };
}
