import { useState } from "react";
import type { ContextMenuItem } from "./types";
import ReactContextMenu from ".";

export default function useContextMenu({
  items,
  ref,
  boundingElementId = "tab-content-container",
}: {
  items: ContextMenuItem[];
  ref: React.RefObject<HTMLElement>;
  boundingElementId?: string;
}) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<"right" | "left" | "top" | "bottom">(
    "right"
  );

  function showMenu() {
    const container = document.getElementById(boundingElementId);
    const containerRect = container?.getBoundingClientRect();
    const selfRect = ref.current?.getBoundingClientRect();
    if (selfRect.right + 150 > (containerRect?.right || window.innerWidth)) {
      // would overflow right edge
      setPosition("left");
    }
    if (selfRect.bottom + 100 > (containerRect?.bottom || window.innerHeight)) {
      // would overflow bottom edge
      setPosition("top");
    }
    // console.log("showMenu", { selfRect, containerRect });
    setShow(true);
  }

  function hideMenu() {
    setShow(false);
  }

  // console.log("scrollParent", scrollParent?.scrollTop);

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
        onHide={hideMenu}
      />
    ),
  };
}
