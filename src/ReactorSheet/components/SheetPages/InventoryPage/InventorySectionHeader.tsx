import { useRef } from "react";
import { Row, Text, TextSmall } from "../../shared/elements";
import itemMenuItems from "./GridView/item-menu-items";
import type { OseItem } from "@src/ReactorSheet/types/types";
import useContextMenu from "../../shared/ReactContextMenu/useContextMenu";

export default function InventorySectionHeader({
  img,
  label,
  helperText,
  item,
}: {
  img?: string;
  label: string;
  helperText?: string;
  item: OseItem | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { showMenu, Menu } = useContextMenu({
    ref,
    items: itemMenuItems(item),
    title: item?.name,
  });
  return (
    <Row $align="center" onContextMenu={showMenu}>
      <Row ref={ref} className="position-relative">
        {item && <Menu />}
        {img && (
          <img
            src={img}
            alt={`${label} image`}
            style={{ width: "2rem", height: "2rem" }}
          />
        )}
        <Text>{label}</Text>
      </Row>
      {helperText && (
        <Row $justify="flex-end" $align="center" style={{ flexGrow: 1 }}>
          <TextSmall>{helperText}</TextSmall>
        </Row>
      )}
    </Row>
  );
}
