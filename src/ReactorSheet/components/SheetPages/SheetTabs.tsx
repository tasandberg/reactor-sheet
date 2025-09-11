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
