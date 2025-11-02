import { Row, TextTiny } from "@src/ReactorSheet/components/shared/elements";
import type { OseItem } from "@src/ReactorSheet/types/types";
import styled from "styled-components";
import { colors } from "@src/ReactorSheet/components/shared/elements-vars";
import { useEffect, useRef, useState, type Dispatch } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import useContextMenu from "@src/ReactorSheet/components/shared/ReactContextMenu/useContextMenu";
import EquipButton from "../EquipButton";
import itemMenuItems from "./item-menu-items";

const ItemSquareContainer = styled.div<{
  $selected?: boolean;
  $dragging?: boolean;
}>`
  border: 1px solid
    ${(props) => (props.$dragging ? colors.border : "transparent")};
  border-radius: 4px;
  position: relative;
  display: flex;
  flex-direction: column;

  ${({ $selected }) =>
    $selected &&
    `
    border: 1px solid ${colors.border};
    grid-column: span 4;
    grid-row: span 3;
  `}
`;

const ItemImg = styled.div<{ $image?: string }>`
  width: 4rem;
  height: 4rem;
  background-image: url(${(props) => props.$image});
  background-size: cover;
  background-position: center;
`;

const IconButton = styled.div`
  position: absolute;
  top: 0px;
  right: 4px;
  font-size: 0.8rem;
`;

const QuantityBadge = ({ current, max }: { current: number; max: number }) => (
  <div
    style={{
      position: "absolute",
      bottom: "2px",
      right: "0px",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      color: "white",
      padding: "1px 4px",
      borderRadius: "3px",
      fontSize: "0.75rem",
    }}
  >
    {current}/{max}
  </div>
);

export default function ItemSquare({
  item,
  idx,
}: {
  item: OseItem;
  select: (id: string) => void;
  isSelected: boolean;
  removeItem: () => void;
  isLast: boolean;
  setItems: Dispatch<React.SetStateAction<OseItem[]>>;
  idx: number;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const name = item.name as string;
  const ref = useRef<HTMLDivElement>(null);
  const { showMenu, Menu, hideMenu } = useContextMenu({
    ref,
    items: itemMenuItems(item),
  });

  useEffect(() => {
    const cleanup = combine(
      draggable({
        element: ref.current,
        onDragStart: () => {
          console.log("drag");
          setIsDragging(true);
        },
        onDrop: () => {
          setIsDragging(false);
        },
        getInitialData: () => ({ item, idx }),
      }),
      dropTargetForElements({
        element: ref.current,
        getData: () => ({ item, idx }),
        getIsSticky: () => true,
      })
    );
    return cleanup;
  });

  return (
    <>
      <ItemSquareContainer
        onDoubleClick={() => item.sheet.render(true)}
        onContextMenu={showMenu}
        onMouseLeave={hideMenu}
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
        $dragging={isDragging}
        ref={ref}
      >
        <Row $align="start" className="item-square-inner position-relative">
          <Menu />
          <ItemImg $image={item.img} />
          {item.system.quantity.max > 0 && (
            <QuantityBadge
              current={item.system.quantity.value}
              max={item.system.quantity.max}
            />
          )}
          <IconButton>
            <EquipButton item={item} />
          </IconButton>
        </Row>
        <Row $justify="center">
          <TextTiny>
            {name.substring(0, 10)}
            {name.length > 10 && "..."}
          </TextTiny>
        </Row>
      </ItemSquareContainer>
    </>
  );
}
