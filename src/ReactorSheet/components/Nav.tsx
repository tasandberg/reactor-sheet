import styled from "styled-components";
import { tabs, type TabDef } from "./shared/tabs";
import { useReactorSheetContext } from "./context";
import getLabel from "@src/util/getLabel";
import { colors } from "./shared/elements-vars";
import { TextTiny } from "./shared/elements";

const MIN_WIDTH = "60px";
const MAX_WIDTH = "67px";

const TabsContainer = styled.div`
  position: absolute;
  right: -67px;
  width: 67px;
  height: 390px;
  top: 276px;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  overflow: hidden;
`;

const IconTab = styled.div<{ $active?: boolean }>`
  background-color: ${(props) => (props.$active ? colors.bgDark : "#333")};
  width: ${(props) => (props.$active ? MAX_WIDTH : MIN_WIDTH)};
  display: flex;
  height: 100%;
  flex-grow: 1;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$active ? colors.secondary : colors.label)};
  padding: 1rem;
  z-index: 10;
  border-radius: ${(props) => (props.$active ? "0 8px 8px 0" : "0")};
  transition: 0.2s ease-in-out;

  &:hover div {
    transition: 0.2s ease-in-out;
    color: ${colors.secondary};
  }

  &:first-child {
    border-top-right-radius: 8px;
  }
  &:last-child {
    border-bottom-right-radius: 8px;
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
          onClick={() => handleTabClick(tab)}
        >
          <div className="flex-col gap-0 justyify-center align-center gap-1">
            <i className={tab.icon} />
            <TextTiny style={{ color: "inherit" }}>
              {getLabel(tab.label)}
            </TextTiny>
          </div>
        </IconTab>
      ))}
    </TabsContainer>
  );
}
