import styled, { keyframes } from "styled-components";
import { useReactorSheetContext } from "./context";
import { tabs } from "./shared/tabs";

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
  position: absolute;
  height: 450px;
  left: -1rem;
  right: -1rem;
  top: 0;
  overflow: hidden auto;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 1rem;
  scrollbar-gutter: stable;
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
