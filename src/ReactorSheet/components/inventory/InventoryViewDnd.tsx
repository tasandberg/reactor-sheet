// Inventory list — drag & drop on native HTML5 DnD via useDragReorder.
// Behaviour: rows DON'T rearrange live under the cursor — a CSS insertion line
// (drop-before/after, painted on the hovered row's edge) shows where the drop
// lands, and the reorder commits once on drop. This avoids the per-frame reflow
// of a live-sortable. Dragging an item onto a container nests it; a root zone at
// the bottom moves a nested item back out. The previous @dnd-kit/core
// implementation lives in ./InventoryView.tsx and is left intact for comparison.
//
// Row layout (left→right): drag handle · item image · name (+qty) with tags beneath
// · equip checkbox · type · damage · qty · weight.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  InventoryVM,
  EncumbranceVM,
  InventoryItemVM,
  CoinVM,
  InventorySortKey,
  SortDir,
} from "../../viewModels/types";
import { sortInventory, SORT_DEFAULT_DIR } from "../../viewModels/inventory";
import { useDragReorder } from "./useDragReorder";
import { SectionTitle } from "../ui/SectionTitle";
import { Tag } from "../ui/Tag";
import { cx } from "../ui/cx";

type Dnd = ReturnType<typeof useDragReorder>;

type Ops = {
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onSetQty: (id: string, value: number) => void;
  onReorder: (updates: { id: string; sort: number }[]) => void;
  onNest: (itemId: string, containerId: string | null) => void;
};

/** Right-click context-menu target: which item, and where to anchor the menu. */
type MenuState = { item: InventoryItemVM; x: number; y: number };
type OnContext = (e: React.MouseEvent, item: InventoryItemVM) => void;

type Props = {
  inventory: InventoryVM;
  encumbrance: EncumbranceVM;
  coins: CoinVM[];
  onSetCoin: (id: string, value: number) => void;
} & Ops;

type SortState = { key: InventorySortKey; dir: SortDir };
type Groups = Record<string, string[]>;

const ROOT = "root";
const gkey = (containerId: string) => `c:${containerId}`;
const groupContainerId = (key: string) => (key === ROOT ? null : key.slice(2));

const weightLabel = (w: number) => (w > 0 ? `${w} cn` : "—");

// "N items · X cn" — count + total weight, used by both section headers.
function flattenItems(list: InventoryItemVM[]): InventoryItemVM[] {
  return list.flatMap((it) => [it, ...flattenItems(it.children)]);
}
function sectionCountLabel(items: InventoryItemVM[]): string {
  const all = flattenItems(items);
  const cn = all.reduce((s, it) => s + (it.weight || 0), 0);
  return `${all.length} ${all.length === 1 ? "item" : "items"} · ${cn} cn`;
}

// ---------------------------------------------------------------------------
// Groups <-> VM
// ---------------------------------------------------------------------------

function indexById(items: InventoryItemVM[]): Map<string, InventoryItemVM> {
  const m = new Map<string, InventoryItemVM>();
  for (const it of items) {
    m.set(it.id, it);
    for (const ch of it.children) m.set(ch.id, ch);
  }
  return m;
}

function buildGroups(items: InventoryItemVM[], sort: SortState): Groups {
  const sorted = sortInventory(items, sort.key, sort.dir);
  const groups: Groups = { [ROOT]: [] };
  for (const it of sorted) {
    groups[ROOT].push(it.id);
    if (it.isContainer) groups[gkey(it.id)] = sortInventory(it.children, sort.key, sort.dir).map((c) => c.id);
  }
  return groups;
}

function originContainers(items: InventoryItemVM[]): Map<string, string | null> {
  const m = new Map<string, string | null>();
  for (const it of items) {
    m.set(it.id, null);
    for (const ch of it.children) m.set(ch.id, it.id);
  }
  return m;
}

// ---------------------------------------------------------------------------
// Row pieces
// ---------------------------------------------------------------------------

function ItemImage({ item }: { item: InventoryItemVM }) {
  return (
    <span className="rs-inv-img" aria-hidden="true">
      {item.img ? <img src={item.img} alt="" /> : <span className="mono">{item.monogram}</span>}
    </span>
  );
}

