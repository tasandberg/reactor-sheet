// Inventory list — sortable drag & drop on @dnd-kit/react.
// Behaviour: the whole list is reorderable by dragging; rows rearrange live under
// the cursor (move() in onDragOver) and slide into place on drop (built-in sortable
// transitions). Dragging an item over a container's body nests it; the same groups
// model handles reorder + nest uniformly. The previous core/sortable implementation
// lives in ./InventoryView.tsx and is left intact for comparison.
//
// Row layout (left→right): drag handle · item image · name (+qty) with tags beneath
// · equip checkbox · type · damage · qty · weight.
import { useEffect, useRef, useState } from "react";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import type {
  InventoryVM,
  EncumbranceVM,
  InventoryItemVM,
  CoinVM,
  InventorySortKey,
  SortDir,
} from "../../viewModels/types";
import { sortInventory, SORT_DEFAULT_DIR } from "../../viewModels/inventory";
import { SectionTitle } from "../ui/SectionTitle";
import { Tag } from "../ui/Tag";
import { cx } from "../ui/cx";

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
const cardBadge = (item: InventoryItemVM) =>
  item.damage || (item.quantity ? `${item.quantity.value}/${item.quantity.max}` : "");

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
  collisionPriority,
  onEquip,
  onOpen,
  onSetQty,
  onContext,
}: {
  item: InventoryItemVM;
  index: number;
  group: string;
  depth: number;
  collisionPriority?: number;
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
  onSetQty: (id: string, value: number) => void;
  onContext: OnContext;
}) {
  // No handle: the whole row is draggable. dnd-kit's sensor ignores drags that
  // start on interactive elements (the name/equip/caret buttons), so those stay clickable.
  const { ref, isDragging } = useSortable({ id: item.id, index, group, type: "item", accept: "item", collisionPriority });

  return (
    <div
      ref={ref}
      className={cx("rs-inv-row", "is-sortable", isDragging && "is-dragging")}
      style={depth > 0 ? ({ "--rs-inv-depth": depth } as React.CSSProperties) : undefined}
      onContextMenu={(e) => onContext(e, item)}
    >
      <span className="rs-inv-drag" aria-hidden="true">
        <i className="fa-solid fa-grip-lines" />
      </span>
      <RowInner item={item} onEquip={onEquip} onOpen={onOpen} onSetQty={onSetQty} />
    </div>
  );
}

// A non-draggable row used by the equipped table (same body as the main rows).
function StaticRow({ item, onEquip, onOpen, onSetQty, onContext }: { item: InventoryItemVM; onEquip: (id: string) => void; onOpen: (id: string) => void; onSetQty: (id: string, value: number) => void; onContext: OnContext }) {
  return (
    <div className="rs-inv-row" onContextMenu={(e) => onContext(e, item)}>
      <span className="rs-inv-drag" aria-hidden="true" />
      <RowInner item={item} onEquip={onEquip} onOpen={onOpen} onSetQty={onSetQty} />
    </div>
  );
}

