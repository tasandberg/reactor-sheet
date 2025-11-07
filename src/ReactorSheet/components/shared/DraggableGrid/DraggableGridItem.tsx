import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { colors } from "../elements-vars";

export function DraggableGridItem({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    minWidth: "4rem",
    border: `1px dashed ${isDragging ? colors.primary : "transparent"}`,
    transform: CSS.Transform.toString(transform),
    cursor: isDragging ? "grabbing" : "pointer",
    transition,
  };

  const innerStyle = {
    opacity: isDragging ? 0 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={innerStyle}>{children}</div>
    </div>
  );
}
