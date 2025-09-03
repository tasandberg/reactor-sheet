import { useEffect, useState, type ReactNode } from "react";
import { ReactorSheetContext } from "./context";
import type { OSEActor, OseItem, ReactorContext } from "../types/types";
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
  const [items, setItems] = useState<OseItem[]>(initialActor.items.contents);

  async function updateActor(updateData: {
    [key: string]: string | number;
  }): Promise<OSEActor | void> {
    if (actor.update) {
      return await actor.update(updateData).then((updatedActor) => {
        if (updatedActor) setActor(updatedActor);
      });
    } else {
      throw new Error("Actor does not have an update method");
    }
  }

  useEffect(() => {
    contextConnector.onUpdate(
      foundry.utils.debounce(({ document }: { document: OSEActor }) => {
        console.log("context update");
        // setActor(document as OSEActor);
        setItems([...document.items.contents]);
      }, 200)
    );
  });
  const context = {
    actor,
    source,
    items,
    updateActor,
  };
  return (
    <ReactorSheetContext.Provider value={context}>
      {children}
    </ReactorSheetContext.Provider>
  );
}

export default ReactorSheetProvider;
