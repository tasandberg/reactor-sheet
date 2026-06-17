import { Shell, type TabItem } from "./shell";
import { useReactorSheetContext } from "./context";
import { tabs, TabIds } from "./shared/tabs";
import getLabel from "@src/util/getLabel";
import { Topbar, HeaderBand } from "./chrome";
import { ActionsView, SavesExploration } from "./actions";
import { InventoryView } from "./inventory";
import { selectTopbar } from "../viewModels/topbar";
import { selectIdentity } from "../viewModels/identity";
import { selectVitals } from "../viewModels/vitals";
import { selectSaves } from "../viewModels/saves";
import { selectExploration } from "../viewModels/exploration";
import { selectInventory, selectEncumbrance, selectCoins } from "../viewModels/inventory";
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
    if (it && "equipped" in it.system) void it.update({ system: { equipped: !it.system.equipped } });
  };
  const onOpenItem = (id: string) => resolveItem(id)?.sheet?.render(true);
  const onSetCoin = (id: string, value: number) => {
    void resolveItem(id)?.update({ "system.quantity.value": value });
  };

  const onReorder = (u: { id: string; sort: number }[]) =>
    void actor.updateEmbeddedDocuments("Item", u.map((x) => ({ _id: x.id, sort: x.sort })));

  const onNest = (itemId: string, containerId: string | null) =>
    void actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.containerId": containerId ?? "" }]);

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
      railExtra={<SavesExploration saves={selectSaves(actor)} exploration={selectExploration(actor)} tabbed />}
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
          onReorder={onReorder}
          onNest={onNest}
        />
      ) : (
        <activeTab.Content />
      )}
    </Shell>
  );
}
