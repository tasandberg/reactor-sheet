import { useEffect, useState, type ReactNode } from "react";
import { ReactorSheetContext } from "./context";
import type { OSEActor } from "../types/types";

function ReactorSheetProvider({
  initialActor,
  children,
  source,
}: {
  initialActor: OSEActor;
  source: OSEActor;
  children: ReactNode;
}) {
  const [actor, setActor] = useState<OSEActor>(initialActor);
  const [items, setItems] = useState(initialActor.items);

  useEffect(() => {
    console.log("setup");
    const handleActorUpdate = (updatedActor: Actor) => {
      if (updatedActor._id === actor._id) {
        console.log("updatedActor", updatedActor);
        console.log("actor", actor);
        // @ts-expect-error fuck this
        setActor({
          ...(updatedActor as OSEActor),
          ...actor,
        });
      }
    };

    Hooks.on("updateActor", handleActorUpdate);
    Hooks.on("updateItem", () => {
      console.log("ding");
      setItems(actor.items);
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
