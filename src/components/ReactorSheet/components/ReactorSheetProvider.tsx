import { useEffect, useState, type ReactNode } from "react";
import { ReactorSheetContext } from "./context";
import type { OSEActor } from "./types/types";

function ReactorSheetProvider({
  actor,
  children,
  source,
}: {
  actor: OSEActor;
  source: OSEActor;
  children: ReactNode;
}) {
  const [enrichedContent, setEnrichedContent] = useState<{
    notes?: string;
    biography?: string;
  }>({});

  useEffect(() => {
    const fetchEnrichedContent = async () => {
      const notes = await foundry.applications.ux.TextEditor.enrichHTML(
        actor.system.details.notes || "",
        { secrets: true }
      );
      const biography = await foundry.applications.ux.TextEditor.enrichHTML(
        actor.system.details.biography || "",
        { secrets: true }
      );
      setEnrichedContent({ notes, biography });
    };
    fetchEnrichedContent();
  }, [actor]);

  return (
    <ReactorSheetContext.Provider value={{ actor, enrichedContent, source }}>
      {children}
    </ReactorSheetContext.Provider>
  );
}

export default ReactorSheetProvider;
