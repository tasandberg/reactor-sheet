import { Shell, type TabItem } from "./shell";
import { useReactorSheetContext } from "./context";
import { tabs, TabIds } from "./shared/tabs";
import getLabel from "@src/util/getLabel";
import { Topbar, IdentityHeader, Vitals, SubStats } from "./chrome";
import { ActionsView, SavesExploration } from "./actions";
import { selectTopbar } from "../viewModels/topbar";
import { selectIdentity } from "../viewModels/identity";
import { selectVitals } from "../viewModels/vitals";
import { selectSaves } from "../viewModels/saves";
import { selectExploration } from "../viewModels/exploration";

/**
 * Foundry-aware container: computes view-models, fills the Shell chrome slots,
 * and mounts the Actions body (other tabs still render their legacy Content).
 */
export default function SheetShell() {
  const { actor, currentTab, setCurrentTab } = useReactorSheetContext();

  const visible = tabs(actor).filter((t) => !t.disabled);
  const items: TabItem[] = visible.map((t) => ({
    id: t.id,
    label: getLabel(t.label),
    icon: <i className={t.icon} aria-hidden="true" />,
  }));

  const activeTab = visible.find((t) => t.id === currentTab) ?? visible[0];
  if (!activeTab) return null;

  const vitals = selectVitals(actor);

  return (
    <Shell
      tabs={items}
      active={activeTab.id}
      onSelect={(id) => {
        const next = visible.find((t) => t.id === id);
        if (next) setCurrentTab(next.id);
      }}
      topbar={<Topbar vm={selectTopbar(actor)} />}
      header={<IdentityHeader vm={selectIdentity(actor)} />}
      vitals={<Vitals vm={vitals} />}
      subStats={<SubStats vm={vitals} />}
      railExtra={<SavesExploration saves={selectSaves(actor)} exploration={selectExploration(actor)} />}
    >
      {activeTab.id === TabIds.ACTIONS ? <ActionsView actor={actor} /> : <activeTab.Content />}
    </Shell>
  );
}
