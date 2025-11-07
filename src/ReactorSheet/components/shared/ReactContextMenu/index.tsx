import styled from "styled-components";
import { MENU_WIDTH, type ContextMenuItem } from "./types";
import { colors, fontSizes } from "../elements-vars";

const ReactContextMenuContainer = styled.div<{
  $top?: string;
  $left?: string;
  $show: boolean;
}>`
  position: absolute;
  display: ${({ $show }) => ($show ? "block" : "none")};
  top: ${({ $top }) => $top || "1rem"};
  left: ${({ $left }) => $left || "1rem"};
  width: ${MENU_WIDTH}px;
  height: ${({ $show }) => ($show ? "auto" : "0")};
  transition: height 0.2s ease-in-out;
  background: ${colors.bgDark};
  border: 1px solid ${colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

const ReactMenuTitle = styled.div`
  padding: 8px 12px;
  font-size: ${fontSizes.medium};
  color: ${colors.hint};
  border-bottom: 1px solid ${colors.border};
`;

const ReactContextMenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: ${fontSizes.small};
  color: ${colors.label};
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }

  i {
    margin-right: 8px;
  }
`;

const positions: Record<string, { $top?: string; $left?: string }> = {
  topRight: {
    $top: `-70px`,
  },
  topLeft: {
    $top: `-70px`,
    $left: `-100px`,
  },
  left: {
    $left: `-100px`,
  },
  right: {
    $left: `1rem`,
  },
};

export default function ReactContextMenu({
  items,
  position = "right",
  show = false,
  title,
  onHide,
}: {
  items: ContextMenuItem[];
  position: "right" | "left" | "topRight" | "topLeft";
  show: boolean;
  title?: string;
  onHide: () => void;
}) {
  const { $top, $left } = positions[position];
  return (
    <ReactContextMenuContainer
      $show={show}
      $top={$top}
      $left={$left}
      onMouseLeave={onHide}
    >
      {title && <ReactMenuTitle>{title}</ReactMenuTitle>}
      {items.map((item) => (
        <ReactContextMenuItem
          key={item.name}
          onClick={() => {
            item.callback();
            onHide();
          }}
        >
          {item.icon && <i className={item.icon}></i>}
          {item.name}
        </ReactContextMenuItem>
      ))}
    </ReactContextMenuContainer>
  );
}