// A dedicated drop zone (shown during a drag) for moving an item out to the top level.
// It sits in empty space below the rows, so it's the only droppable there and reliably
// wins — even when every top-level item is a container.
function RootZone() {
  // High priority so a drop on the zone always un-nests, even if it grazes a container edge.
  const { ref, isDropTarget } = useDroppable({ id: ROOT, collisionPriority: 5 });
  return (
    <div ref={ref} className={cx("rs-inv-rootzone", isDropTarget && "is-over")}>
      <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true" />
      <span>Move out of container</span>
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
  isDropTarget,
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
  isDropTarget: boolean;
  onToggle: (id: string) => void;
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
  onSetQty: (id: string, value: number) => void;
  onContext: OnContext;
}) {
  // Low collision priority on the container's own sortable so that an item hovering it
  // resolves to the nest droppable (priority 3) below, not a reorder-next-to-container.
  const { ref, isDragging } = useSortable({ id: item.id, index, group: ROOT, type: "container", collisionPriority: 1 });
  // The whole container (header + body) is the nest drop zone. Priority 3 beats the
  // container's own sortable (1); the container's children (priority 4) still win for reorder-within.
  // (isDropTarget is driven from onDragOver in the parent for reliable highlighting.)
  const { ref: dropRef } = useDroppable({ id: gkey(item.id), collisionPriority: 3 });
  const count = item.children.length;
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
    <div ref={dropRef} className={cx("rs-inv-container", isDropTarget && "is-drop-target")}>
      <div
        ref={ref}
        className={cx("rs-inv-row", "is-container", "is-sortable", isDragging && "is-dragging")}
        onContextMenu={(e) => onContext(e, item)}
      >
        <span className="rs-inv-drag" aria-hidden="true">
          <i className="fa-solid fa-grip-lines" />
        </span>
        <ItemImage item={item} />
        <NameCell item={item} onOpen={onOpen} badge={<span className="rs-inv-count">({count})</span>} trailing={caret} />
        <RowEquip item={item} onEquip={onEquip} />
        <span className="rs-inv-rowcat">{item.category}</span>
        <span className="rs-inv-dmg" />
        <span className="rs-inv-qty" />
        <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
      </div>

      <div className={cx("rs-inv-children", collapsed && "is-collapsed")}>
        {!collapsed &&
          childIds.map((cid, i) => {
            const child = byId.get(cid);
            return child ? (
              <SortableRow key={cid} item={child} index={i} group={gkey(item.id)} depth={1} collisionPriority={4} onEquip={onEquip} onOpen={onOpen} onSetQty={onSetQty} onContext={onContext} />
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
// Grid card / coin / encumbrance
// ---------------------------------------------------------------------------

function InvCard({ item, onEquip, onOpen }: { item: InventoryItemVM; onEquip: (id: string) => void; onOpen: (id: string) => void }) {
  const badge = cardBadge(item);
  return (
    <div className="rs-inv-card">
      <div className="rs-inv-cardtile">
        <button type="button" className="rs-inv-cardbtn" onClick={() => onOpen(item.id)} aria-label={item.name}>
          {item.img ? <img src={item.img} alt="" /> : <span className="mono">{item.monogram}</span>}
        </button>
        {item.equipped !== null && (
          <button
            type="button"
            className={cx("rs-inv-cardeq", item.equipped && "on")}
            onClick={() => onEquip(item.id)}
            aria-label={item.equipped ? "Unequip" : "Equip"}
          >
            <i className="fa-solid fa-check" aria-hidden="true" />
          </button>
        )}
        {badge && <span className="rs-inv-cardbadge">{badge}</span>}
      </div>
      <span className="rs-inv-cardname">{item.name}</span>
    </div>
  );
}

const SORT_OPTIONS: { key: InventorySortKey; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "name", label: "Name" },
  { key: "weight", label: "Weight" },
];

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
// Collapsible section header (shared by Equipped + Carried Items)
// ---------------------------------------------------------------------------

function SectionHeader({ title, count, collapsed, onToggle }: { title: string; count: number; collapsed: boolean; onToggle: () => void }) {
  return (
    <button type="button" className={cx("rs-inv-sec-head", collapsed && "is-collapsed")} aria-expanded={!collapsed} onClick={onToggle}>
      <i className="rs-inv-sec-caret fa-solid fa-chevron-down" aria-hidden="true" />
      <span className="rs-inv-sec-title">{title}</span>
      <span className="rs-inv-sec-count">{count}</span>
    </button>
  );
}

// Collapsed section view: just the item images, in a horizontal row.
function ImageStrip({
  items,
  showHand,
  onEquip,
  onOpen,
  onContext,
}: {
  items: InventoryItemVM[];
  showHand: boolean;
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
  onContext: OnContext;
}) {
  return (
    <div className="rs-equip-strip">
      {items.map((item) => (
        <div key={item.id} className="rs-equip-tile" onContextMenu={(e) => onContext(e, item)}>
          <button type="button" className="rs-equip-imgbtn" onClick={() => onOpen(item.id)} aria-label={item.name}>
            {item.img ? <img src={item.img} alt="" /> : <span className="mono">{item.monogram}</span>}
          </button>
          {showHand && (
            <button type="button" className="rs-equip-hand" onClick={() => onEquip(item.id)} aria-label="Unequip">
              <i className="fa-solid fa-hand" aria-hidden="true" />
            </button>
          )}
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
  onDelete,
}: {
  menu: MenuState;
  onClose: () => void;
  onOpen: (id: string) => void;
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
  const [view, setView] = useState<"list" | "grid">("list");
  // Default to manual order so drag-to-reorder drops stick anywhere in the list.
  const [sort, setSort] = useState<SortState>({ key: "manual", dir: "asc" });
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // containers collapsed by default
  const [groups, setGroups] = useState<Groups>(() => buildGroups(inventory.items, sort));
  const [equipCollapsed, setEquipCollapsed] = useState(true); // default: images-only strip
  const [carriedCollapsed, setCarriedCollapsed] = useState(false); // carried items shown by default
  const [dropContainerId, setDropContainerId] = useState<string | null>(null); // container highlighted during drag
  const [dragActive, setDragActive] = useState(false); // a drag is in progress (shows the move-out zone)
  const [menu, setMenu] = useState<MenuState | null>(null);

  const openMenu: OnContext = (e, item) => {
    e.preventDefault();
    setMenu({ item, x: e.clientX, y: e.clientY });
  };

  const byId = indexById(inventory.items);
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const draggingRef = useRef(false);
  const prevGroupsRef = useRef(groups);

  // Cheap structural signature of the inventory data (ids + nesting + order + sort key),
  // computed without sorting. The groups are only rebuilt when this actually changes —
  // and never mid-drag, which would fight the optimistic move().
  let dataSig = `${sort.key}:${sort.dir}`;
  for (const it of inventory.items) {
    dataSig += `|${it.id},${it.sort}${it.isContainer ? `[${it.children.map((c) => `${c.id},${c.sort}`).join("/")}]` : ""}`;
  }
  useEffect(() => {
    if (!draggingRef.current) setGroups(buildGroups(inventory.items, sort));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSig]);

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

  function handleDragStart() {
    draggingRef.current = true;
    setDragActive(true);
    prevGroupsRef.current = groupsRef.current;
  }

  function handleDragOver(event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragOver"]>>[0]) {
    setGroups((g) => move(g, event) as Groups);
    // Highlight the container the drag is currently over.
    const targetId = event.operation.target?.id;
    let container: string | null = null;
    if (targetId != null) {
      const s = String(targetId);
      if (s.startsWith("c:")) {
        container = s.slice(2); // over the container body/group droppable
      } else {
        for (const [key, ids] of Object.entries(groupsRef.current)) {
          if (key !== ROOT && ids.includes(s)) { container = groupContainerId(key); break; } // over a child
        }
      }
    }
    setDropContainerId(container);
  }

  function handleDragEnd(event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragEnd"]>>[0]) {
    draggingRef.current = false;
    setDragActive(false);
    setDropContainerId(null);
    if (event.canceled) {
      setGroups(prevGroupsRef.current);
      return;
    }
    const next = groupsRef.current;
    const origin = originContainers(inventory.items);
    const curOrder = new Map(byId.size ? [...byId.values()].map((it) => [it.id, it.sort] as const) : []);
    // Only persist items whose order or container actually changed (not the whole list).
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

  const rootIds = groups[ROOT] ?? [];

  return (
    <section className="rs-inv">
      <div className="rs-inv-head">
        <SectionTitle hint="equip weapons &amp; armour to bring them into play">Inventory</SectionTitle>
        {view === "grid" && (
          <div className="rs-inv-sort" role="group" aria-label="Sort by">
            {SORT_OPTIONS.map((opt) => (
              <button key={opt.key} type="button" className={cx("rs-inv-sort-btn", sort.key === opt.key && "active")} onClick={() => onSort(opt.key)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
        <div className="rs-inv-toggle" role="group" aria-label="View">
          <button type="button" className={cx("rs-inv-vbtn", view === "list" && "active")} aria-label="List view" onClick={() => setView("list")}>
            <i className="fa-solid fa-list" aria-hidden="true" />
          </button>
          <button type="button" className={cx("rs-inv-vbtn", view === "grid" && "active")} aria-label="Grid view" onClick={() => setView("grid")}>
            <i className="fa-solid fa-table-cells-large" aria-hidden="true" />
          </button>
        </div>
      </div>

      {encumbrance.enabled && <EncumbranceBar e={encumbrance} />}

      {view === "list" ? (
        <>
          {inventory.equipped.length > 0 && (
            <section className="rs-inv-sec">
              <SectionHeader title="Equipped" count={inventory.equipped.length} collapsed={equipCollapsed} onToggle={() => setEquipCollapsed((c) => !c)} />
              {equipCollapsed ? (
                <ImageStrip items={inventory.equipped} showHand onEquip={onEquip} onOpen={onOpen} onContext={openMenu} />
              ) : (
                <div className="rs-inv-list">
                  <SortHeaderRow sort={sort} onSort={onSort} />
                  {sortedEquipped.map((item) => (
                    <StaticRow key={item.id} item={item} onEquip={onEquip} onOpen={onOpen} onSetQty={onSetQty} onContext={openMenu} />
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="rs-inv-sec">
            <SectionHeader title="Carried Items" count={inventory.count} collapsed={carriedCollapsed} onToggle={() => setCarriedCollapsed((c) => !c)} />
            {carriedCollapsed ? (
              <ImageStrip items={sortedTop} showHand={false} onEquip={onEquip} onOpen={onOpen} onContext={openMenu} />
            ) : (
              <DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
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
                        isDropTarget={dropContainerId === id}
                        onToggle={toggleCollapse}
                        onEquip={onEquip}
                        onOpen={onOpen}
                        onSetQty={onSetQty}
                        onContext={openMenu}
                      />
                    ) : (
                      <SortableRow key={id} item={item} index={index} group={ROOT} depth={0} onEquip={onEquip} onOpen={onOpen} onSetQty={onSetQty} onContext={openMenu} />
                    );
                  })}
                  {dragActive && <RootZone />}
                </div>
              </DragDropProvider>
            )}
          </section>
        </>
      ) : (
        <div className="rs-inv-cards">
          {sortedTop.map((it) => (
            <InvCard key={it.id} item={it} onEquip={onEquip} onOpen={onOpen} />
          ))}
        </div>
      )}

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

      {menu && <ItemContextMenu menu={menu} onClose={() => setMenu(null)} onOpen={onOpen} onDelete={onDelete} />}
    </section>
  );
}