// Equip toggle: outlined hand = unequipped, filled hand = equipped.
function RowEquip({ item, onEquip }: { item: InventoryItemVM; onEquip: (id: string) => void }) {
  if (item.equipped === null) return <span className="rs-inv-equip-spacer" aria-hidden="true" />;
  return (
    <button
      type="button"
      className={cx("rs-inv-equip", item.equipped && "is-on")}
      aria-pressed={item.equipped}
      aria-label={item.equipped ? "Unequip" : "Equip"}
      onClick={() => onEquip(item.id)}
    >
      <i className={cx(item.equipped ? "fa-solid" : "fa-regular", "fa-hand")} aria-hidden="true" />
    </button>
  );
}

function RowTags({ tags }: { tags: InventoryItemVM["tags"] }) {
  if (!tags.length) return null;
  return (
    <span className="rs-inv-tags">
      {tags.map((t) => (
        <Tag key={t.label} className="rs-inv-tag">
          {t.icon && <i className={t.icon} aria-hidden="true" />}
          {t.label}
        </Tag>
      ))}
    </span>
  );
}

/** Name + optional (count/qty) on top, tags beneath. `trailing` sits beside the name button (e.g. a caret). */
function NameCell({
  item,
  onOpen,
  badge,
  trailing,
}: {
  item: InventoryItemVM;
  onOpen: (id: string) => void;
  badge?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="rs-inv-name-c">
      <div className="rs-inv-name-row">
        <button type="button" className="rs-inv-name" onClick={() => onOpen(item.id)}>
          <span className="nm">{item.name}</span>
          {badge}
        </button>
        {trailing}
      </div>
      <RowTags tags={item.tags} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared row body (cols 2–8) — used by the main list AND the equipped table
// ---------------------------------------------------------------------------

// Editable quantity field (col 7) — updates the item; empty when the item isn't a stack.
function QtyField({ item, onSetQty }: { item: InventoryItemVM; onSetQty: (id: string, value: number) => void }) {
  const qty = item.quantity;
  if (!qty) return <span className="rs-inv-qty" />;
  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      className="rs-inv-qtyin"
      defaultValue={qty.value}
      key={qty.value}
      aria-label={`${item.name} quantity`}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      onBlur={(e) => {
        const n = parseInt(e.currentTarget.value, 10);
        if (Number.isNaN(n)) e.currentTarget.value = String(qty.value);
        else if (n !== qty.value) onSetQty(item.id, Math.max(0, n));
      }}
    />
  );
}

function RowInner({ item, onEquip, onOpen, onSetQty }: { item: InventoryItemVM; onEquip: (id: string) => void; onOpen: (id: string) => void; onSetQty: (id: string, value: number) => void }) {
  return (
    <>
      <ItemImage item={item} />
      <NameCell item={item} onOpen={onOpen} />
      <RowEquip item={item} onEquip={onEquip} />
      <span className="rs-inv-rowcat">{item.category}</span>
      <span className="rs-inv-dmg">{item.damage}</span>
      <QtyField item={item} onSetQty={onSetQty} />
      <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sortable item row (main list)
// ---------------------------------------------------------------------------

function SortableRow({
  item,
  index,
  group,
  depth,
  dnd,
  onEquip,
  onOpen,
  onSetQty,
  onContext,
}: {
  item: InventoryItemVM;
  index: number;
  group: string;
  depth: number;
  dnd: Dnd;
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
  onSetQty: (id: string, value: number) => void;
  onContext: OnContext;
}) {
  // No handle: the whole row is draggable. Clicks on the inner buttons/inputs still
  // fire (a click is a press without movement), so name/equip/qty stay interactive.
  return (
    <div
      className={cx("rs-inv-row", "is-sortable", dnd.rowClass(group, index))}
      style={depth > 0 ? ({ "--rs-inv-depth": depth } as React.CSSProperties) : undefined}
      onContextMenu={(e) => onContext(e, item)}
      {...dnd.rowProps(group, index, { ownZone: group, acceptCrossGroup: group === ROOT })}
    >
      <span className="rs-inv-drag" aria-hidden="true">
        <i className="fa-solid fa-grip-lines" />
      </span>
      <RowInner item={item} onEquip={onEquip} onOpen={onOpen} onSetQty={onSetQty} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Container: sortable in root + droppable body (accepts nested items)
// ---------------------------------------------------------------------------

function ContainerRow({
  item,
  index,
  childIds,
  byId,
  collapsed,
  dnd,
  onToggle,
  onEquip,
  onOpen,
  onSetQty,
  onContext,
}: {
  item: InventoryItemVM;
  index: number;
  childIds: string[];
  byId: Map<string, InventoryItemVM>;
  collapsed: boolean;
  dnd: Dnd;
  onToggle: (id: string) => void;
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
  onSetQty: (id: string, value: number) => void;
  onContext: OnContext;
}) {
  const group = gkey(item.id);
  const count = item.children.length;
  // Only collapsed containers accept drop-into; an expanded one drags/drops as a
  // normal root row (fill it by dropping among its visible children instead).
  const isDropTarget = collapsed && dnd.isInto(ROOT, index);
  const caret = (
    <button
      type="button"
      className={cx("rs-inv-collapse", collapsed && "collapsed")}
      aria-label={collapsed ? "Expand" : "Collapse"}
      onClick={() => onToggle(item.id)}
    >
      <i className="fa-solid fa-chevron-down" aria-hidden="true" />
    </button>
  );

  return (
    <div className={cx("rs-inv-container", isDropTarget && "is-drop-target")}>
      {/* The header row reorders among root items AND accepts items dropped onto it (nest). */}
      <div
        className={cx("rs-inv-row", "is-container", "is-sortable", dnd.rowClass(ROOT, index))}
        onContextMenu={(e) => onContext(e, item)}
        {...dnd.rowProps(ROOT, index, { container: collapsed, containerZone: item.id, ownZone: ROOT, acceptCrossGroup: true })}
      >
        <span className="rs-inv-drag" aria-hidden="true">
          <i className="fa-solid fa-grip-lines" />
        </span>
        <ItemImage item={item} />
        <NameCell item={item} onOpen={onOpen} badge={<span className="rs-inv-count">{count}</span>} trailing={caret} />
        <RowEquip item={item} onEquip={onEquip} />
        <span className="rs-inv-rowcat">{item.category}</span>
        <span className="rs-inv-dmg" />
        <span className="rs-inv-qty" />
        <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
      </div>

      <div
        className={cx("rs-inv-children", collapsed && "is-collapsed")}
        // Empty container: its body is the nest target (no sibling rows to hover).
        {...(!collapsed && childIds.length === 0 ? dnd.nestProps(group, index, item.id) : {})}
      >
        {!collapsed &&
          childIds.map((cid, i) => {
            const child = byId.get(cid);
            return child ? (
              <SortableRow key={cid} item={child} index={i} group={group} depth={1} dnd={dnd} onEquip={onEquip} onOpen={onOpen} onSetQty={onSetQty} onContext={onContext} />
            ) : null;
          })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sort header (sorting only)
// ---------------------------------------------------------------------------

function SortHeader({
  col,
  label,
  className,
  sort,
  onSort,
}: {
  col: InventorySortKey;
  label: React.ReactNode;
  className?: string;
  sort: SortState;
  onSort: (key: InventorySortKey) => void;
}) {
  const active = sort.key === col;
  // Cycle is asc → desc → manual; the title makes that discoverable.
  const title = active
    ? sort.dir === SORT_DEFAULT_DIR[col]
      ? "Sorted — click to reverse"
      : "Sorted — click for manual order"
    : "Click to sort";
  return (
    <button
      type="button"
      className={cx("rs-inv-th", className, active && "active")}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      title={title}
      onClick={() => onSort(col)}
    >
      {label}
      <i className={cx("rs-inv-th-caret", "fa-solid", active && (sort.dir === "asc" ? "fa-caret-up" : "fa-caret-down"))} aria-hidden="true" />
    </button>
  );
}

function SortHeaderRow({ sort, onSort }: { sort: SortState; onSort: (key: InventorySortKey) => void }) {
  return (
    <div className="rs-inv-row rs-inv-headrow" role="row">
      <span aria-hidden="true" /> {/* drag */}
      <span aria-hidden="true" /> {/* image */}
      <SortHeader col="name" label="Name" className="rs-inv-th-name" sort={sort} onSort={onSort} />
      <span className="rs-inv-thlabel rs-inv-thlabel-eq">Equip</span>
      <SortHeader col="category" label="Type" className="rs-inv-th-cat" sort={sort} onSort={onSort} />
      <span aria-hidden="true" /> {/* dmg */}
      <span aria-hidden="true" /> {/* qty */}
      <SortHeader col="weight" label="Wt" className="rs-inv-th-wt" sort={sort} onSort={onSort} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coin / encumbrance
// ---------------------------------------------------------------------------

function CoinRow({ coin, onSetCoin }: { coin: CoinVM; onSetCoin: (id: string, value: number) => void }) {
  return (
    <label className="rs-coin">
      <span className="rs-coin-l">{coin.denom}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        className="rs-coin-in"
        defaultValue={coin.value}
        key={coin.value}
        aria-label={`${coin.denom} quantity`}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        onBlur={(e) => {
          const n = parseInt(e.currentTarget.value, 10);
          if (Number.isNaN(n)) e.currentTarget.value = String(coin.value);
          else onSetCoin(coin.id, Math.max(0, n));
        }}
      />
    </label>
  );
}

function EncumbranceBar({ e }: { e: EncumbranceVM }) {
  return (
    <div className="rs-enc">
      <div className="rs-enc-top">
        <span className="rs-enc-l">
          Encumbrance <b>{e.value}</b> / <b>{e.max}</b> cn
        </span>
        <span className="rs-enc-r">
          {e.status} · {e.move}′
        </span>
      </div>
      <div className="rs-enc-track">
        <div className="rs-enc-fill" style={{ width: `${Math.round(e.pct * 100)}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section header (static — title + "N items · X cn")
// ---------------------------------------------------------------------------

function SectionCount({ title, items }: { title: string; items: InventoryItemVM[] }) {
  return (
    <div className="rs-inv-sec-head">
      <span className="rs-inv-sec-title">{title}</span>
      <span className="rs-inv-sec-count">{sectionCountLabel(items)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Equipped tray — dashed-bordered row of large ink-stamp tiles, one per
// equipped item, each with a hover popover. Click a tile to unequip.
// ---------------------------------------------------------------------------

/** Popover detail line: weapon damage, else weight, else the category. */
function equippedDetail(item: InventoryItemVM): string {
  if (item.damage) return item.damage;
  if (item.weight > 0) return weightLabel(item.weight);
  return item.category;
}

function EquippedTray({ items, onOpen, onContext }: { items: InventoryItemVM[]; onOpen: (id: string) => void; onContext: OnContext }) {
  return (
    <div className="rs-equip-tray">
      {items.map((item) => (
        <div key={item.id} className="rs-equip-tcard" onContextMenu={(e) => onContext(e, item)}>
          <button type="button" className="rs-equip-tt" onClick={() => onOpen(item.id)} aria-label={item.name} title={item.name}>
            {item.img ? <img src={item.img} alt="" /> : <span className="rs-equip-tt-ic">{item.monogram}</span>}
          </button>
          <span className="rs-equip-tt-pop" role="tooltip">
            <span className="rs-equip-tt-pop-nm">{item.name}</span>
            <span className="rs-equip-tt-pop-meta">
              <span className="rs-equip-tt-pop-type">{item.category}</span>
              <span className="rs-equip-tt-pop-dot">·</span>
              <span className="rs-equip-tt-pop-detail">{equippedDetail(item)}</span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right-click context menu
// ---------------------------------------------------------------------------

function ItemContextMenu({
  menu,
  onClose,
  onOpen,
  onEquip,
  onDelete,
}: {
  menu: MenuState;
  onClose: () => void;
  onOpen: (id: string) => void;
  onEquip: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", onClose);
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("pointerdown", onClose);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  // Keep the menu on-screen.
  const style: React.CSSProperties = {
    left: Math.min(menu.x, window.innerWidth - 200),
    top: Math.min(menu.y, window.innerHeight - 170),
  };

  return (
    <div className="rs-ctx" style={style} onPointerDown={(e) => e.stopPropagation()}>
      <div className="rs-ctx-title">{menu.item.name}</div>
      <button type="button" className="rs-ctx-item" onClick={() => { onOpen(menu.item.id); onClose(); }}>
        <i className="fa-solid fa-eye" aria-hidden="true" /> View Item
      </button>
      {/* Send Item is a WIP — see https://github.com/tasandberg/reactor-sheet/issues/16 */}
      <button type="button" className="rs-ctx-item" disabled title="Coming soon">
        <i className="fa-solid fa-gift" aria-hidden="true" /> Send Item
      </button>
      {menu.item.equipped === true && (
        <button type="button" className="rs-ctx-item" onClick={() => { onEquip(menu.item.id); onClose(); }}>
          <i className="fa-solid fa-hand" aria-hidden="true" /> Unequip
        </button>
      )}
      <button type="button" className="rs-ctx-item is-danger" onClick={() => { onDelete(menu.item.id); onClose(); }}>
        <i className="fa-solid fa-trash" aria-hidden="true" /> Delete Item
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function InventoryViewDnd({ inventory, encumbrance, coins, onSetCoin, onEquip, onOpen, onDelete, onSetQty, onReorder, onNest }: Props) {
  // Default to manual order so drag-to-reorder drops stick anywhere in the list.
  const [sort, setSort] = useState<SortState>({ key: "manual", dir: "asc" });
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // containers collapsed by default
  const [groups, setGroups] = useState<Groups>(() => buildGroups(inventory.items, sort));
  const [menu, setMenu] = useState<MenuState | null>(null);

  const openMenu: OnContext = (e, item) => {
    e.preventDefault();
    setMenu({ item, x: e.clientX, y: e.clientY });
  };

  const byId = indexById(inventory.items);
  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  // Root of this sheet's inventory — scope sticky-offset queries here, NOT
  // document-wide, since multiple sheets can be open at once.
  const rootRef = useRef<HTMLElement>(null);
  // Pin the Carried header flush beneath the (also-sticky) Equipped section by
  // writing its measured height to the header's `top`. Recomputed on resize and
  // whenever the equipped tray / carried count change its height.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const eq = root.querySelector<HTMLElement>(".rs-inv-sec--equipped");
    const hd = root.querySelector<HTMLElement>(".rs-inv-sec--carried > .rs-inv-sec-head");
    if (!hd) return;
    const apply = () => {
      hd.style.top = `${eq ? eq.offsetHeight : 0}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    if (eq) ro.observe(eq);
    return () => ro.disconnect();
  }, [inventory.equipped.length, inventory.count]);

  // Cheap structural signature of the inventory data (ids + nesting + order + sort key),
  // computed without sorting. Groups are rebuilt from props only when this changes.
  // Drag no longer mutates groups mid-gesture, so there's nothing to fight here.
  let dataSig = `${sort.key}:${sort.dir}`;
  for (const it of inventory.items) {
    dataSig += `|${it.id},${it.sort}${it.isContainer ? `[${it.children.map((c) => `${c.id},${c.sort}`).join("/")}]` : ""}`;
  }
  useEffect(() => {
    setGroups(buildGroups(inventory.items, sort));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSig]);

  // Persist a freshly-mutated groups map: renumber each group's sorts (i+1)*100 and
  // emit only the items whose order or container actually changed. Same diff the old
  // drag-end used — only the gesture that produces `next` is different now.
  function persist(next: Groups) {
    const origin = originContainers(inventory.items);
    const curOrder = new Map([...byId.values()].map((it) => [it.id, it.sort] as const));
    const reorder: { id: string; sort: number }[] = [];
    for (const [key, ids] of Object.entries(next)) {
      const containerId = groupContainerId(key);
      ids.forEach((id, i) => {
        const order = (i + 1) * 100;
        if (curOrder.get(id) !== order) reorder.push({ id, sort: order });
        if ((origin.get(id) ?? null) !== containerId) onNest(id, containerId);
      });
    }
    if (reorder.length) onReorder(reorder);
  }

  // Commit handlers for the drag hook. Each mutates the local groups immediately
  // (so the dropped item re-renders in place at once) then persists the diff.
  const dnd = useDragReorder({
    onReorder: ({ group, from, to }) => {
      const ids = [...(groupsRef.current[group] ?? [])];
      const [moved] = ids.splice(from, 1);
      if (moved === undefined) return;
      ids.splice(to, 0, moved);
      const next = { ...groupsRef.current, [group]: ids };
      setGroups(next);
      persist(next);
    },
    onNest: ({ fromGroup, from, targetIdx, zone }) => {
      const src = [...(groupsRef.current[fromGroup] ?? [])];
      const [moved] = src.splice(from, 1);
      if (moved === undefined) return;
      const destKey = zone == null ? ROOT : gkey(zone);
      if (destKey === fromGroup) return; // already there
      const dest = [...(groupsRef.current[destKey] ?? [])];
      // Un-nest (zone null) lands at the drop position; nesting appends.
      if (zone == null) dest.splice(targetIdx, 0, moved);
      else dest.push(moved);
      const next = { ...groupsRef.current, [fromGroup]: src, [destKey]: dest };
      setGroups(next);
      persist(next);
    },
  });

  // Click a header: sort asc → desc → back to manual (free reorder).
  const onSort = (key: InventorySortKey) =>
    setSort((cur) => {
      if (cur.key !== key) return { key, dir: SORT_DEFAULT_DIR[key] };
      if (cur.dir === SORT_DEFAULT_DIR[key]) return { key, dir: cur.dir === "asc" ? "desc" : "asc" };
      return { key: "manual", dir: "asc" };
    });

  const toggleCollapse = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sortedTop = sortInventory(inventory.items, sort.key, sort.dir);
  const sortedEquipped = sortInventory(inventory.equipped, sort.key, sort.dir);

  const rootIds = groups[ROOT] ?? [];

  return (
    <section className="rs-inv" ref={rootRef}>
      <div className="rs-inv-head">
        <SectionTitle hint="equip weapons &amp; armour to bring them into play">Inventory</SectionTitle>
      </div>

      {encumbrance.enabled && <EncumbranceBar e={encumbrance} />}

      {inventory.equipped.length > 0 && (
        <section className="rs-inv-sec rs-inv-sec--equipped">
          <SectionCount title="Equipped items" items={inventory.equipped} />
          <EquippedTray items={sortedEquipped} onOpen={onOpen} onContext={openMenu} />
        </section>
      )}

      <section className="rs-inv-sec rs-inv-sec--carried">
        <SectionCount title="All Items" items={sortedTop} />
        <div className="rs-inv-list">
          <SortHeaderRow sort={sort} onSort={onSort} />
          {rootIds.map((id, index) => {
            const item = byId.get(id);
            if (!item) return null;
            return item.isContainer ? (
              <ContainerRow
                key={id}
                item={item}
                index={index}
                childIds={groups[gkey(id)] ?? []}
                byId={byId}
                collapsed={!expanded.has(id)}
                dnd={dnd}
                onToggle={toggleCollapse}
                onEquip={onEquip}
                onOpen={onOpen}
                onSetQty={onSetQty}
                onContext={openMenu}
              />
            ) : (
              <SortableRow key={id} item={item} index={index} group={ROOT} depth={0} dnd={dnd} onEquip={onEquip} onOpen={onOpen} onSetQty={onSetQty} onContext={openMenu} />
            );
          })}
        </div>
      </section>

      {coins.length > 0 && (
        <div className="rs-inv-coin">
          <SectionTitle>Coin</SectionTitle>
          <div className="rs-coins">
            {coins.map((c) => (
              <CoinRow key={c.id} coin={c} onSetCoin={onSetCoin} />
            ))}
          </div>
        </div>
      )}

      {menu && <ItemContextMenu menu={menu} onClose={() => setMenu(null)} onOpen={onOpen} onEquip={onEquip} onDelete={onDelete} />}
    </section>
  );
}
