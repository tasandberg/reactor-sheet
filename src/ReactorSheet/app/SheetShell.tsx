import { useState } from "react";
import { Frame, Topbar, HeaderBand, Minibar, type TabItem } from "@layout";
import { useReactorSheetContext } from "@app/context";
import { EditModal } from "@features/edit/EditModal";
import { tabs, TabIds } from "@app/tabs";
import getLabel from "@src/util/getLabel";
import { ActionsView, SavesExploration } from "@features/actions";
import { InventoryViewDnd as InventoryView } from "@features/inventory";
import { selectTopbar } from "@domain/topbar";
import { selectIdentity } from "@domain/identity";
import { selectVitals } from "@domain/vitals";
import { selectSaves } from "@features/actions/saves";
import { selectExploration, rollExploration } from "@features/actions/exploration";
import { selectInventory, selectEncumbrance, selectCoins } from "@features/inventory/inventory";
import { flagPath, FLAGS, readFlag } from "@domain/flags";
import { useToast } from "@ui/toastContext";
import type { OseItem } from "@domain/types";

/**
 * Foundry-aware container: computes view-models, fills the Shell chrome slots,
 * and mounts the Actions body (other tabs still render their legacy Content).
 */
export default function SheetShell() {
  const { actor, items: invItems, currentTab, setCurrentTab, updateActor } = useReactorSheetContext();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const vitals = selectVitals(actor);
  const onSetHp = (value: number) => {
    const next = Math.max(0, Math.min(vitals.hp.max, value));
    if (next !== vitals.hp.value) void updateActor({ "system.hp.value": next });
  };

  const resolveItem = (id: string) => (invItems as OseItem[]).find((i) => i._id === id);
  const onEquipItem = (id: string) => {
    const it = resolveItem(id);
    if (!it || !("equipped" in it.system)) return;
    const equipped = !it.system.equipped;
    const fromContainerId = (it.system as { containerId?: string }).containerId;
    const update: Record<string, unknown> = { "system.equipped": equipped };
    // Equipping pulls the item out of any container it lives in.
    const leftContainer = equipped && !!fromContainerId;
    if (leftContainer) update["system.containerId"] = "";
    if (equipped) {
      // A newly-equipped item goes to the END of the tray (its own order, set
      // explicitly so it never inherits — and so list reorders never move it).
      const maxEq = (invItems as OseItem[])
        .filter((i) => i._id !== id && !!(i.system as { equipped?: boolean }).equipped)
        .reduce((m, i) => Math.max(m, readFlag<number>(i, FLAGS.equippedOrder) ?? 0), 0);
      update[flagPath(FLAGS.equippedOrder)] = maxEq + 100;
    }
    void it.update(update);
    if (leftContainer) {
      const container = resolveItem(fromContainerId!);
      toast({
        intent: "success",
        title: "Equipped",
        message: `${it.name} equipped — removed from ${container?.name ?? "container"}`,
        icon: <i className="fa-solid fa-hand" aria-hidden="true" />,
      });
    }
  };
  const onOpenItem = (id: string) => resolveItem(id)?.sheet?.render(true);
  const onSetCoin = (id: string, value: number) => {
    void resolveItem(id)?.update({ "system.quantity.value": value });
  };
  // Consume one: decrement the item's quantity (floored at 0).
  const onConsume = (id: string) => {
    const it = resolveItem(id);
    const cur = (it?.system as { quantity?: { value: number } })?.quantity?.value ?? 0;
    if (it && cur > 0) void it.update({ "system.quantity.value": cur - 1 });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const embedUpdate = (updates: object[]) => void (actor as any).updateEmbeddedDocuments("Item", updates);
  // Manual order is stored in our own flag (not Foundry's `sort`, which the core
  // sheet and other modules also write).
  const onReorder = (u: { id: string; sort: number }[]) =>
    embedUpdate(u.map((x) => ({ _id: x.id, [flagPath(FLAGS.order)]: x.sort })));
  // The equipped tray has its own order, stored in a separate flag.
  const onReorderEquipped = (u: { id: string; sort: number }[]) =>
    embedUpdate(u.map((x) => ({ _id: x.id, [flagPath(FLAGS.equippedOrder)]: x.sort })));
  const onNest = (itemId: string, containerId: string | null) => {
    const it = resolveItem(itemId);
    const wasEquipped = !!(it?.system as { equipped?: boolean })?.equipped;
    // Stowing an item in a container also unequips it.
    const update: Record<string, unknown> = { _id: itemId, "system.containerId": containerId ?? "" };
    if (containerId && wasEquipped) update["system.equipped"] = false;
    embedUpdate([update]);
    if (containerId && wasEquipped) {
      const container = resolveItem(containerId);
      toast({
        intent: "warning",
        title: "Unequipped",
        message: `${it?.name} unequipped — stowed in ${container?.name ?? "container"}`,
        icon: <i className="fa-regular fa-hand" aria-hidden="true" />,
      });
    }
  };
  const onDeleteItem = (id: string) => {
    const it = resolveItem(id);
    if (!it) return;
    // Deleting a container: move its contents back to the top level first.
    const kids = (invItems as OseItem[]).filter((c) => (c.system as { containerId?: string }).containerId === id);
    if (kids.length) embedUpdate(kids.map((k) => ({ _id: k._id, "system.containerId": "" })));
    void it.delete();
  };

  const visible = tabs(actor).filter((t) => !t.disabled);
  const items: TabItem[] = visible.map((t) => ({
    id: t.id,
    label: getLabel(t.label),
    icon: <span aria-hidden="true">{t.icon}</span>,
  }));

  const activeTab = visible.find((t) => t.id === currentTab) ?? visible[0];
  if (!activeTab) return null;

  return (
    <>
    <EditModal open={editOpen} onClose={() => setEditOpen(false)} />
    <Frame
      tabs={items}
      active={activeTab.id}
      onSelect={(id) => {
        const next = visible.find((t) => t.id === id);
        if (next) setCurrentTab(next.id);
      }}
      topbar={<Topbar vm={selectTopbar(actor)} onEdit={() => setEditOpen(true)} onLevelUp={() => toast({ intent: "warning", title: "Level Up", message: "Coming soon ;)" })} />}
      header={<HeaderBand identity={selectIdentity(actor)} vitals={vitals} onSetHp={onSetHp} />}
      minibar={<Minibar identity={selectIdentity(actor)} vitals={vitals} onSetHp={onSetHp} />}
      railExtra={
        <SavesExploration
          saves={selectSaves(actor)}
          exploration={selectExploration(actor)}
          onRollSave={(key) => actor.rollSave(key, {})}
          onRollExploration={(key) => rollExploration(actor, key)}
          tabbed
        />
      }
    >
      {activeTab.id === TabIds.ACTIONS ? (
        <ActionsView actor={actor} />
      ) : activeTab.id === TabIds.INVENTORY ? (
        <InventoryView
          inventory={selectInventory(invItems as OseItem[])}
          encumbrance={selectEncumbrance(actor)}
          coins={selectCoins(invItems as OseItem[])}
          onSetCoin={onSetCoin}
          onEquip={onEquipItem}
          onOpen={onOpenItem}
          onDelete={onDeleteItem}
          onConsume={onConsume}
          onReorder={onReorder}
          onReorderEquipped={onReorderEquipped}
          onNest={onNest}
        />
      ) : (
        activeTab.Content && <activeTab.Content />
      )}
    </Frame>
    </>
  );
}
