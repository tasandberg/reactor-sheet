import { Row, TextTiny } from "@src/ReactorSheet/components/shared/elements";
import type { OseItem } from "@src/ReactorSheet/types/types";
import styled from "styled-components";
import { useRef } from "react";
import useContextMenu from "@src/ReactorSheet/components/shared/ReactContextMenu/useContextMenu";
import EquipButton from "../EquipButton";
import itemMenuItems from "./item-menu-items";

const ItemSquareContainer = styled.div<{
  $selected?: boolean;
  $dragging?: boolean;
}>`
  border-radius: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
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

export default function InventoryItem({ item }: { item: OseItem }) {
  const name = item.name as string;
  const ref = useRef<HTMLDivElement>(null);
  const { showMenu, Menu, hideMenu } = useContextMenu({
    ref,
    items: itemMenuItems(item),
    title: name,
  });

  return (
    <>
      <ItemSquareContainer
        onDoubleClick={() => item.sheet.render(true)}
        onContextMenu={showMenu}
        onMouseLeave={hideMenu}
        ref={ref}
      >
        <Row $align="start" className="item-square-inner position-relative">
          <Menu />
          <ItemImg $image={item.img} />
          {item.system.quantity && item.system.quantity.max > 0 && (
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
            {name.substring(0, 8)}
            {name.length > 8 && "..."}
          </TextTiny>
        </Row>
      </ItemSquareContainer>
    </>
  );
}
