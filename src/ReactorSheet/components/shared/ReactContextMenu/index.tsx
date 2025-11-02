import styled from "styled-components";
import { MENU_WIDTH, type ContextMenuItem } from "./types";
import { colors } from "../elements-vars";

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

const ReactContextMenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${colors.label};
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }

  i {
    margin-right: 8px;
  }
`;

const positions: Record<string, { $top: string; $left: string }> = {
  top: {
    $top: `-100px`,
    $left: `1rem`,
  },
  bottom: {
    $top: `calc(100% + 0px)`,
    $left: `1rem`,
  },
  left: {
    $top: `1rem`,
    $left: `-100px`,
  },
  right: {
    $top: `1rem`,
    $left: `1rem`,
  },
};

export default function ReactContextMenu({
  items,
  position = "right",
  show = false,
  onHide,
}: {
  items: ContextMenuItem[];
  position: "top" | "left" | "bottom" | "right";
  show: boolean;
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
