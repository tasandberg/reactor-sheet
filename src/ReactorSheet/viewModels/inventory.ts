import type { OSEActor, OseItem } from "../types/types";
import type { InventoryVM, InventoryGroup, InventoryItemVM, EncumbranceVM, CoinVM } from "./types";

const COIN_DENOMS = ["pp", "gp", "ep", "sp", "cp"] as const;

/** Coin denomination of a treasure item: handles "GP" (actor) and "[01.00] Gold (gp)" (pack). */
export function coinDenom(name: string): string | null {
  return (
    name.match(/\((pp|gp|ep|sp|cp)\)/i)?.[1]?.toLowerCase() ??
    name.match(/^\s*(pp|gp|ep|sp|cp)\s*$/i)?.[1]?.toLowerCase() ??
    null
  );
}

/** The coins the actor holds, in canonical pp→cp order, with their current quantities. */
export function selectCoins(items: OseItem[]): CoinVM[] {
  const byDenom = new Map<string, OseItem>();
  for (const it of items) {
    if (!it.system?.treasure) continue;
    const d = coinDenom(it.name as string);
    if (d && !byDenom.has(d)) byDenom.set(d, it);
  }
  return COIN_DENOMS.flatMap((d) => {
    const it = byDenom.get(d);
    return it ? [{ denom: d.toUpperCase(), id: it._id as string, value: it.system.quantity?.value ?? 0 }] : [];
  });
}

const GROUPS: { key: string; label: string; types: string[] }[] = [
  { key: "weapons", label: "Weapons", types: ["weapon"] },
  { key: "armour", label: "Armour & Wards", types: ["armor"] },
  { key: "gear", label: "Gear", types: ["item", "treasure"] },
];

/** 2-letter card monogram: first letters of the first two words, else first two chars. */
function monogram(name: string): string {
  const words = name.match(/[A-Za-z]+/g) ?? [];
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function weaponMeta(item: OseItem): string {
  const s = item.system as { damage?: string; melee?: boolean; missile?: boolean };
  const modes = [s.melee && "melee", s.missile && "missile"].filter(Boolean).join(", ");
  return [s.damage, modes].filter(Boolean).join(" · ");
}

function isCurrency(item: OseItem): boolean {
  return (item.system.tags ?? []).some((t) => t.value === "Currency");
}

function toVM(item: OseItem): InventoryItemVM {
  const s = item.system;
  const q = s.quantity;
  const hasQty = !!q && (q.value > 1 || (q.max ?? 0) > 1);
  return {
    id: item._id as string,
    name: item.name as string,
    img: item.img,
    meta: item.type === "weapon" ? weaponMeta(item) : "",
    monogram: monogram(item.name as string),
    weight: s.cumulativeWeight ?? s.weight ?? 0,
    equipped: "equipped" in s ? !!s.equipped : null,
    quantity: hasQty ? { value: q.value, max: q.max || q.value } : null,
  };
}

/** Equipment grouped for the inventory tab. Currency (coins) is handled separately. */
export function selectInventory(items: OseItem[]): InventoryVM {
  const groups: InventoryGroup[] = GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    // Coins (currency-tagged or pp/gp/ep/sp/cp) live in the Coin editor, not the item list.
    items: items
      .filter((it) => g.types.includes(it.type) && !isCurrency(it) && !coinDenom(it.name as string))
      .map(toVM),
  })).filter((g) => g.items.length > 0);
  return { groups, count: groups.reduce((n, g) => n + g.items.length, 0) };
}

const STEPS: { upto: number; status: string }[] = [
  { upto: 0.5, status: "Unencumbered" },
  { upto: 0.75, status: "Lightly encumbered" },
  { upto: 1, status: "Heavily encumbered" },
];

export function selectEncumbrance(actor: OSEActor): EncumbranceVM {
  const e = actor.system.encumbrance;
  const move = actor.system.movement?.base ?? 0;
  const pct = e.max > 0 ? Math.min(1, e.value / e.max) : 0;
  const status = e.value > e.max ? "Overloaded" : (STEPS.find((s) => pct <= s.upto)?.status ?? "Unencumbered");
  return { enabled: e.enabled, value: e.value, max: e.max, pct, status, move };
}
