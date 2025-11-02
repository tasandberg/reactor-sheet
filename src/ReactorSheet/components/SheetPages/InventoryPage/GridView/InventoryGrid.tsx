import { Column } from "@src/ReactorSheet/components/shared/elements";
import type { OseItem } from "@src/ReactorSheet/types/types";
import styled from "styled-components";
import ItemSquare from "./ItemSquare";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  dropTargetForElements,
  type ElementDropTargetEventBasePayload,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { AnimatePresence } from "framer-motion";
import { motion } from "motion/react";
import { colors } from "@src/ReactorSheet/components/shared/elements-vars";

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
  gap: 4px;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
`;

const ItemPlaceholder = styled.div`
  width: 4rem;
  height: 4rem;
  border: 2px dashed ${colors.border};
  box-sizing: border-box;
`;

export default function InventoryGrid({
  items,
  id,
  updateActorItems,
}: {
  items: OseItem[];
  id: string;
  updateActorItems: (items: OseItem[]) => void;
}) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [itemsCopy, setItemsCopy] = useState<OseItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<OseItem | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [draggedOut, setDraggedOut] = useState(false);

  useEffect(() => {
    const sortedItems = [...items].sort((a, b) => a.sort - b.sort);
    setItemsCopy(sortedItems);
  }, [items]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      throw new Error("ref not set correctly");
    }

    return dropTargetForElements({
      element: el,
      getData: () => ({ id }),
      onDrag: ({ source }) => {
        const item = source.data?.item as OseItem;
        setItemsCopy((prevItems) => prevItems.filter((i) => i.id !== item.id));
        setDraggingItemId(item.id);
      },
      onDrop: (args) => {
        console.log("onDrop", id);
        console.log(args);
        setItemsCopy((prevItems) => {
          const item = args.source.data?.item as OseItem;
          const newItems = prevItems.filter((i) => i.id !== item.id);

          const targetIdx = hoveredItem
            ? newItems.indexOf(hoveredItem)
            : newItems.length;

          newItems.splice(targetIdx, 0, item);
          updateActorItems(newItems);
          return newItems;
        });

        setDraggingItemId(null);
        setHoveredItem(null);
      },
      onDropTargetChange: ({
        location,
        self,
      }: ElementDropTargetEventBasePayload) => {
        setDraggedOut(
          location.current.dropTargets
            .map((dt) => dt.element)
            .includes(self.element) === false
        );
        const i = location.current.dropTargets?.find((dt) => dt.data?.item)
          ?.data?.item as OseItem;

        if (i && i?.id !== hoveredItem?.id) {
          setHoveredItem(i);
        } else {
          setHoveredItem(null);
        }
      },
    });
  });

  const renderPlaceholder = (item: OseItem) =>
    item.id === hoveredItem?.id && item.id !== draggingItemId;

  return (
    <AnimatePresence>
      <Column
        className="inventory-grid"
        style={{
          gap: "8px",
          marginBottom: "16px",
        }}
        ref={ref}
      >
        <ItemGrid>
          {itemsCopy.map((item, idx) => (
            <Fragment key={item.id}>
              {renderPlaceholder(item) && <ItemPlaceholder />}
              <motion.div layout>
                <ItemSquare
                  idx={idx}
                  item={item}
                  isLast={idx === itemsCopy.length - 1}
                  isSelected={selectedItemId === item.id}
                  select={setSelectedItemId}
                  removeItem={() =>
                    setItemsCopy((prev) => prev.filter((i) => i.id !== item.id))
                  }
                  setItems={setItemsCopy}
                />
              </motion.div>
            </Fragment>
          ))}
          {!draggedOut && hoveredItem == null && draggingItemId != null && (
            <ItemPlaceholder />
          )}
          {Array(Math.max(1 - itemsCopy.length, 0))
            .fill(null)
            .map((_, i) => (
              <ItemPlaceholder key={`placeholder-${i}`} />
            ))}
        </ItemGrid>
      </Column>
    </AnimatePresence>
  );
}
