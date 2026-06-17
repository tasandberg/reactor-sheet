import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Check } from "../ui/Check";
import { Tag } from "../ui/Tag";
import { cx } from "../ui/cx";

type Ops = {
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
  onReorder: (updates: { id: string; sort: number }[]) => void;
  onNest: (itemId: string, containerId: string | null) => void;
};

type Props = {
  inventory: InventoryVM;
  encumbrance: EncumbranceVM;
  coins: CoinVM[];
  onSetCoin: (id: string, value: number) => void;
} & Ops;

const weightLabel = (w: number) => (w > 0 ? `${w} cn` : "—");

// Grid card badge: damage die if weapon, else qty/charges.
const cardBadge = (item: InventoryItemVM) =>
  item.damage || (item.quantity ? `${item.quantity.value}/${item.quantity.max}` : "");

// ---------------------------------------------------------------------------
// Row content helpers
// ---------------------------------------------------------------------------

function RowEquip({ item, onEquip }: { item: InventoryItemVM; onEquip: (id: string) => void }) {
  if (item.equipped === null) return <span className="rs-inv-equip-spacer" aria-hidden="true" />;
  return (
    <Check
      className="rs-inv-equip"
      checked={item.equipped}
      onChange={() => onEquip(item.id)}
      aria-label={item.equipped ? "Unequip" : "Equip"}
    />
  );
}

