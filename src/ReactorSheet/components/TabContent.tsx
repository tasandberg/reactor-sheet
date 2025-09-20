import styled, { keyframes } from "styled-components";
import { useReactorSheetContext } from "./context";
import { tabs } from "./shared/tabs";

const CONTENT_HEIGHT = "400px";
const FadeTransition = keyframes`
  0% {
    display: none;
    transform: translateX(-15px);
  }
  1% {
    display: block;
    opacity: 0;
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const TabsContainer = styled.div`
  grid-area: main;
  position: absolute;
  height: ${CONTENT_HEIGHT};
  top: 0;
  right: 0;
  left: 0;
  overflow: hidden auto;
  padding: 1rem;
  scrollbar-gutter: stable;
  padding-bottom: 100px;
  z-index: 0;
`;

const TabWrapper = styled.div<{ $active?: boolean }>`
  animation: ${(props) => (props.$active ? FadeTransition : "none")} 0.3s ease;
`;

export default function TabContent() {
  const { currentTab } = useReactorSheetContext();

  return (
    <div
      style={{
        position: "relative",
        gridArea: "main",
        height: CONTENT_HEIGHT,
        backgroundColor: "#222",
        flexGrow: 1,
      }}
    >
      <TabsContainer>
        {tabs.map((tab) => (
          <TabWrapper key={tab.id + "-content"} $active={tab.id === currentTab}>
            {tab.id === currentTab && <tab.Content />}
          </TabWrapper>
        ))}
      </TabsContainer>
    </div>
  );
}
