import styled from "styled-components";
import Header from "./Header";
import TabContent from "./TabContent";
import Footer from "./Footer";

const LayoutComponent = styled.main<{ $debug: boolean }>`
  flex-direction: column;
  color: var(--color-text-secondary);
  height: 100%;
  display: flex;

  & > * {
    outline: ${(props) =>
      props.$debug ? "1px solid rgba(150, 15, 150, 0.8)" : "none"};
  }
  & > * > * {
    outline: ${(props) =>
      props.$debug ? "1px solid rgba(15, 150, 150, 0.5)" : "none"};
  }
`;

export const Layout = () => {
  return (
    <LayoutComponent $debug={false}>
      <Header />
      <TabContent />
      <Footer />
    </LayoutComponent>
  );
};
