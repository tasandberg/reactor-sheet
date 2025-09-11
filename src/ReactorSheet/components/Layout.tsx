import styled from "styled-components";
import ActorScores from "./ActorScores";
import Header from "./Header";
import TabContent from "./TabContent";

const LayoutComponent = styled.div<{ $debug: boolean }>`
  display: flex;
  flex-direction: column;
  color: var(--color-text-secondary);
  & > *,
  & > * > * {
    outline: ${(props) =>
      props.$debug ? "1px solid rgba(15, 150, 150, 0.5)" : "none"};
  }
`;

export const Layout = () => {
  return (
    <LayoutComponent $debug={false}>
      <Header />
      <ActorScores />
      <TabContent />
    </LayoutComponent>
  );
};
