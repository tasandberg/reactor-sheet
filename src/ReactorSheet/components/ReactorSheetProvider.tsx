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

  useEffect(() => {
    console.log("setup");
    const handleUpdate = (updatedActor: Actor) => {
      if (updatedActor._id === actor._id) {
        // @ts-expect-error fuck this
        setActor({
          ...actor,
          ...(updatedActor as OSEActor),
        });
      }
    };
    Hooks.on("updateActor", handleUpdate);
  });
  const context = {
    actor,
    source,
  };

  return (
    <ReactorSheetContext.Provider value={context}>
      {children}
    </ReactorSheetContext.Provider>
  );
}

export default ReactorSheetProvider;
