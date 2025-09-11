import styled from "styled-components";
import { tabs, type TabDef } from "./shared/tabs";
import { useReactorSheetContext } from "./context";

const TabsContainer = styled.div`
  position: absolute;
  height: 500px;
  width: 80px;
  right: -80px;
  top: calc(50% - 250px);
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: 0.5rem;
`;

const IconTab = styled.div<{ $active?: boolean }>`
  background-color: var(--background);
  border-radius: 0 0.5rem 0.5rem 0;
  opacity: ${(props) => (props.$active ? 1 : 0.9)};
  border-left: none;
  width: ${(props) => (props.$active ? "45px" : "40px")};
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  padding: 1rem;
  border-top: 2px double;
  border-right: 2px double;
  border-bottom: 2px double;
  border-color: var(
    ${(props) => (props.$active ? "--color-text-secondary" : "--color-border")}
  );
  transition: width 0.2s ease-in-out, opacity 0.2s ease-in-out;

  &:hover {
    width: 45px;
  }
`;

export default function Nav() {
  const { currentTab, setCurrentTab } = useReactorSheetContext();
  const activeTabId = currentTab;

  const handleTabClick = (tab: TabDef) => {
    if (tab.disabled) return;
    setCurrentTab(tab.id);
  };

  return (
    <TabsContainer>
      {tabs.map((tab) => (
        <IconTab
          key={tab.label}
          $active={tab.id === activeTabId}
          data-tooltip={tab.label}
          onClick={() => handleTabClick(tab)}
        >
          <i className={tab.icon} />
        </IconTab>
      ))}
    </TabsContainer>
  );
}
