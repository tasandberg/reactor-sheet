import styled from "styled-components";
import { tabs, type TabDef } from "./shared/tabs";
import { useReactorSheetContext } from "./context";
import getLabel from "@src/util/getLabel";
import { colors } from "./shared/elements-vars";
import { Text } from "./shared/elements";

const MIN_WIDTH = "35px";
const MAX_WIDTH = "40px";

const TabsContainer = styled.div`
  position: absolute;
  right: -${MAX_WIDTH};
  width: ${MAX_WIDTH};
  height: auto;
  top: 34px;
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
  height: 100px;
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
  const { currentTab, setCurrentTab, actor } = useReactorSheetContext();
  const activeTabId = currentTab;

  const handleTabClick = (tab: TabDef) => {
    if (tab.disabled) return;
    setCurrentTab(tab.id);
  };

  return (
    <TabsContainer>
      {tabs(actor)
        .filter((tab) => !tab.disabled)
        .map((tab) => (
          <IconTab
            key={tab.label}
            $active={tab.id === activeTabId}
            onClick={() => handleTabClick(tab)}
          >
            <div
              className="flex-row gap-0 justify-center align-center gap-1"
              style={{
                transform: "rotate(90deg)",
              }}
            >
              <i className={tab.icon} />
              <Text style={{ color: "inherit" }}>{getLabel(tab.label)}</Text>
            </div>
          </IconTab>
        ))}
    </TabsContainer>
  );
}