function RowTags({ tags }: { tags: InventoryItemVM["tags"] }) {
  if (!tags.length) return <span className="rs-inv-tags" />;
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

// ---------------------------------------------------------------------------
// Static row (DragOverlay — no dnd hooks)
// ---------------------------------------------------------------------------

function InvRowStatic({ item }: { item: InventoryItemVM }) {
  return (
    <div className={cx("rs-inv-row", item.isContainer && "is-container")}>
      <span className="rs-inv-drag" aria-hidden="true">
        <i className="fa-solid fa-grip-lines" />
      </span>
      <span className="rs-inv-equip-spacer" aria-hidden="true" />
      <span className="rs-inv-name">
        <span className="nm">{item.name}</span>
      </span>
      <RowTags tags={item.tags} />
      <span className="rs-inv-rowcat">{item.category}</span>
      <span className="rs-inv-dmg">{item.damage}</span>
      <span className="rs-inv-qty">{item.quantity ? `×${item.quantity.value}` : ""}</span>
      <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drop zone on container header
// ---------------------------------------------------------------------------

function ContainerDropZone({ id, isOver }: { id: string; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: `container-drop:${id}` });
  return <div ref={setNodeRef} className={cx("rs-inv-drop-zone", isOver && "is-drop-target")} aria-hidden="true" />;
}

// ---------------------------------------------------------------------------
// Sortable regular row
// ---------------------------------------------------------------------------

function SortableInvRow({
  item,
  depth,
  isDropTarget,
  onEquip,
  onOpen,
}: {
  item: InventoryItemVM;
  depth: number;
  isDropTarget: boolean;
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(depth > 0 ? ({ "--rs-inv-depth": depth } as React.CSSProperties) : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(
        "rs-inv-row",
        isDragging && "is-dragging",
        isDropTarget && "is-drop-target"
      )}
    >
      <button type="button" className="rs-inv-drag" aria-label="Drag to reorder" {...attributes} {...listeners}>
        <i className="fa-solid fa-grip-lines" aria-hidden="true" />
      </button>
      <RowEquip item={item} onEquip={onEquip} />
      <button type="button" className="rs-inv-name" onClick={() => onOpen(item.id)}>
        <span className="nm">{item.name}</span>
      </button>
      <RowTags tags={item.tags} />
      <span className="rs-inv-rowcat">{item.category}</span>
      <span className="rs-inv-dmg">{item.damage}</span>
      <span className="rs-inv-qty">{item.quantity ? `×${item.quantity.value}` : ""}</span>
      <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Container row (collapse + nested children)
// ---------------------------------------------------------------------------

function ContainerRow({
  item,
  collapsed,
  dropTarget,
  sort,
  onToggleCollapse,
  onEquip,
  onOpen,
}: {
  item: InventoryItemVM;
  collapsed: boolean;
  dropTarget: string | null;
  sort: SortState;
  onToggleCollapse: (id: string) => void;
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const isDropTarget = dropTarget === item.id;
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };

  const sortedChildren = sortInventory(item.children, sort.key, sort.dir);
  const childIds = sortedChildren.map((c) => c.id);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cx(
          "rs-inv-row",
          "is-container",
          isDragging && "is-dragging",
          isDropTarget && "is-drop-target"
        )}
      >
        <button type="button" className="rs-inv-drag" aria-label="Drag to reorder" {...attributes} {...listeners}>
          <i className="fa-solid fa-grip-lines" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cx("rs-inv-collapse", collapsed && "collapsed")}
          aria-label={collapsed ? "Expand" : "Collapse"}
          onClick={() => onToggleCollapse(item.id)}
        >
          <i className="fa-solid fa-chevron-down" aria-hidden="true" />
        </button>
        <button type="button" className="rs-inv-name" onClick={() => onOpen(item.id)}>
          <span className="nm">{item.name}</span>
        </button>
        {/* tags / category / dmg / qty columns — empty for containers */}
        <span className="rs-inv-tags" />
        <span className="rs-inv-rowcat">{item.category}</span>
        <span className="rs-inv-dmg" />
        <span className="rs-inv-qty" />
        <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
      </div>

      <ContainerDropZone id={item.id} isOver={isDropTarget} />

      {!collapsed && sortedChildren.length > 0 && (
        <div className="rs-inv-children">
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            {sortedChildren.map((child) => (
              <SortableInvRow
                key={child.id}
                item={child}
                depth={1}
                isDropTarget={false}
                onEquip={onEquip}
                onOpen={onOpen}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid card (view = "grid")
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

// ---------------------------------------------------------------------------
// Sort control
// ---------------------------------------------------------------------------

type SortState = { key: InventorySortKey; dir: SortDir };

// Grid view uses a compact button group (list view sorts via column headers).
const SORT_OPTIONS: { key: InventorySortKey; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "name", label: "Name" },
  { key: "weight", label: "Weight" },
];

// ---------------------------------------------------------------------------
// Sortable list column headers (table behaviour)
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
  return (
    <button
      type="button"
      className={cx("rs-inv-th", className, active && "active")}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      onClick={() => onSort(col)}
    >
      {label}
      <i
        className={cx("rs-inv-th-caret", "fa-solid", active && (sort.dir === "asc" ? "fa-caret-up" : "fa-caret-down"))}
        aria-hidden="true"
      />
    </button>
  );
}

function SortHeaderRow({ sort, onSort }: { sort: SortState; onSort: (key: InventorySortKey) => void }) {
  return (
    <div className="rs-inv-row rs-inv-headrow" role="row">
      <span aria-hidden="true" /> {/* drag handle col */}
      <SortHeader col="equipped" label={<i className="fa-solid fa-check" aria-label="Equipped" />} className="rs-inv-th-eq" sort={sort} onSort={onSort} />
      <SortHeader col="name" label="Name" className="rs-inv-th-name" sort={sort} onSort={onSort} />
      <span aria-hidden="true" /> {/* tags col */}
      <SortHeader col="category" label="Type" className="rs-inv-th-cat" sort={sort} onSort={onSort} />
      <span aria-hidden="true" /> {/* dmg col */}
      <span aria-hidden="true" /> {/* qty col */}
      <SortHeader col="weight" label="Wt" className="rs-inv-th-wt" sort={sort} onSort={onSort} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coin row
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

// ---------------------------------------------------------------------------
// Encumbrance bar
// ---------------------------------------------------------------------------

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
// Root component
// ---------------------------------------------------------------------------

export function InventoryView({ inventory, encumbrance, coins, onSetCoin, onEquip, onOpen, onReorder, onNest }: Props) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [sort, setSort] = useState<SortState>({ key: "category", dir: "asc" });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<InventoryItemVM | null>(null);
  const [containerDropTarget, setContainerDropTarget] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Click a column header: same column toggles dir, new column uses its natural dir.
  const onSort = (key: InventorySortKey) =>
    setSort((cur) =>
      cur.key === key
        ? { key, dir: cur.dir === "asc" ? "desc" : "asc" }
        : { key, dir: SORT_DEFAULT_DIR[key] },
    );

  const sorted = sortInventory(inventory.items, sort.key, sort.dir);
  const topLevelIds = sorted.map((it) => it.id);

  function findItem(id: UniqueIdentifier): InventoryItemVM | null {
    for (const it of inventory.items) {
      if (it.id === id) return it;
      for (const ch of it.children) {
        if (ch.id === id) return ch;
      }
    }
    return null;
  }

  function findParentContainerId(id: UniqueIdentifier): string | null {
    for (const it of inventory.items) {
      if (it.isContainer && it.children.some((ch) => ch.id === id)) return it.id;
    }
    return null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveItem(findItem(active.id));
  }

  function handleDragOver({ over }: { over: { id: UniqueIdentifier } | null }) {
    if (!over) { setContainerDropTarget(null); return; }
    const overId = String(over.id);
    if (overId.startsWith("container-drop:")) {
      setContainerDropTarget(overId.slice("container-drop:".length));
    } else {
      setContainerDropTarget(null);
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveItem(null);
    setContainerDropTarget(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Drop onto container drop zone → nest
    if (overId.startsWith("container-drop:")) {
      const containerId = overId.slice("container-drop:".length);
      if (activeId !== containerId) onNest(activeId, containerId);
      return;
    }

    const activeParent = findParentContainerId(activeId);
    const overParent = findParentContainerId(overId);
    const overItem = findItem(overId);

    // Nested item dropped on top-level non-container → un-nest
    if (activeParent && !overParent && !overItem?.isContainer) {
      onNest(activeId, null);
      return;
    }

    // Cross-container
    if (activeParent !== overParent && overParent) {
      onNest(activeId, overParent);
      return;
    }

    // Same-list reorder
    const list = activeParent
      ? (inventory.items.find((it) => it.id === activeParent)?.children ?? [])
      : inventory.items;

    const oldIndex = list.findIndex((it) => it.id === activeId);
    const newIndex = list.findIndex((it) => it.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(list, oldIndex, newIndex);
    onReorder(reordered.map((it, i) => ({ id: it.id, sort: (i + 1) * 100 })));
  }

  return (
    <section className="rs-inv">
      <div className="rs-inv-head">
        <SectionTitle hint="equip weapons &amp; armour to bring them into play">Inventory</SectionTitle>
        {view === "grid" && (
          <div className="rs-inv-sort" role="group" aria-label="Sort by">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={cx("rs-inv-sort-btn", sort.key === opt.key && "active")}
                onClick={() => onSort(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        <div className="rs-inv-toggle" role="group" aria-label="View">
          <button
            type="button"
            className={cx("rs-inv-vbtn", view === "list" && "active")}
            aria-label="List view"
            onClick={() => setView("list")}
          >
            <i className="fa-solid fa-list" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cx("rs-inv-vbtn", view === "grid" && "active")}
            aria-label="Grid view"
            onClick={() => setView("grid")}
          >
            <i className="fa-solid fa-table-cells-large" aria-hidden="true" />
          </button>
        </div>
      </div>

      {encumbrance.enabled && <EncumbranceBar e={encumbrance} />}

      {view === "list" ? (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
            <div className="rs-inv-list">
              <SortHeaderRow sort={sort} onSort={onSort} />
              {sorted.map((item) =>
                item.isContainer ? (
                  <ContainerRow
                    key={item.id}
                    item={item}
                    collapsed={collapsed.has(item.id)}
                    dropTarget={containerDropTarget}
                    sort={sort}
                    onToggleCollapse={toggleCollapse}
                    onEquip={onEquip}
                    onOpen={onOpen}
                  />
                ) : (
                  <SortableInvRow
                    key={item.id}
                    item={item}
                    depth={0}
                    isDropTarget={false}
                    onEquip={onEquip}
                    onOpen={onOpen}
                  />
                )
              )}
            </div>
          </SortableContext>
          <DragOverlay adjustScale={false}>
            {activeItem ? <InvRowStatic item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="rs-inv-cards">
          {sorted.map((it) => (
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
    </section>
  );
}
