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
} from "../../viewModels/types";
import { sortInventory } from "../../viewModels/inventory";
import { SectionTitle } from "../ui/SectionTitle";
import { Check } from "../ui/Check";
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

// Weapon damage (e.g. "1d4") for the card badge; else the qty/charges.
const cardBadge = (item: InventoryItemVM) =>
  item.meta.match(/^\d*d\d+/)?.[0] ?? (item.quantity ? `${item.quantity.value}/${item.quantity.max}` : "");

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

// Row used inside DragOverlay — no dnd hooks, just visuals.
function InvRowStatic({ item, depth = 0 }: { item: InventoryItemVM; depth?: number }) {
  return (
    <div
      className={cx("rs-inv-row", item.isContainer && "is-container")}
      style={depth > 0 ? ({ "--rs-inv-depth": depth } as React.CSSProperties) : undefined}
    >
      <span className="rs-inv-drag" aria-hidden="true">
        <i className="fa-solid fa-grip-lines" />
      </span>
      <span className="rs-inv-rowcat">{item.category}</span>
      {item.equipped === null ? (
        <span className="rs-inv-equip-spacer" />
      ) : (
        <span className={cx("rs-inv-equip", item.equipped && "checked")} aria-hidden="true" />
      )}
      <span className="rs-inv-name">
        <span className="nm">{item.name}</span>
        {item.quantity && <span className="qty">×{item.quantity.value}</span>}
        {item.meta && <span className="meta">{item.meta}</span>}
      </span>
      <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
    </div>
  );
}

// Droppable container zone — items dragged onto a container header land here.
function ContainerDropZone({ id, isOver }: { id: string; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: `container-drop:${id}` });
  return <div ref={setNodeRef} className={cx("rs-inv-drop-zone", isOver && "is-drop-target")} aria-hidden="true" />;
}

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
        item.isContainer && "is-container",
        isDragging && "is-dragging",
        isDropTarget && "is-drop-target"
      )}
    >
      <button
        type="button"
        className="rs-inv-drag"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <i className="fa-solid fa-grip-lines" aria-hidden="true" />
      </button>
      <span className="rs-inv-rowcat">{item.category}</span>
      {item.equipped === null ? (
        <span className="rs-inv-equip-spacer" />
      ) : (
        <Check
          className="rs-inv-equip"
          checked={item.equipped}
          onChange={() => onEquip(item.id)}
          aria-label={item.equipped ? "Unequip" : "Equip"}
        />
      )}
      <button type="button" className="rs-inv-name" onClick={() => onOpen(item.id)}>
        <span className="nm">{item.name}</span>
        {item.quantity && <span className="qty">×{item.quantity.value}</span>}
        {item.meta && <span className="meta">{item.meta}</span>}
      </button>
      <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
    </div>
  );
}

function ContainerRow({
  item,
  collapsed,
  dropTarget,
  sortKey,
  onToggleCollapse,
  onEquip,
  onOpen,
}: {
  item: InventoryItemVM;
  collapsed: boolean;
  dropTarget: string | null; // id of container being dragged over
  sortKey: InventorySortKey;
  onToggleCollapse: (id: string) => void;
  onEquip: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const isDropTarget = dropTarget === item.id;
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sortedChildren = sortInventory(item.children, sortKey);
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
        <button
          type="button"
          className="rs-inv-drag"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
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
        <span className="rs-inv-rowcat">{item.category}</span>
        {item.equipped === null ? (
          <span className="rs-inv-equip-spacer" />
        ) : (
          <Check
            className="rs-inv-equip"
            checked={item.equipped}
            onChange={() => onEquip(item.id)}
            aria-label={item.equipped ? "Unequip" : "Equip"}
          />
        )}
        <button type="button" className="rs-inv-name" onClick={() => onOpen(item.id)}>
          <span className="nm">{item.name}</span>
          {item.meta && <span className="meta">{item.meta}</span>}
        </button>
        <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
      </div>

      {/* Drop zone overlay on container header when dragging */}
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

export function InventoryView({ inventory, encumbrance, coins, onSetCoin, onEquip, onOpen, onReorder, onNest }: Props) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<InventorySortKey>("category");
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

  const sorted = sortInventory(inventory.items, sortKey);
  const topLevelIds = sorted.map((it) => it.id);

  // Flat lookup: id → item (top-level or nested)
  function findItem(id: UniqueIdentifier): InventoryItemVM | null {
    for (const it of inventory.items) {
      if (it.id === id) return it;
      for (const ch of it.children) {
        if (ch.id === id) return ch;
      }
    }
    return null;
  }

  // Returns container id if id is a child, else null.
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
    // Check if we're over a container-drop zone
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

    // Drop onto a container drop zone → nest
    if (overId.startsWith("container-drop:")) {
      const containerId = overId.slice("container-drop:".length);
      if (activeId !== containerId) {
        onNest(activeId, containerId);
      }
      return;
    }

    // Figure out whether active and over share a parent (top-level or same container)
    const activeParent = findParentContainerId(activeId);
    const overParent = findParentContainerId(overId);

    // Drop a nested item onto an item that has no parent (top-level) → un-nest
    const overItem = findItem(overId);
    if (activeParent && !overParent && !overItem?.isContainer) {
      onNest(activeId, null);
      return;
    }

    // Cross-container drop (child → different container)
    if (activeParent !== overParent && overParent) {
      onNest(activeId, overParent);
      return;
    }

    // Same-list reorder (top-level OR within same container)
    const list = activeParent
      ? (inventory.items.find((it) => it.id === activeParent)?.children ?? [])
      : inventory.items;

    const oldIndex = list.findIndex((it) => it.id === activeId);
    const newIndex = list.findIndex((it) => it.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(list, oldIndex, newIndex);
    const updates = reordered.map((it, i) => ({ id: it.id, sort: (i + 1) * 100 }));
    onReorder(updates);
  }

  return (
    <section className="rs-inv">
      <div className="rs-inv-head">
        <SectionTitle hint="equip weapons &amp; armour to bring them into play">Inventory</SectionTitle>
        <div className="rs-inv-sort" role="group" aria-label="Sort by">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={cx("rs-inv-sort-btn", sortKey === opt.key && "active")}
              onClick={() => setSortKey(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
              {sorted.map((item) =>
                item.isContainer ? (
                  <ContainerRow
                    key={item.id}
                    item={item}
                    collapsed={collapsed.has(item.id)}
                    dropTarget={containerDropTarget}
                    sortKey={sortKey}
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
