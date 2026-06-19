import { Shell, type TabItem } from "./shell";
import { useReactorSheetContext } from "./context";
import { tabs, TabIds } from "./shared/tabs";
import getLabel from "@src/util/getLabel";
import { Topbar, HeaderBand } from "./chrome";
import { ActionsView, SavesExploration } from "./actions";
import { InventoryViewDnd as InventoryView } from "./inventory";
import { selectTopbar } from "../viewModels/topbar";
import { selectIdentity } from "../viewModels/identity";
import { selectVitals } from "../viewModels/vitals";
import { selectSaves } from "../viewModels/saves";
import { selectExploration } from "../viewModels/exploration";
import { selectInventory, selectEncumbrance, selectCoins } from "../viewModels/inventory";
import { flagPath, FLAGS } from "../flags";
import type { OseItem } from "../types/types";

/**
 * Foundry-aware container: computes view-models, fills the Shell chrome slots,
 * and mounts the Actions body (other tabs still render their legacy Content).
 */
export default function SheetShell() {
  const { actor, items: invItems, currentTab, setCurrentTab, updateActor } = useReactorSheetContext();

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
    const update: Record<string, unknown> = { system: { equipped } };
    // Equipping pulls the item out of any container it lives in.
    if (equipped && (it.system as { containerId?: string }).containerId) {
      (update.system as Record<string, unknown>).containerId = "";
    }
    void it.update(update);
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
  const onNest = (itemId: string, containerId: string | null) =>
    embedUpdate([{ _id: itemId, "system.containerId": containerId ?? "" }]);
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
    <Shell
      tabs={items}
      active={activeTab.id}
      onSelect={(id) => {
        const next = visible.find((t) => t.id === id);
        if (next) setCurrentTab(next.id);
      }}
      topbar={<Topbar vm={selectTopbar(actor)} />}
      header={<HeaderBand identity={selectIdentity(actor)} vitals={vitals} onSetHp={onSetHp} />}
      railExtra={
        <SavesExploration
          saves={selectSaves(actor)}
          exploration={selectExploration(actor)}
          onRollSave={(key) => actor.rollSave(key, {})}
          onRollExploration={(key) => actor.rollExploration(key, {})}
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
          onNest={onNest}
        />
      ) : (
        <activeTab.Content />
      )}
    </Shell>
  );
}
