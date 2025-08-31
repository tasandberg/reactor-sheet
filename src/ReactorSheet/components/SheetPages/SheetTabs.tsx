import clsx from "clsx";
import React, { useState } from "react";

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
  initialActiveTabId,
  onTabChange,
  className = "",
}) => {
  const getDefaultTabId = () => {
    if (initialActiveTabId !== undefined) return initialActiveTabId;
    const firstEnabled = tabs.find((tab) => !tab.disabled);
    return firstEnabled ? firstEnabled.id : tabs[0]?.id;
  };
  const [activeTabId, setActiveTabId] = useState<string | number | undefined>(
    getDefaultTabId()
  );

  const handleTabClick = (tab: SheetTab) => {
    if (tab.disabled) return;
    setActiveTabId(tab.id);
    onTabChange?.(tab.id);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className={`reactor-sheet-tabs ${className}`.trim()}>
      <div className="flex-row justify-start p-4 gap-0" role="tablist">
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
      <div className="tabs-content p-4">
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
