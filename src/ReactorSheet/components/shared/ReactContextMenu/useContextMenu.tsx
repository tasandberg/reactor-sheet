import { useState } from "react";
import type { ContextMenuItem } from "./types";
import ReactContextMenu from ".";

export default function useContextMenu({
  items,
  ref,
  title,
  boundingElementId = "tab-content-container",
}: {
  items: ContextMenuItem[];
  ref: React.RefObject<HTMLElement>;
  title?: string;
  boundingElementId?: string;
}) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<
    "right" | "left" | "topRight" | "topLeft"
  >("right");

  function showMenu() {
    const container = document.getElementById(boundingElementId);
    const containerRect = container?.getBoundingClientRect();
    const selfRect = ref.current?.getBoundingClientRect();

    const collidesWithRightEdge =
      selfRect.right + 150 > (containerRect?.right || window.innerWidth);
    const collidesWithBottomEdge =
      selfRect.bottom + 200 > containerRect.bottom + container.scrollTop;

    if (collidesWithBottomEdge) {
      if (collidesWithRightEdge) {
        setPosition("topLeft");
      } else {
        setPosition("topRight");
      }
    } else if (collidesWithRightEdge) {
      setPosition("left");
    } else {
      setPosition("right");
    }
    setShow(true);
  }

  function hideMenu() {
    setShow(false);
  }

  return {
    show,
    position: { top: 0, left: 0 },
    showMenu,
    hideMenu,
    Menu: () => (
      <ReactContextMenu
        items={items}
        position={position}
        show={show}
        title={title}
        onHide={hideMenu}
      />
    ),
  };
}
