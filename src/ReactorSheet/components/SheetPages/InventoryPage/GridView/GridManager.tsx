import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import InventoryItem from "./InventoryItem";
import { arrayMove } from "@dnd-kit/sortable";
import InventoryGridCard from "./InventoryGridCard";
import type { OSEActor, OseItem } from "@src/ReactorSheet/types/types";
import { hydrateItem, updateActorItems, type GridState } from "./grid-utils";
import { Column } from "@src/ReactorSheet/components/shared/elements";
export default function GridManager({
  actorItems,
  gridState,
  actor,
}: {
  actorItems: OseItem[];
  gridState: GridState;
  actor: OSEActor;
}) {
  const [items, setItems] = useState<GridState>(gridState);
  const [activeItem, setActiveItem] = useState<OseItem | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  const { carried, equipped, ...rest } = items;

  // Listen to updates from Foundry data
  useEffect(() => {
    setItems(gridState);
  }, [gridState, setItems]);

  useEffect(() => {
    const debouncedUpdate = foundry.utils.debounce(
      () => updateActorItems(actor, items),
      250
    );
    debouncedUpdate();
  }, [actor, items]);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <Column $gap="lg">
        <InventoryGridCard
          sectionName={"Equipped Items"}
          id={"equipped"}
          items={equipped}
        />
        {/* Containers */}
        {Object.entries(rest).map(([containerId, itemList]) => {
          const container = hydrateItem(actorItems, containerId);
          return (
            <InventoryGridCard
              key={containerId}
              container={container}
              id={containerId}
              items={itemList}
            />
          );
        })}
        <InventoryGridCard
          sectionName={"Carried Items"}
          id={"carried"}
          items={carried}
        />
      </Column>
      <DragOverlay adjustScale={false}>
        {activeItem ? <InventoryItem item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );

  function findContainer(id: UniqueIdentifier | null) {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) =>
      items[key].find((i) => i.id === id)
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveItem(actorItems.find((item) => item.id === id) || null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const { id } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].findIndex(
      (i) => i.id === active.id
    );
    const overIndex = items[overContainer].findIndex((i) => i.id === overId);
    if (activeIndex !== overIndex) {
      setItems((prev) => {
        return {
          ...prev,
          [overContainer]: arrayMove(
            prev[overContainer],
            activeIndex,
            overIndex
          ),
        };
      });
    }
    // debouncedUpdate(actor, items);
    setActiveItem(null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex((item) => item.id === id);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      let newIndex: number;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length;
      } else {
        const isOverLastItem = overIndex === overItems.length - 1;
        const mod = isOverLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + mod : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.id !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex),
        ],
      };
    });
  }
}
