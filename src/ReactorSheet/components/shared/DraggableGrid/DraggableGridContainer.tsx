import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Row } from "../elements";
import { DraggableGridItem } from "./DraggableGridItem";
import { useDroppable } from "@dnd-kit/core";
import type { OseItem } from "@src/ReactorSheet/types/types";
import DraggableGridItemPlaceholder from "./DraggableGridItemPlaceholder";

export default function DraggableGridContainer({
  id,
  items,
  ItemComponent,
}: {
  id: string;
  items: OseItem[];
  ItemComponent: React.ComponentType<{ item: OseItem }>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <SortableContext
      id={id}
      items={items.map((item) => item.id)}
      strategy={rectSortingStrategy}
    >
      <Row
        $wrap
        ref={setNodeRef}
        $justify="start"
        $align="start"
        style={{
          background: `rgba(#aaa, ${isOver ? 0.5 : 0})`,
          minHeight: "4rem",
        }}
      >
        {items.map((item) => {
          return item ? (
            <DraggableGridItem key={item.id} id={item.id}>
              <ItemComponent item={item} />
            </DraggableGridItem>
          ) : null;
        })}
        {items.length === 0 && !isOver && <DraggableGridItemPlaceholder />}
      </Row>
    </SortableContext>
  );
}
