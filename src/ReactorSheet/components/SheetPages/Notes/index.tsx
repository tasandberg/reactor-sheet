import { useReactorSheetContext } from "../../context";
import EditableContent from "./EditableContent";

export default function Notes() {
  const { actor } = useReactorSheetContext();

  return (
    <div className="rs-notes-tab">
      <EditableContent
        title="Notes"
        name="system.details.notes"
        value={actor.system.details.notes}
      />
      <EditableContent
        title="Biography"
        name="system.details.biography"
        value={actor.system.details.biography}
      />
    </div>
  );
}
