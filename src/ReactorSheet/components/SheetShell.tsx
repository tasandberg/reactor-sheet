import { Shell, type TabItem } from "./shell";
import { useReactorSheetContext } from "./context";
import { tabs, TabIds } from "./shared/tabs";
import getLabel from "@src/util/getLabel";

/**
 * Foundry-aware container: maps tabs(actor) → presentational Shell props and
 * mounts the active tab's existing Content page in the right pane.
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

  return (
    <Shell
      tabs={items}
      active={activeTab.id}
      onSelect={(id) => setCurrentTab(id as TabIds)}
    >
      <activeTab.Content />
    </Shell>
  );
}
