import clsx from "clsx";
import "./SheetPages.scss";
import { useLocalSettings } from "@src/util/useLocalSettings";

interface SheetTab {
  label: string;
  id: string | number;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: SheetTab[];
  initialActiveTabId?: string | number;
  onTabChange?: (tabId: string | number) => void;
  className?: string;
}

export const SheetTabs: React.FC<TabsProps> = ({
  tabs,
  onTabChange,
  className = "",
}) => {
  const { sheetSettings, setSetting } = useLocalSettings();
  const activeTabId = sheetSettings.currentPage || tabs[0].id;
  const handleTabClick = (tab: SheetTab) => {
    if (tab.disabled) return;
    setSetting("currentPage", String(tab.id));
    onTabChange?.(tab.id);
  };

  const activeTab = tabs.find((tab) => tab.id === sheetSettings.currentPage);

  return (
    <div className={`reactor-sheet-tabs ${className}`.trim()}>
      <div className="flex-row justify-start pt-4 pb-4 gap-0" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={clsx(`tab-btn w-100`, {
              active: tab.id === activeTabId,
              disabled: tab.disabled,
              "bg-transparent border-transparent": tab.id !== activeTabId,
            })}
            onClick={() => handleTabClick(tab)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={tab.id === activeTabId}
            aria-controls={`tab-panel-${tab.id}`}
            tabIndex={tab.disabled ? -1 : 0}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {activeTab && (
          <div
            id={`tab-panel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab.id}`}
          >
            {activeTab.content}
          </div>
        )}
      </div>
    </div>
  );
};
