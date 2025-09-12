import styled from "styled-components";
import Header from "./Header/Header";
import TabContent from "./TabContent";
import Info from "./shared/Info";
import Footer from "./Footer";

const LayoutComponent = styled.div<{ $debug: boolean }>`
  display: grid;
  grid-template-areas:
    "info header"
    "info main"
    "info main"
    "footer footer";
  grid-template-columns: max-content 1fr;
  grid-template-rows: max-content max-content max-content max-content;
  flex-direction: column;
  color: var(--color-text-secondary);
  height: 764px;

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
    <LayoutComponent $debug={true}>
      <Info />
      <Header />
      <TabContent />
      <Footer />
    </LayoutComponent>
  );
};
