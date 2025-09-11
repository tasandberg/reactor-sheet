import styled from "styled-components";
import Header from "./Header";
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
  grid-template-columns: 30% 70%;
  grid-template-rows: max-content max-content max-content max-content;
  flex-direction: column;
  color: var(--color-text-secondary);

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
      <Info />
      <Header />
      <TabContent />
      <Footer />
    </LayoutComponent>
  );
};
