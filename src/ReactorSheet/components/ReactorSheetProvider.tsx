import { useEffect, useState, type ReactNode } from "react";
import { ReactorSheetContext } from "./context";
import type { OSEActor, OseItem, ReactorContext } from "../types/types";
import ContextConnector from "@src/applications/context-connector";
import { TabIds } from "./shared/tabs";

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
  const [actorData, setActorData] = useState(initialActor.system);
  const [items, setItems] = useState<OseItem[]>(
    initialActor.items.contents as OseItem[]
  );
  const [currentTab, setCurrentTab] = useState<TabIds>(TabIds.ACTIONS);

  const _setTimestampedActor = (updatedActor: OSEActor) => {
    updatedActor.updatedAt = new Date().toISOString();
    updatedActor.system.updatedAt = new Date().toISOString();
    setActor(updatedActor);
    setActorData(updatedActor.system);
  };

  async function updateActor(updateData: {
    [key: string]: string | number;
  }): Promise<OSEActor | void> {
    if (actor.update) {
      return await actor.update(updateData).then((updatedActor) => {
        if (updatedActor) {
          _setTimestampedActor(updatedActor);
        }
      });
    } else {
      throw new Error("Actor does not have an update method");
    }
  }

  useEffect(() => {
    contextConnector.onUpdate(
      foundry.utils.debounce(({ document }: { document: OSEActor }) => {
        _setTimestampedActor(document);
        setItems([...(document.items.contents as OseItem[])]);
      }, 200)
    );
  });

  const context = {
    actor,
    actorData,
    source,
    items,
    currentTab,
    setCurrentTab,
    updateActor,
  };

  return (
    <ReactorSheetContext.Provider value={context}>
      {children}
    </ReactorSheetContext.Provider>
  );
}

export default ReactorSheetProvider;
