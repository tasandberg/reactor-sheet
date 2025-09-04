import { useEffect, useState, type ReactNode } from "react";
import { ReactorSheetContext } from "./context";
import type { OSEActor, OseItem, ReactorContext } from "../types/types";
import ContextConnector from "@src/applications/context-connector";
import { useLocalSettings } from "@src/util/useLocalSettings";

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
  const { sheetSettings } = useLocalSettings();

  async function updateActor(updateData: {
    [key: string]: string | number;
  }): Promise<OSEActor | void> {
    if (actor.update) {
      return await actor.update(updateData).then((updatedActor) => {
        // undefined if no change was made
        if (updatedActor) {
          updatedActor.updatedAt = new Date().toISOString();
          setActor(updatedActor);
        }
      });
    } else {
      throw new Error("Actor does not have an update method");
    }
  }

  useEffect(() => {
    contextConnector.onUpdate(
      foundry.utils.debounce(({ document }: { document: OSEActor }) => {
        setItems([...document.items.contents]);
      }, 200)
    );
  });
  const context = {
    actor,
    sheetSettings,
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
