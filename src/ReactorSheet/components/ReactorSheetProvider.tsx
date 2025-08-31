import { useEffect, useState, type ReactNode } from "react";
import { ReactorSheetContext } from "./context";
import type { OSEActor, ReactorContext } from "../types/types";
import ContextConnector from "@src/applications/context-connector";

function ReactorSheetProvider({
  initialActor,
  children,
  source,
  contextConnector,
}: {
  initialActor: OSEActor;
  source: OSEActor;
  children: ReactNode;
  contextConnector?: ContextConnector<ReactorContext>;
}) {
  const [actor, setActor] = useState<OSEActor>(initialActor);
  const [items, setItems] = useState<Item[]>(initialActor.items.contents);

  useEffect(() => {
    const handleActorUpdate = (updatedActor: Actor) => {
      if (updatedActor._id === actor._id) {
        // @ts-expect-error fuck this
        setActor({
          ...actor,
          ...(updatedActor as OSEActor),
        });
      }
    };

    Hooks.on("updateActor", handleActorUpdate);

    contextConnector.onUpdate(({ document }) => {
      setItems([...document.items.contents]);
    });
  });
  const context = {
    actor,
    source,
    items,
  };

  return (
    <ReactorSheetContext.Provider value={context}>
      {children}
    </ReactorSheetContext.Provider>
  );
}

export default ReactorSheetProvider;
