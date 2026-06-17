import type { OSEActor, OseItem } from "../types/types";
import type { InventorySortKey, InventoryVM, InventoryItemVM, EncumbranceVM, CoinVM } from "./types";

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

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

const CATEGORY: Record<string, { label: string; rank: number }> = {
  weapon:    { label: "Weapon",    rank: 0 },
  armor:     { label: "Armour",    rank: 1 },
  item:      { label: "Gear",      rank: 2 },
  treasure:  { label: "Gear",      rank: 2 },
  container: { label: "Container", rank: 3 },
};

function categoryFor(type: string): { label: string; rank: number } {
  return CATEGORY[type] ?? { label: "Gear", rank: 2 };
}

// ---------------------------------------------------------------------------
// Item → VM helpers
// ---------------------------------------------------------------------------

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
  return (item.system.tags ?? []).some((t: { value: string }) => t.value === "Currency");
}

function toVM(item: OseItem, children: InventoryItemVM[] = []): InventoryItemVM {
  const s = item.system;
  const q = s.quantity;
  const hasQty = !!q && (q.value > 1 || (q.max ?? 0) > 1);
  const cat = categoryFor(item.type as string);
  return {
    id: item._id as string,
    name: item.name as string,
    img: item.img,
    category: cat.label,
    categoryRank: cat.rank,
    meta: item.type === "weapon" ? weaponMeta(item) : "",
    monogram: monogram(item.name as string),
    weight: s.cumulativeWeight ?? s.weight ?? 0,
    sort: (item as unknown as { sort?: number }).sort ?? 0,
    equipped: "equipped" in s ? !!s.equipped : null,
    quantity: hasQty ? { value: q.value, max: q.max || q.value } : null,
    isContainer: item.type === "container",
    children,
  };
}

// ---------------------------------------------------------------------------
// selectInventory
// ---------------------------------------------------------------------------

/** Equipment list for the inventory tab. Coins stay in the coin editor. */
export function selectInventory(items: OseItem[]): InventoryVM {
  // Exclude coins
  const eligible = items.filter(
    (it) => !isCurrency(it) && !coinDenom(it.name as string),
  );

  // Index by id for O(1) child lookups
  const byId = new Map<string, OseItem>(eligible.map((it) => [it._id as string, it]));

  // Partition: children (have a containerId pointing to a known container) vs top-level
  const childrenByContainer = new Map<string, OseItem[]>();
  const topLevel: OseItem[] = [];

  for (const it of eligible) {
    const cid: string | undefined = (it.system as { containerId?: string }).containerId;
    if (cid && byId.has(cid)) {
      const bucket = childrenByContainer.get(cid) ?? [];
      bucket.push(it);
      childrenByContainer.set(cid, bucket);
    } else {
      topLevel.push(it);
    }
  }

  // Build VM nodes, sorting children by sort index
  function buildVM(item: OseItem): InventoryItemVM {
    const rawChildren = childrenByContainer.get(item._id as string) ?? [];
    rawChildren.sort((a, b) => ((a as unknown as { sort?: number }).sort ?? 0) - ((b as unknown as { sort?: number }).sort ?? 0));
    return toVM(item, rawChildren.map(buildVM));
  }

  const vmItems = topLevel.map(buildVM);

  // count = all items in the tree
  function countAll(list: InventoryItemVM[]): number {
    return list.reduce((n, it) => n + 1 + countAll(it.children), 0);
  }

  // Legacy groups for grid view compatibility
  const GROUPS = [
    { key: "weapons", label: "Weapons",      types: ["weapon"] },
    { key: "armour",  label: "Armour & Wards", types: ["armor"] },
    { key: "gear",    label: "Gear",          types: ["item", "treasure"] },
  ];
  const groups = GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    items: vmItems.filter((it) => g.types.includes(it.category.toLowerCase()) || (g.key === "gear" && it.categoryRank === 2)),
  })).filter((g) => g.items.length > 0);

  return { items: vmItems, count: countAll(vmItems), groups };
}

// ---------------------------------------------------------------------------
// sortInventory
// ---------------------------------------------------------------------------

/** Pure sort — returns a new array, recurses into children. */
export function sortInventory(list: InventoryItemVM[], key: InventorySortKey): InventoryItemVM[] {
  const sorted = [...list].sort((a, b) => {
    switch (key) {
      case "category":
        if (a.categoryRank !== b.categoryRank) return a.categoryRank - b.categoryRank;
        if (a.sort !== b.sort) return a.sort - b.sort;
        return a.name.localeCompare(b.name);
      case "name":
        return a.name.localeCompare(b.name);
      case "weight":
        return b.weight - a.weight; // descending
    }
  });
  return sorted.map((it) =>
    it.children.length > 0 ? { ...it, children: sortInventory(it.children, key) } : it,
  );
}

// ---------------------------------------------------------------------------
// Encumbrance
// ---------------------------------------------------------------------------

const STEPS: { upto: number; status: string }[] = [
  { upto: 0.5,  status: "Unencumbered" },
  { upto: 0.75, status: "Lightly encumbered" },
  { upto: 1,    status: "Heavily encumbered" },
];

export function selectEncumbrance(actor: OSEActor): EncumbranceVM {
  const e = actor.system.encumbrance;
  const move = actor.system.movement?.base ?? 0;
  const pct = e.max > 0 ? Math.min(1, e.value / e.max) : 0;
  const status = e.value > e.max ? "Overloaded" : (STEPS.find((s) => pct <= s.upto)?.status ?? "Unencumbered");
  return { enabled: e.enabled, value: e.value, max: e.max, pct, status, move };
}
